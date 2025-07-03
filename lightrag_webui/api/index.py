from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import json

app = FastAPI(title="Augentik API", description="Audit Intelligence Platform API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class QueryRequest(BaseModel):
    query: str
    mode: str = "hybrid"
    only_need_context: Optional[bool] = False
    only_need_prompt: Optional[bool] = False
    response_type: Optional[str] = "Multiple Paragraphs"
    stream: Optional[bool] = False
    top_k: Optional[int] = 50
    max_token_for_text_unit: Optional[int] = 6000
    max_token_for_global_context: Optional[int] = 5000
    max_token_for_local_context: Optional[int] = 5000
    history_turns: Optional[int] = 5

class QueryResponse(BaseModel):
    response: str

class AuthStatusResponse(BaseModel):
    auth_configured: bool
    access_token: Optional[str] = None
    auth_mode: str = "disabled"
    message: str = "Demo mode - no authentication required"
    webui_title: str = "Augentik Dashboard"
    webui_description: str = "Audit Intelligence Platform"

class HealthResponse(BaseModel):
    status: str
    working_directory: str
    input_directory: str
    configuration: dict
    pipeline_busy: bool = False
    webui_title: str = "Augentik Dashboard"
    webui_description: str = "Audit Intelligence Platform"

# Demo data
DEMO_AUDIT_RESPONSES = {
    "revenue recognition": "Based on audit standards, revenue recognition requires proper documentation of performance obligations, transaction prices, and timing of recognition. Key controls include segregation of duties, approval processes, and regular reconciliations.",
    "accounts payable": "Audit procedures for accounts payable include confirmation of balances, testing of cut-off procedures, review of subsequent payments, and verification of proper authorization and approval processes.",
    "internal controls": "Internal controls are processes designed to provide reasonable assurance regarding the achievement of objectives in operational effectiveness, reliable financial reporting, and compliance with laws and regulations.",
    "materiality": "Materiality is the magnitude of misstatements that could reasonably influence economic decisions of users. Auditors set materiality levels to plan audit procedures and evaluate findings.",
    "audit risk": "Audit risk is the risk that auditors express an inappropriate opinion when financial statements are materially misstated. It consists of inherent risk, control risk, and detection risk."
}

@app.get("/")
async def root():
    return {"message": "Augentik API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return HealthResponse(
        status="healthy",
        working_directory="./rag_storage",
        input_directory="./inputs",
        configuration={
            "llm_binding": "openai",
            "llm_model": "gpt-4o-mini",
            "embedding_binding": "openai",
            "embedding_model": "text-embedding-3-large",
            "max_tokens": 16384,
            "kv_storage": "JsonKVStorage",
            "doc_status_storage": "JsonDocStatusStorage",
            "graph_storage": "NetworkXStorage",
            "vector_storage": "NanoVectorDBStorage"
        }
    )

@app.get("/auth-status")
async def auth_status():
    return AuthStatusResponse(auth_configured=False)

@app.post("/query")
async def query_audit(request: QueryRequest):
    # Demo response based on query content
    query_lower = request.query.lower()
    
    # Find the best matching demo response
    best_match = None
    for key, response in DEMO_AUDIT_RESPONSES.items():
        if key in query_lower:
            best_match = response
            break
    
    if not best_match:
        best_match = "This is a demo response. In a full implementation, this would query the audit knowledge base and return relevant information based on your uploaded audit documents and standards."
    
    return QueryResponse(response=best_match)

@app.get("/documents")
async def get_documents():
    return {
        "statuses": {
            "processed": [
                {
                    "id": "demo_audit_standard_1",
                    "content_summary": "ISA 315 - Understanding the Entity and Its Environment",
                    "content_length": 15420,
                    "status": "processed",
                    "created_at": "2025-01-07T10:00:00Z",
                    "updated_at": "2025-01-07T10:05:00Z",
                    "chunks_count": 12,
                    "file_path": "audit_standards/isa_315.pdf"
                },
                {
                    "id": "demo_audit_standard_2", 
                    "content_summary": "ISA 330 - Auditor's Responses to Assessed Risks",
                    "content_length": 18750,
                    "status": "processed",
                    "created_at": "2025-01-07T10:10:00Z",
                    "updated_at": "2025-01-07T10:15:00Z",
                    "chunks_count": 15,
                    "file_path": "audit_standards/isa_330.pdf"
                }
            ],
            "processing": [],
            "pending": [],
            "failed": []
        }
    }

@app.get("/graphs")
async def get_graphs(label: str = "*", max_depth: int = 3, max_nodes: int = 100):
    # Demo graph data for audit concepts
    return {
        "nodes": [
            {
                "id": "audit_risk",
                "labels": ["concept"],
                "properties": {
                    "entity_type": "audit_concept",
                    "description": "The risk that auditors express an inappropriate opinion when financial statements are materially misstated"
                }
            },
            {
                "id": "internal_controls",
                "labels": ["concept"],
                "properties": {
                    "entity_type": "audit_concept", 
                    "description": "Processes designed to provide reasonable assurance regarding achievement of objectives"
                }
            },
            {
                "id": "materiality",
                "labels": ["concept"],
                "properties": {
                    "entity_type": "audit_concept",
                    "description": "The magnitude of misstatements that could influence economic decisions"
                }
            }
        ],
        "edges": [
            {
                "id": "edge_1",
                "source": "audit_risk",
                "target": "internal_controls",
                "type": "relates_to",
                "properties": {
                    "description": "Audit risk assessment considers the effectiveness of internal controls"
                }
            },
            {
                "id": "edge_2", 
                "source": "materiality",
                "target": "audit_risk",
                "type": "influences",
                "properties": {
                    "description": "Materiality levels affect audit risk assessment and procedures"
                }
            }
        ]
    }

@app.get("/graph/label/list")
async def get_graph_labels():
    return ["audit_concept", "audit_procedure", "audit_standard", "control", "risk"]

# Vercel serverless function handler
def handler(request):
    return app(request)
