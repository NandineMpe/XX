"""Query routing endpoints with guidance lens support."""

import json
import logging
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Literal, Optional, Set

from fastapi import APIRouter, Depends, HTTPException
from lightrag.base import QueryParam
from ..utils_api import get_combined_auth_dependency
from pydantic import BaseModel, Field, field_validator

from ascii_colors import trace_exception

router = APIRouter(tags=["query"])


class LensConfig(BaseModel):
    """Connector-style lens configuration provided by the UI."""

    smart_routing: bool = Field(
        default=True,
        description="Enable automatic source routing based on query intent",
    )
    include_ifrs: bool = Field(default=True, description="Include IFRS / IAS documents")
    include_gaap: bool = Field(default=True, description="Include US GAAP documents")
    include_firm_guidance: bool = Field(
        default=True, description="Include firm guidance and procedures"
    )


class QueryRequest(BaseModel):
    query: str = Field(
        min_length=1,
        description="The query text",
    )

    mode: Literal["local", "global", "hybrid", "naive", "mix", "bypass"] = Field(
        default="hybrid",
        description="Query mode",
    )

    only_need_context: Optional[bool] = Field(
        default=None,
        description="If True, only returns the retrieved context without generating a response.",
    )

    only_need_prompt: Optional[bool] = Field(
        default=None,
        description="If True, only returns the generated prompt without producing a response.",
    )

    response_type: Optional[str] = Field(
        min_length=1,
        default=None,
        description="Defines the response format. Examples: 'Multiple Paragraphs', 'Single Paragraph', 'Bullet Points'.",
    )

    top_k: Optional[int] = Field(
        ge=1,
        default=None,
        description="Number of top items to retrieve. Represents entities in 'local' mode and relationships in 'global' mode.",
    )

    max_token_for_text_unit: Optional[int] = Field(
        gt=1,
        default=None,
        description="Maximum number of tokens allowed for each retrieved text chunk.",
    )

    max_token_for_global_context: Optional[int] = Field(
        gt=1,
        default=None,
        description="Maximum number of tokens allocated for relationship descriptions in global retrieval.",
    )

    max_token_for_local_context: Optional[int] = Field(
        gt=1,
        default=None,
        description="Maximum number of tokens allocated for entity descriptions in local retrieval.",
    )

    conversation_history: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Stores past conversation history to maintain context. Format: [{'role': 'user/assistant', 'content': 'message'}].",
    )

    history_turns: Optional[int] = Field(
        ge=0,
        default=None,
        description="Number of complete conversation turns (user-assistant pairs) to consider in the response context.",
    )

    ids: list[str] | None = Field(
        default=None, description="List of ids to filter the results."
    )

    user_prompt: Optional[str] = Field(
        default=None,
        description="User-provided prompt for the query. If provided, this will be used instead of the default value from prompt template.",
    )

    lens: Optional[LensConfig] = Field(
        default=None,
        description="Guidance lens configuration mirroring connector toggles.",
    )

    @field_validator("query", mode="after")
    @classmethod
    def query_strip_after(cls, query: str) -> str:
        return query.strip()

    @field_validator("conversation_history", mode="after")
    @classmethod
    def conversation_history_role_check(
        cls, conversation_history: List[Dict[str, Any]] | None
    ) -> List[Dict[str, Any]] | None:
        if conversation_history is None:
            return None
        for msg in conversation_history:
            if "role" not in msg or msg["role"] not in {"user", "assistant"}:
                raise ValueError(
                    "Each message must have a 'role' key with value 'user' or 'assistant'."
                )
        return conversation_history

    def to_query_params(self, is_stream: bool) -> "QueryParam":
        """Converts a QueryRequest instance into a QueryParam instance."""
        # Use Pydantic's `.model_dump(exclude_none=True)` to remove None values automatically
        request_data = self.model_dump(exclude_none=True, exclude={"query", "lens"})

        # Ensure `mode` and `stream` are set explicitly
        param = QueryParam(**request_data)
        param.stream = is_stream
        return param


class QueryResponse(BaseModel):
    response: str = Field(
        description="The generated response",
    )
    lens_mode: Optional[str] = Field(
        default=None, description="Lens mode that was applied for this answer"
    )
    document_types: Optional[List[str]] = Field(
        default=None, description="Document types retrieved for the answer"
    )
    sources_used: Optional[List[str]] = Field(
        default=None, description="Enabled source connectors during retrieval"
    )


DOCUMENT_TYPE_ALIASES: Dict[str, List[str]] = {
    "ifrs": ["ifrs_ias"],
    "gaap": ["us_gaap"],
    "standards": ["ifrs_ias", "us_gaap"],
    "firm": ["firm_guidance"],
    "pipeline": ["standards_pipeline"],
}

ALL_KNOWN_SOURCES = ["ifrs", "gaap", "firm"]

IFRS_KEYWORDS = (
    "ifrs",
    "ias",
    "iasb",
    "international accounting standard",
)

GAAP_KEYWORDS = (
    "us gaap",
    "gaap",
    "fasb",
)

FIRM_KEYWORDS = (
    "audit procedure",
    "testing steps",
    "how do we audit",
    "workpaper",
    "firm guidance",
    "methodology",
    "internal control testing",
)


@dataclass
class LensResolution:
    mode: str
    document_types: List[str]
    enabled_sources: List[str]


def _auto_detect_sources(query: str) -> Set[str]:
    lowered = query.lower()
    include: Set[str] = set()

    if any(keyword in lowered for keyword in IFRS_KEYWORDS) or re.search(
        r"ias\s*\d+", lowered
    ):
        include.add("ifrs")

    if any(keyword in lowered for keyword in GAAP_KEYWORDS) or re.search(
        r"asc\s*\d{3}(?:-\d{2})*", lowered
    ):
        include.add("gaap")

    if any(keyword in lowered for keyword in FIRM_KEYWORDS):
        include.add("firm")

    if "pipeline" in lowered or "mermaid" in lowered:
        include.add("pipeline")

    if not include:
        include.update(ALL_KNOWN_SOURCES)

    return include


def resolve_lens_settings(query: str, lens: Optional[LensConfig]) -> LensResolution:
    if lens and not lens.smart_routing:
        enabled = []
        if lens.include_ifrs:
            enabled.append("ifrs")
        if lens.include_gaap:
            enabled.append("gaap")
        if lens.include_firm_guidance:
            enabled.append("firm")

        if not enabled:
            enabled = list(ALL_KNOWN_SOURCES)

        mode = "manual"
    else:
        enabled = sorted(_auto_detect_sources(query))
        mode = "auto"

    # Map enabled sources to document types
    doc_types: Set[str] = set()
    for source in enabled:
        doc_types.update(DOCUMENT_TYPE_ALIASES.get(source, []))

    return LensResolution(
        mode=mode,
        document_types=sorted(doc_types),
        enabled_sources=enabled,
    )


def create_query_routes(rag, api_key: Optional[str] = None, top_k: int = 60):
    combined_auth = get_combined_auth_dependency(api_key)

    @router.post(
        "/query", response_model=QueryResponse, dependencies=[Depends(combined_auth)]
    )
    async def query_text(request: QueryRequest):
        """
        Handle a POST request at the /query endpoint to process user queries using RAG capabilities.

        Parameters:
            request (QueryRequest): The request object containing the query parameters.
        Returns:
            QueryResponse: A Pydantic model containing the result of the query processing.
                       If a string is returned (e.g., cache hit), it's directly returned.
                       Otherwise, an async generator may be used to build the response.

        Raises:
            HTTPException: Raised when an error occurs during the request handling process,
                       with status code 500 and detail containing the exception message.
        """
        try:
            lens_resolution = resolve_lens_settings(request.query, request.lens)
            param = request.to_query_params(False)
            param.lens_mode = lens_resolution.mode
            param.include_document_types = lens_resolution.document_types
            param.lens_sources = lens_resolution.enabled_sources
            response = await rag.aquery(request.query, param=param)

            # If response is a string (e.g. cache hit), return directly
            if isinstance(response, str):
                return QueryResponse(
                    response=response,
                    lens_mode=param.lens_mode,
                    document_types=param.include_document_types or None,
                    sources_used=lens_resolution.enabled_sources,
                )

            if isinstance(response, dict):
                result = json.dumps(response, indent=2)
                return QueryResponse(
                    response=result,
                    lens_mode=param.lens_mode,
                    document_types=param.include_document_types or None,
                    sources_used=lens_resolution.enabled_sources,
                )
            else:
                return QueryResponse(
                    response=str(response),
                    lens_mode=param.lens_mode,
                    document_types=param.include_document_types or None,
                    sources_used=lens_resolution.enabled_sources,
                )
        except Exception as e:
            trace_exception(e)
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/query/stream", dependencies=[Depends(combined_auth)])
    async def query_text_stream(request: QueryRequest):
        """
        This endpoint performs a retrieval-augmented generation (RAG) query and streams the response.

        Args:
            request (QueryRequest): The request object containing the query parameters.
            optional_api_key (Optional[str], optional): An optional API key for authentication. Defaults to None.

        Returns:
            StreamingResponse: A streaming response containing the RAG query results.
        """
        try:
            lens_resolution = resolve_lens_settings(request.query, request.lens)
            param = request.to_query_params(True)
            param.lens_mode = lens_resolution.mode
            param.include_document_types = lens_resolution.document_types
            param.lens_sources = lens_resolution.enabled_sources
            response = await rag.aquery(request.query, param=param)

            from fastapi.responses import StreamingResponse

            async def stream_generator():
                if isinstance(response, str):
                    # If it's a string, send it all at once
                    yield f"{json.dumps({'response': response})}\n"
                else:
                    # If it's an async generator, send chunks one by one
                    try:
                        async for chunk in response:
                            if chunk:  # Only send non-empty content
                                yield f"{json.dumps({'response': chunk})}\n"
                    except Exception as e:
                        logging.error(f"Streaming error: {str(e)}")
                        yield f"{json.dumps({'error': str(e)})}\n"

            return StreamingResponse(
                stream_generator(),
                media_type="application/x-ndjson",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Content-Type": "application/x-ndjson",
                    "X-Accel-Buffering": "no",  # Ensure proper handling of streaming response when proxied by Nginx
                    "X-Lens-Mode": param.lens_mode,
                    "X-Lens-Sources": ",".join(lens_resolution.enabled_sources),
                },
            )
        except Exception as e:
            trace_exception(e)
            raise HTTPException(status_code=500, detail=str(e))

    return router
