"""
IFRS Compliance Assessment Routes for LightRAG API

This module provides API endpoints for comprehensive IFRS compliance assessment
using the two-step assessment approach.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Literal
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field, field_validator

from lightrag import LightRAG
from lightrag.ifrs_compliance import (
    IFRSComplianceAssessor,
    IFRSRequirement,
    ComplianceStatus,
    ApplicabilityStatus
)
from lightrag.api.utils_api import get_combined_auth_dependency

router = APIRouter(
    prefix="/compliance",
    tags=["compliance"],
)

class IFRSRequirementRequest(BaseModel):
    """Request model for IFRS requirement"""
    standard_name: str = Field(min_length=1, description="IFRS standard name (e.g., 'IFRS 1', 'IAS 16')")
    requirement_text: str = Field(min_length=1, description="The IFRS requirement text")
    requirement_id: Optional[str] = Field(default=None, description="Optional requirement ID")
    category: Optional[str] = Field(default=None, description="Requirement category")
    priority: Optional[str] = Field(default=None, description="Requirement priority")

    @field_validator("standard_name", "requirement_text")
    @classmethod
    def validate_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

class ComplianceAssessmentRequest(BaseModel):
    """Request model for compliance assessment"""
    entity_name: str = Field(min_length=1, description="Name of the entity being assessed")
    entity_business_description: str = Field(min_length=1, description="Description of entity's business activities")
    ifrs_requirements: List[IFRSRequirementRequest] = Field(min_length=1, description="List of IFRS requirements to assess")
    afs_content: str = Field(min_length=1, description="Content of the annual financial statements")
    ifrs_standards_context: Optional[str] = Field(default=None, description="Additional IFRS context")
    max_concurrent: Optional[int] = Field(default=5, ge=1, le=20, description="Maximum concurrent assessments")

    @field_validator("entity_name", "entity_business_description", "afs_content")
    @classmethod
    def validate_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

    @field_validator("ifrs_requirements")
    @classmethod
    def validate_requirements_list(cls, v):
        if not v or len(v) == 0:
            raise ValueError("At least one IFRS requirement must be provided")
        return v

class SingleRequirementAssessmentRequest(BaseModel):
    """Request model for single requirement assessment"""
    entity_name: str = Field(min_length=1, description="Name of the entity being assessed")
    entity_business_description: str = Field(min_length=1, description="Description of entity's business activities")
    ifrs_requirement: IFRSRequirementRequest = Field(description="IFRS requirement to assess")
    afs_content: str = Field(min_length=1, description="Content of the annual financial statements")
    ifrs_standards_context: Optional[str] = Field(default=None, description="Additional IFRS context")

    @field_validator("entity_name", "entity_business_description", "afs_content")
    @classmethod
    def validate_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

class IFRSRequirementsUploadRequest(BaseModel):
    """Request model for uploading IFRS requirements from text"""
    ifrs_text: str = Field(min_length=1, description="Text containing IFRS requirements")
    requirements_delimiter: Optional[str] = Field(default="##", description="Delimiter for separating requirements")

    @field_validator("ifrs_text")
    @classmethod
    def validate_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("IFRS text cannot be empty")
        return v.strip()

class ComplianceAssessmentResponse(BaseModel):
    """Response model for compliance assessment"""
    status: Literal["success", "partial_success", "failure"] = Field(description="Assessment status")
    message: str = Field(description="Assessment message")
    assessment_id: Optional[str] = Field(default=None, description="Unique assessment ID")
    total_requirements: Optional[int] = Field(default=None, description="Total requirements assessed")
    applicable_requirements: Optional[int] = Field(default=None, description="Number of applicable requirements")
    compliant_requirements: Optional[int] = Field(default=None, description="Number of compliant requirements")
    overall_compliance_score: Optional[float] = Field(default=None, description="Overall compliance score")
    compliance_status: Optional[str] = Field(default=None, description="Overall compliance status")
    assessment_timestamp: Optional[str] = Field(default=None, description="Assessment timestamp")

class DetailedAssessmentResponse(BaseModel):
    """Response model for detailed assessment results"""
    entity_info: Dict[str, Any] = Field(description="Entity information")
    summary_statistics: Dict[str, Any] = Field(description="Compliance summary statistics")
    executive_summary: Dict[str, Any] = Field(description="Executive summary")
    risk_assessment: Dict[str, Any] = Field(description="Risk assessment")
    recommendations: List[Dict[str, Any]] = Field(description="Recommendations")
    next_steps: Dict[str, Any] = Field(description="Next steps")
    detailed_assessments: List[Dict[str, Any]] = Field(description="Detailed assessment results")

class SingleRequirementAssessmentResponse(BaseModel):
    """Response model for single requirement assessment"""
    requirement: Dict[str, Any] = Field(description="IFRS requirement details")
    applicability_assessment: Dict[str, Any] = Field(description="Applicability assessment")
    compliance_assessment: Dict[str, Any] = Field(description="Compliance assessment")
    assessment_timestamp: str = Field(description="Assessment timestamp")

class IFRSRequirementsResponse(BaseModel):
    """Response model for IFRS requirements"""
    requirements: List[Dict[str, Any]] = Field(description="List of parsed IFRS requirements")
    total_count: int = Field(description="Total number of requirements")

class EntityExtractionRequest(BaseModel):
    """Request model for entity information extraction"""
    afs_content: str = Field(min_length=1, description="Content of the annual financial statements")

    @field_validator("afs_content")
    @classmethod
    def validate_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Financial statement content cannot be empty")
        return v.strip()

class EntityExtractionResponse(BaseModel):
    """Response model for entity information extraction"""
    entity_name: str = Field(description="Extracted entity name")
    business_description: str = Field(description="Extracted business description")

def create_compliance_routes(
    rag: LightRAG,
    api_key: Optional[str] = None
):
    """Create compliance assessment routes"""
    
    # Create combined auth dependency for compliance routes
    combined_auth = get_combined_auth_dependency(api_key)
    
    # Initialize the compliance assessor
    compliance_assessor = IFRSComplianceAssessor(rag)
    
    @router.post(
        "/assess",
        response_model=ComplianceAssessmentResponse,
        dependencies=[Depends(combined_auth)]
    )
    async def assess_compliance(
        request: ComplianceAssessmentRequest,
        background_tasks: BackgroundTasks
    ):
        """
        Perform comprehensive IFRS compliance assessment
        """
        try:
            # Validate request
            if not request.entity_name or not request.entity_name.strip():
                raise HTTPException(status_code=400, detail="Entity name is required")
            
            if not request.entity_business_description or not request.entity_business_description.strip():
                raise HTTPException(status_code=400, detail="Entity business description is required")
            
            if not request.afs_content or not request.afs_content.strip():
                raise HTTPException(status_code=400, detail="Financial statement content is required")
            
            if not request.ifrs_requirements or len(request.ifrs_requirements) == 0:
                raise HTTPException(status_code=400, detail="At least one IFRS requirement must be provided")
            
            # Convert request requirements to IFRSRequirement objects
            ifrs_requirements = [
                IFRSRequirement(
                    standard_name=req.standard_name,
                    requirement_text=req.requirement_text,
                    requirement_id=req.requirement_id,
                    category=req.category,
                    priority=req.priority
                )
                for req in request.ifrs_requirements
            ]
            
            # Perform the assessment
            assessment_results = await compliance_assessor.assess_multiple_requirements(
                entity_name=request.entity_name,
                entity_business_description=request.entity_business_description,
                ifrs_requirements=ifrs_requirements,
                afs_content=request.afs_content,
                ifrs_standards_context=request.ifrs_standards_context,
                max_concurrent=request.max_concurrent
            )
            
            # Calculate summary statistics
            summary = compliance_assessor.calculate_compliance_summary(assessment_results)
            
            # Generate assessment ID
            assessment_id = f"assessment_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            return ComplianceAssessmentResponse(
                status="success",
                message=f"Successfully assessed {len(assessment_results)} requirements",
                assessment_id=assessment_id,
                total_requirements=summary.total_requirements,
                applicable_requirements=summary.applicable_requirements,
                compliant_requirements=summary.compliant_requirements,
                overall_compliance_score=summary.overall_compliance_score,
                compliance_status=summary.compliance_status,
                assessment_timestamp=datetime.now().isoformat()
            )
            
        except Exception as e:
            logging.error(f"Compliance assessment failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Compliance assessment failed: {str(e)}"
            )
    
    @router.post(
        "/assess/single",
        response_model=SingleRequirementAssessmentResponse,
        dependencies=[Depends(combined_auth)]
    )
    async def assess_single_requirement(
        request: SingleRequirementAssessmentRequest
    ):
        """
        Assess a single IFRS requirement
        """
        try:
            # Validate request
            if not request.entity_name or not request.entity_name.strip():
                raise HTTPException(status_code=400, detail="Entity name is required")
            
            if not request.entity_business_description or not request.entity_business_description.strip():
                raise HTTPException(status_code=400, detail="Entity business description is required")
            
            if not request.afs_content or not request.afs_content.strip():
                raise HTTPException(status_code=400, detail="Financial statement content is required")
            
            # Convert request requirement to IFRSRequirement object
            ifrs_requirement = IFRSRequirement(
                standard_name=request.ifrs_requirement.standard_name,
                requirement_text=request.ifrs_requirement.requirement_text,
                requirement_id=request.ifrs_requirement.requirement_id,
                category=request.ifrs_requirement.category,
                priority=request.ifrs_requirement.priority
            )
            
            # Perform the assessment
            result = await compliance_assessor.assess_single_requirement(
                entity_name=request.entity_name,
                entity_business_description=request.entity_business_description,
                ifrs_requirement=ifrs_requirement,
                afs_content=request.afs_content,
                ifrs_standards_context=request.ifrs_standards_context
            )
            
            return SingleRequirementAssessmentResponse(
                requirement={
                    "standard_name": result.requirement.standard_name,
                    "requirement_text": result.requirement.requirement_text,
                    "requirement_id": result.requirement.requirement_id
                },
                applicability_assessment={
                    "status": result.applicability_assessment.status.value,
                    "reasoning": result.applicability_assessment.reasoning
                },
                compliance_assessment={
                    "status": result.compliance_assessment.status.value,
                    "reasoning": result.compliance_assessment.reasoning,
                    "evidence_citations": result.compliance_assessment.evidence_citations,
                    "suggested_follow_up": result.compliance_assessment.suggested_follow_up
                },
                assessment_timestamp=result.assessment_timestamp.isoformat()
            )
            
        except Exception as e:
            logging.error(f"Single requirement assessment failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Single requirement assessment failed: {str(e)}"
            )
    
    @router.post(
        "/assess/detailed",
        response_model=DetailedAssessmentResponse,
        dependencies=[Depends(combined_auth)]
    )
    async def assess_compliance_detailed(
        request: ComplianceAssessmentRequest
    ):
        """
        Perform comprehensive IFRS compliance assessment with detailed report
        """
        try:
            # Convert request requirements to IFRSRequirement objects
            ifrs_requirements = [
                IFRSRequirement(
                    standard_name=req.standard_name,
                    requirement_text=req.requirement_text,
                    requirement_id=req.requirement_id,
                    category=req.category,
                    priority=req.priority
                )
                for req in request.ifrs_requirements
            ]
            
            # Perform the assessment
            assessment_results = await compliance_assessor.assess_multiple_requirements(
                entity_name=request.entity_name,
                entity_business_description=request.entity_business_description,
                ifrs_requirements=ifrs_requirements,
                afs_content=request.afs_content,
                ifrs_standards_context=request.ifrs_standards_context,
                max_concurrent=request.max_concurrent
            )
            
            # Calculate summary statistics
            summary = compliance_assessor.calculate_compliance_summary(assessment_results)
            
            # Generate detailed report
            detailed_report = await compliance_assessor.generate_compliance_report(
                entity_name=request.entity_name,
                entity_business_description=request.entity_business_description,
                assessment_results=assessment_results,
                summary=summary
            )
            
            return DetailedAssessmentResponse(**detailed_report)
            
        except Exception as e:
            logging.error(f"Detailed compliance assessment failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Detailed compliance assessment failed: {str(e)}"
            )
    
    @router.post(
        "/requirements/parse",
        response_model=IFRSRequirementsResponse,
        dependencies=[Depends(combined_auth)]
    )
    async def parse_ifrs_requirements(
        request: IFRSRequirementsUploadRequest
    ):
        """
        Parse IFRS requirements from text format
        """
        try:
            # Validate request
            if not request.ifrs_text or not request.ifrs_text.strip():
                raise HTTPException(status_code=400, detail="IFRS text content is required")
            
            requirements = await compliance_assessor.load_ifrs_requirements_from_text(
                ifrs_text=request.ifrs_text,
                requirements_delimiter=request.requirements_delimiter
            )
            
            requirements_data = [
                {
                    "standard_name": req.standard_name,
                    "requirement_text": req.requirement_text,
                    "requirement_id": req.requirement_id,
                    "category": req.category,
                    "priority": req.priority
                }
                for req in requirements
            ]
            
            return IFRSRequirementsResponse(
                requirements=requirements_data,
                total_count=len(requirements)
            )
            
        except Exception as e:
            logging.error(f"IFRS requirements parsing failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"IFRS requirements parsing failed: {str(e)}"
            )
    
    @router.post(
        "/entity/extract",
        response_model=EntityExtractionResponse,
        dependencies=[Depends(combined_auth)]
    )
    async def extract_entity_info(
        request: EntityExtractionRequest
    ):
        """
        Extract entity name and business description from financial statements
        """
        try:
            # Validate request
            if not request.afs_content or not request.afs_content.strip():
                raise HTTPException(status_code=400, detail="Financial statement content is required")
            
            entity_name, business_description = await compliance_assessor.extract_entity_info_from_afs(
                afs_content=request.afs_content
            )
            
            return EntityExtractionResponse(
                entity_name=entity_name,
                business_description=business_description
            )
            
        except Exception as e:
            logging.error(f"Entity info extraction failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Entity info extraction failed: {str(e)}"
            )
    
    @router.get(
        "/status",
        dependencies=[Depends(combined_auth)]
    )
    async def get_compliance_status():
        """
        Get compliance assessment system status
        """
        return {
            "status": "operational",
            "service": "IFRS Compliance Assessment",
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
            "capabilities": [
                "Single requirement assessment",
                "Multiple requirements assessment",
                "Detailed compliance reporting",
                "IFRS requirements parsing",
                "Entity information extraction"
            ]
        }
    
    return router 