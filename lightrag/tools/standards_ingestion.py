"""Utilities for domain-aware ingestion of accounting standards and firm guidance.

This module implements a lightweight, rule-based pipeline that mirrors the
steps captured in ``Document Ingestion Pipeline for standards.mermaid``.

The processor performs:

1. Document classification (IFRS/IAS, US GAAP, firm guidance, pipeline specs).
2. Hierarchical section parsing based on numbering conventions.
3. Smart chunking that preserves section boundaries.
4. Chunk-level labelling (e.g. Principle, Requirement, Disclosure).
5. Metadata extraction (topics, keywords, references, section path, etc.).
6. Context enrichment by prepending hierarchical headers to each chunk.
7. Quality checks to drop very small/noisy chunks (except for pipeline specs).

The resulting chunks are returned in a structure that can be ingested directly
by :class:`lightrag.lightrag.LightRAG`.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Sequence, Tuple

import itertools
import re
from collections import Counter

from lightrag.utils import logger


class DocumentType(Enum):
    """Supported document families for specialised ingestion."""

    IFRS = "ifrs_ias"
    US_GAAP = "us_gaap"
    FIRM_GUIDANCE = "firm_guidance"
    PIPELINE = "standards_pipeline"
    GENERIC = "generic"


@dataclass
class Section:
    """Represents a logical section extracted from a source document."""

    identifier: str
    title: str
    level: int
    content: List[str] = field(default_factory=list)
    parent_titles: List[str] = field(default_factory=list)

    def add_line(self, line: str) -> None:
        line = line.rstrip()
        if line:
            self.content.append(line)

    @property
    def text(self) -> str:
        return "\n".join(self.content).strip()

    @property
    def path(self) -> str:
        titles = [*self.parent_titles, self.title]
        clean_titles = [title.strip() for title in titles if title and title.strip()]
        return " > ".join(clean_titles)


@dataclass
class ProcessedChunk:
    """Structured representation of a processed chunk."""

    content: str
    tokens: int
    chunk_order_index: int
    metadata: Dict[str, Any]


@dataclass
class ProcessedDocument:
    """Return payload for a fully processed document."""

    document_type: DocumentType
    chunks: List[ProcessedChunk]
    document_metadata: Dict[str, Any]


STOPWORDS: set[str] = {
    "the",
    "and",
    "for",
    "with",
    "that",
    "from",
    "this",
    "shall",
    "should",
    "will",
    "would",
    "into",
    "each",
    "when",
    "more",
    "than",
    "such",
    "have",
    "been",
    "within",
    "where",
    "which",
    "their",
    "they",
    "there",
    "here",
    "after",
    "before",
    "during",
    "including",
    "include",
    "among",
    "other",
    "others",
    "per",
    "its",
    "those",
    "also",
    "shall",
    "must",
    "may",
    "might",
    "been",
}


class StandardsDocumentProcessor:
    """Domain-aware ingestion pipeline for standards and firm guidance."""

    def __init__(
        self,
        tokenizer,
        chunk_token_size: int,
        chunk_overlap_token_size: int,
        min_chunk_tokens: int = 40,
    ) -> None:
        self.tokenizer = tokenizer
        self.chunk_token_size = chunk_token_size
        self.chunk_overlap_token_size = chunk_overlap_token_size
        self.min_chunk_tokens = min_chunk_tokens

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def process_document(
        self, content: str, file_path: str | None = None
    ) -> Optional[ProcessedDocument]:
        """Process a document and return structured chunks.

        Args:
            content: Raw textual content extracted from the source file.
            file_path: Optional source identifier (filename).

        Returns:
            ProcessedDocument or ``None`` if the document should be handled
            by the generic LightRAG pipeline.
        """

        document_type = self._classify_document(content, file_path)
        if document_type is DocumentType.GENERIC:
            return None

        # Determine sections according to document type
        sections = self._parse_sections(content, document_type)
        if not sections:
            logger.debug(
                "Standards processor: no structured sections found, falling back to generic pipeline."
            )
            return None

        chunks = self._build_chunks(sections, document_type)
        if not chunks:
            logger.warning(
                "Standards processor: skipped document because no quality chunks passed checks."
            )
            return None

        document_metadata = {
            "document_type": document_type.value,
            "section_count": len(sections),
            "ingestion_strategy": "standards_pipeline",
        }
        if file_path:
            document_metadata["source_file"] = file_path

        # Add graph specific metadata if available
        if document_type is DocumentType.PIPELINE:
            graph_meta = self._extract_pipeline_metadata(content)
            if graph_meta:
                document_metadata.update(graph_meta)

        return ProcessedDocument(
            document_type=document_type,
            chunks=chunks,
            document_metadata=document_metadata,
        )

    # ------------------------------------------------------------------
    # Classification
    # ------------------------------------------------------------------
    def _classify_document(self, content: str, file_path: str | None) -> DocumentType:
        lowered = content.lower()
        file_hint = (file_path or "").lower()

        if file_hint.endswith(".mermaid") or "graph tb" in lowered:
            return DocumentType.PIPELINE

        if any(
            keyword in lowered
            for keyword in ("ifrs", "iasb", "international accounting standard")
        ):
            return DocumentType.IFRS

        if (
            re.search(r"asc\s*\d{3}(?:-\d{2})*", lowered)
            or "accounting standards codification" in lowered
        ):
            return DocumentType.US_GAAP

        if any(
            keyword in lowered
            for keyword in ("firm guidance", "methodology", "playbook", "procedure")
        ):
            return DocumentType.FIRM_GUIDANCE

        return DocumentType.GENERIC

    # ------------------------------------------------------------------
    # Section parsing
    # ------------------------------------------------------------------
    def _parse_sections(
        self, content: str, document_type: DocumentType
    ) -> List[Section]:
        if document_type is DocumentType.IFRS:
            return self._parse_ifrs_sections(content)
        if document_type is DocumentType.US_GAAP:
            return self._parse_us_gaap_sections(content)
        if document_type is DocumentType.FIRM_GUIDANCE:
            return self._parse_firm_guidance_sections(content)
        if document_type is DocumentType.PIPELINE:
            return self._parse_pipeline_sections(content)
        return []

    def _parse_ifrs_sections(self, content: str) -> List[Section]:
        lines = content.splitlines()
        sections: List[Section] = []
        stack: List[Section] = []

        heading_pattern = re.compile(
            r"^\s*(?:(IAS|IFRS)\s*(?P<stdnum>\d+))|(?P<para>\d+(?:\.\d+)+)\b"
        )

        current_section: Optional[Section] = None
        for raw_line in lines:
            line = raw_line.rstrip()
            match = heading_pattern.match(line)
            if match:
                stdnum = match.group("stdnum")
                para = match.group("para")
                if stdnum:
                    identifier = f"IAS {stdnum}"
                    title = line[match.end() :].strip() or identifier
                    level = 0
                else:
                    identifier = para
                    title = line[match.end() :].strip() or f"Paragraph {identifier}"
                    level = para.count(".")

                # Close previous section
                if current_section and current_section is not sections[-1]:
                    sections.append(current_section)

                # Adjust stack based on level
                while stack and stack[-1].level >= level:
                    stack.pop()

                parent_titles = [sec.title for sec in stack]
                current_section = Section(
                    identifier=identifier,
                    title=title,
                    level=level,
                    parent_titles=parent_titles,
                )
                stack.append(current_section)
                sections.append(current_section)
            else:
                if not current_section:
                    # Initialise with introduction section
                    current_section = Section(
                        identifier="introduction",
                        title="Introduction",
                        level=0,
                    )
                    stack = [current_section]
                    sections.append(current_section)
                current_section.add_line(line)

        return [section for section in sections if section.text]

    def _parse_us_gaap_sections(self, content: str) -> List[Section]:
        lines = content.splitlines()
        sections: List[Section] = []
        stack: List[Section] = []

        heading_pattern = re.compile(
            r"^\s*(ASC\s*\d{3}(?:-\d{2})*)(?:[:\-]\s*(?P<title>.*))?$",
            re.IGNORECASE,
        )

        current_section: Optional[Section] = None
        for raw_line in lines:
            line = raw_line.rstrip()
            match = heading_pattern.match(line)
            if match:
                identifier = match.group(1).upper().replace(" ", "")
                level = identifier.count("-")
                title = (match.group("title") or identifier).strip()

                if current_section and current_section is not sections[-1]:
                    sections.append(current_section)

                while stack and stack[-1].level >= level:
                    stack.pop()

                parent_titles = [sec.title for sec in stack]
                current_section = Section(
                    identifier=identifier,
                    title=title,
                    level=level,
                    parent_titles=parent_titles,
                )
                stack.append(current_section)
                sections.append(current_section)
            else:
                if not current_section:
                    current_section = Section(
                        identifier="asc_overview",
                        title="Overview",
                        level=0,
                    )
                    stack = [current_section]
                    sections.append(current_section)
                current_section.add_line(line)

        return [section for section in sections if section.text]

    def _parse_firm_guidance_sections(self, content: str) -> List[Section]:
        lines = content.splitlines()
        sections: List[Section] = []
        stack: List[Section] = []

        md_heading = re.compile(r"^\s*(#+)\s+(.*)$")
        uppercase_heading = re.compile(r"^[A-Z][A-Z ]{3,}$")

        current_section: Optional[Section] = None
        for raw_line in lines:
            line = raw_line.rstrip()
            md_match = md_heading.match(line)
            if md_match:
                level = len(md_match.group(1)) - 1
                title = md_match.group(2).strip()
                identifier = re.sub(r"[^A-Za-z0-9]+", "-", title.lower()).strip("-")

                while stack and stack[-1].level >= level:
                    stack.pop()

                parent_titles = [sec.title for sec in stack]
                current_section = Section(
                    identifier=identifier or f"section-{len(sections) + 1}",
                    title=title or f"Section {len(sections) + 1}",
                    level=level,
                    parent_titles=parent_titles,
                )
                stack.append(current_section)
                sections.append(current_section)
            elif uppercase_heading.match(line):
                level = 0
                title = line.title()
                identifier = re.sub(r"[^A-Za-z0-9]+", "-", title.lower()).strip("-")
                stack = []
                current_section = Section(
                    identifier=identifier or f"section-{len(sections) + 1}",
                    title=title,
                    level=level,
                    parent_titles=[],
                )
                stack.append(current_section)
                sections.append(current_section)
            else:
                if not current_section:
                    current_section = Section(
                        identifier="guidance_overview",
                        title="Guidance Overview",
                        level=0,
                    )
                    stack = [current_section]
                    sections.append(current_section)
                current_section.add_line(line)

        return [section for section in sections if section.text]

    def _parse_pipeline_sections(self, content: str) -> List[Section]:
        # Treat the entire pipeline diagram as a single logical section.
        text_summary = self._convert_mermaid_to_text(content)
        section = Section(
            identifier="pipeline",
            title="Standards Ingestion Pipeline",
            level=0,
        )
        for line in text_summary.splitlines():
            section.add_line(line)
        return [section]

    # ------------------------------------------------------------------
    # Chunk building & enrichment
    # ------------------------------------------------------------------
    def _build_chunks(
        self, sections: Sequence[Section], document_type: DocumentType
    ) -> List[ProcessedChunk]:
        chunks: List[ProcessedChunk] = []
        order_index = 0

        for section in sections:
            paragraphs = self._split_into_paragraphs(section.text)
            buffer: List[str] = []
            for paragraph in paragraphs:
                if not paragraph:
                    continue
                buffer.append(paragraph)
                candidate = "\n\n".join(buffer)
                tokens = len(self.tokenizer.encode(candidate))

                if tokens >= self.chunk_token_size:
                    chunk_content = candidate
                    chunk_tokens = tokens
                    chunk = self._build_chunk(
                        section,
                        chunk_content,
                        chunk_tokens,
                        order_index,
                        document_type,
                    )
                    if chunk:
                        chunks.append(chunk)
                        order_index += 1
                    buffer = []

            if buffer:
                chunk_content = "\n\n".join(buffer)
                chunk_tokens = len(self.tokenizer.encode(chunk_content))
                chunk = self._build_chunk(
                    section,
                    chunk_content,
                    chunk_tokens,
                    order_index,
                    document_type,
                )
                if chunk:
                    chunks.append(chunk)
                    order_index += 1

        return chunks

    def _build_chunk(
        self,
        section: Section,
        chunk_content: str,
        chunk_tokens: int,
        order_index: int,
        document_type: DocumentType,
    ) -> Optional[ProcessedChunk]:
        min_tokens = (
            10 if document_type is DocumentType.PIPELINE else self.min_chunk_tokens
        )
        if chunk_tokens < min_tokens:
            return None

        chunk_labels = self._classify_chunk_labels(chunk_content)
        keywords = self._extract_keywords(chunk_content)
        references = self._extract_references(chunk_content, document_type)
        topics = self._derive_topics(section, chunk_labels, keywords)

        enriched_header = f"{document_type.value.upper()} | {section.path}".strip()
        enriched_header = enriched_header or document_type.value.upper()
        enriched_content = f"{enriched_header}\n\n{chunk_content}".strip()
        enriched_tokens = len(self.tokenizer.encode(enriched_content))

        metadata = {
            "document_type": document_type.value,
            "section_id": section.identifier,
            "section_title": section.title,
            "section_path": section.path,
            "section_level": section.level,
            "chunk_labels": chunk_labels,
            "topics": topics,
            "keywords": keywords,
            "references": references,
        }

        return ProcessedChunk(
            content=enriched_content,
            tokens=enriched_tokens,
            chunk_order_index=order_index,
            metadata=metadata,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _split_into_paragraphs(self, text: str) -> List[str]:
        paragraphs: List[str] = []
        buffer: List[str] = []
        for line in text.splitlines():
            if line.strip() == "":
                if buffer:
                    paragraphs.append(" ".join(buffer).strip())
                    buffer = []
                continue
            buffer.append(line.strip())
        if buffer:
            paragraphs.append(" ".join(buffer).strip())
        return paragraphs

    def _classify_chunk_labels(self, content: str) -> List[str]:
        lowered = content.lower()
        labels: List[str] = []

        if any(word in lowered for word in ("shall", "must", "require")):
            labels.append("Requirement")
        if any(word in lowered for word in ("objective", "principle", "purpose")):
            labels.append("Principle")
        if "disclosure" in lowered:
            labels.append("Disclosure")
        if "example" in lowered:
            labels.append("Example")
        if any(word in lowered for word in ("procedure", "step", "workflow")):
            labels.append("Procedure")
        if "guidance" in lowered:
            labels.append("Guidance")

        return sorted(set(labels)) or ["General"]

    def _extract_keywords(self, content: str, top_k: int = 8) -> List[str]:
        words = re.findall(r"[A-Za-z][A-Za-z\-]{3,}", content)
        normalized = [word.lower() for word in words]
        filtered = [word for word in normalized if word not in STOPWORDS]
        counts = Counter(filtered)
        most_common = [word for word, _ in counts.most_common(top_k)]
        return most_common

    def _derive_topics(
        self, section: Section, chunk_labels: Sequence[str], keywords: Sequence[str]
    ) -> List[str]:
        topics: List[str] = []
        if section.title:
            topics.append(section.title)
        topics.extend(list(chunk_labels[:2]))
        topics.extend(keyword.title() for keyword in itertools.islice(keywords, 2))
        return sorted(set(filter(None, topics)))

    def _extract_references(
        self, content: str, document_type: DocumentType
    ) -> List[str]:
        references: set[str] = set()
        if document_type is DocumentType.IFRS:
            for match in re.findall(r"(?:IAS|IFRS)\s?\d+(?:\.\d+)*", content):
                references.add(match.strip())
        elif document_type is DocumentType.US_GAAP:
            for match in re.findall(r"ASC\s*\d{3}(?:-\d{2})*", content, re.IGNORECASE):
                references.add(match.upper().replace(" ", ""))
        elif document_type in (DocumentType.FIRM_GUIDANCE, DocumentType.PIPELINE):
            for match in re.findall(r"FG-\d+", content):
                references.add(match)
        return sorted(references)

    def _convert_mermaid_to_text(self, content: str) -> str:
        node_pattern = re.compile(r"^\s*([A-Za-z0-9_]+)\[(.+?)\]")
        edge_pattern = re.compile(
            r"^\s*([A-Za-z0-9_]+)\s*-+>\s*(?:\|([^|]+)\|\s*)?([A-Za-z0-9_]+)"
        )

        nodes: Dict[str, str] = {}
        edges: List[Tuple[str, Optional[str], str]] = []

        for line in content.splitlines():
            node_match = node_pattern.match(line)
            if node_match:
                node_id, label = node_match.groups()
                nodes[node_id.strip()] = label.strip()
                continue

            edge_match = edge_pattern.match(line)
            if edge_match:
                src, label, dst = edge_match.groups()
                edges.append(
                    (src.strip(), label.strip() if label else None, dst.strip())
                )

        lines: List[str] = []
        for src, label, dst in edges:
            src_label = nodes.get(src, src)
            dst_label = nodes.get(dst, dst)
            if label:
                lines.append(f"{src_label} -- {label} --> {dst_label}")
            else:
                lines.append(f"{src_label} --> {dst_label}")

        # Include isolated nodes if any
        defined_nodes = {src for src, _, _ in edges} | {dst for _, _, dst in edges}
        for node_id, node_label in nodes.items():
            if node_id not in defined_nodes:
                lines.append(node_label)

        return "\n".join(lines)

    def _extract_pipeline_metadata(self, content: str) -> Dict[str, Any]:
        node_pattern = re.compile(r"^\s*([A-Za-z0-9_]+)\[(.+?)\]")
        edge_pattern = re.compile(
            r"^\s*([A-Za-z0-9_]+)\s*-+>\s*(?:\|([^|]+)\|\s*)?([A-Za-z0-9_]+)"
        )

        nodes: Dict[str, str] = {}
        edges: List[Dict[str, str]] = []
        for line in content.splitlines():
            node_match = node_pattern.match(line)
            if node_match:
                node_id, label = node_match.groups()
                nodes[node_id.strip()] = label.strip()
                continue

            edge_match = edge_pattern.match(line)
            if edge_match:
                src, label, dst = edge_match.groups()
                edges.append(
                    {
                        "source": nodes.get(src.strip(), src.strip()),
                        "target": nodes.get(dst.strip(), dst.strip()),
                        "label": (label or "").strip(),
                    }
                )

        metadata: Dict[str, Any] = {}
        if nodes:
            metadata["graph_nodes"] = sorted(set(nodes.values()))
        if edges:
            metadata["graph_edges"] = edges
        return metadata


__all__ = [
    "DocumentType",
    "ProcessedChunk",
    "ProcessedDocument",
    "Section",
    "StandardsDocumentProcessor",
]
