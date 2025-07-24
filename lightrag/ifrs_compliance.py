"""
IFRS Compliance Assessment Module for LightRAG

This module provides comprehensive IFRS compliance assessment capabilities
using the two-step assessment approach: Applicability Assessment and Compliance Assessment.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum

from .lightrag import LightRAG
from .base import QueryParam
from .prompt import PROMPTS
from .utils import logger, convert_response_to_json

class ComplianceStatus(Enum):
    """Enumeration for compliance assessment statuses"""
    COMPLIANT = "COMPLIANT"
    NON_COMPLIANT = "NON_COMPLIANT"
    INSUFFICIENT_INFO = "INSUFFICIENT_INFO"
    N_A_NOT_APPLICABLE = "N/A_NOT_APPLICABLE"

class ApplicabilityStatus(Enum):
    """Enumeration for applicability assessment statuses"""
    APPLICABLE = "APPLICABLE"
    NOT_APPLICABLE = "NOT_APPLICABLE"

@dataclass
class IFRSRequirement:
    """Data class representing an IFRS requirement"""
    standard_name: str
    requirement_text: str
    requirement_id: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None

@dataclass
class ApplicabilityAssessment:
    """Data class for applicability assessment results"""
    status: ApplicabilityStatus
    reasoning: str

@dataclass
class ComplianceAssessment:
    """Data class for compliance assessment results"""
    status: ComplianceStatus
    reasoning: str
    evidence_citations: List[str]
    suggested_follow_up: str

@dataclass
class IFRSAssessmentResult:
    """Data class for complete IFRS assessment result"""
    requirement: IFRSRequirement
    applicability_assessment: ApplicabilityAssessment
    compliance_assessment: ComplianceAssessment
    assessment_timestamp: datetime
    entity_name: str
    entity_business_description: str

@dataclass
class ComplianceSummary:
    """Data class for compliance summary statistics"""
    total_requirements: int
    applicable_requirements: int
    compliant_requirements: int
    non_compliant_requirements: int
    insufficient_info_requirements: int
    not_applicable_requirements: int
    overall_compliance_score: float
    compliance_status: str

class IFRSComplianceAssessor:
    """
    Main class for performing IFRS compliance assessments using LightRAG
    """
    
    def __init__(self, lightrag_instance: LightRAG):
        """
        Initialize the IFRS Compliance Assessor
        
        Args:
            lightrag_instance: Configured LightRAG instance
        """
        self.rag = lightrag_instance
        self.logger = logging.getLogger(__name__)
        
    async def assess_single_requirement(
        self,
        entity_name: str,
        entity_business_description: str,
        ifrs_requirement: IFRSRequirement,
        afs_content: str,
        ifrs_standards_context: Optional[str] = None
    ) -> IFRSAssessmentResult:
        """
        Assess a single IFRS requirement against financial statements
        
        Args:
            entity_name: Name of the entity being assessed
            entity_business_description: Description of entity's business
            ifrs_requirement: The IFRS requirement to assess
            afs_content: Relevant financial statement content
            ifrs_standards_context: Additional IFRS context if available
            
        Returns:
            IFRSAssessmentResult containing the assessment
        """
        try:
            # Format the prompt with the requirement details
            prompt = PROMPTS["ifrs_compliance_assessment"].format(
                entity_name=entity_name,
                entity_business_description=entity_business_description,
                ifrs_standard_name=ifrs_requirement.standard_name,
                ifrs_requirement=ifrs_requirement.requirement_text,
                afs_content=afs_content,
                ifrs_standards_context=ifrs_standards_context or "No additional context available"
            )
            
            # Query the RAG system
            response = await self.rag.aquery(
                query=prompt,
                param=QueryParam(mode="hybrid", top_k=50)
            )
            
            # Parse the JSON response
            assessment_data = convert_response_to_json(response)
            
            # Create assessment result objects
            applicability_assessment = ApplicabilityAssessment(
                status=ApplicabilityStatus(assessment_data["applicability_assessment"]["status"]),
                reasoning=assessment_data["applicability_assessment"]["reasoning"]
            )
            
            compliance_assessment = ComplianceAssessment(
                status=ComplianceStatus(assessment_data["compliance_assessment"]["status"]),
                reasoning=assessment_data["compliance_assessment"]["reasoning"],
                evidence_citations=assessment_data["compliance_assessment"]["evidence_citations"],
                suggested_follow_up=assessment_data["compliance_assessment"]["suggested_follow_up"]
            )
            
            return IFRSAssessmentResult(
                requirement=ifrs_requirement,
                applicability_assessment=applicability_assessment,
                compliance_assessment=compliance_assessment,
                assessment_timestamp=datetime.now(),
                entity_name=entity_name,
                entity_business_description=entity_business_description
            )
            
        except Exception as e:
            self.logger.error(f"Error assessing requirement {ifrs_requirement.requirement_id}: {str(e)}")
            raise
    
    async def assess_multiple_requirements(
        self,
        entity_name: str,
        entity_business_description: str,
        ifrs_requirements: List[IFRSRequirement],
        afs_content: str,
        ifrs_standards_context: Optional[str] = None,
        max_concurrent: int = 5
    ) -> List[IFRSAssessmentResult]:
        """
        Assess multiple IFRS requirements concurrently
        
        Args:
            entity_name: Name of the entity being assessed
            entity_business_description: Description of entity's business
            ifrs_requirements: List of IFRS requirements to assess
            afs_content: Relevant financial statement content
            ifrs_standards_context: Additional IFRS context if available
            max_concurrent: Maximum number of concurrent assessments
            
        Returns:
            List of IFRSAssessmentResult objects
        """
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def assess_with_semaphore(requirement: IFRSRequirement) -> IFRSAssessmentResult:
            async with semaphore:
                return await self.assess_single_requirement(
                    entity_name=entity_name,
                    entity_business_description=entity_business_description,
                    ifrs_requirement=requirement,
                    afs_content=afs_content,
                    ifrs_standards_context=ifrs_standards_context
                )
        
        tasks = [assess_with_semaphore(req) for req in ifrs_requirements]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions and log them
        valid_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                self.logger.error(f"Assessment failed for requirement {i}: {str(result)}")
            else:
                valid_results.append(result)
        
        return valid_results
    
    def calculate_compliance_summary(
        self,
        assessment_results: List[IFRSAssessmentResult]
    ) -> ComplianceSummary:
        """
        Calculate compliance summary statistics from assessment results
        
        Args:
            assessment_results: List of assessment results
            
        Returns:
            ComplianceSummary with calculated statistics
        """
        total_requirements = len(assessment_results)
        applicable_requirements = 0
        compliant_requirements = 0
        non_compliant_requirements = 0
        insufficient_info_requirements = 0
        not_applicable_requirements = 0
        
        for result in assessment_results:
            if result.applicability_assessment.status == ApplicabilityStatus.APPLICABLE:
                applicable_requirements += 1
                
                if result.compliance_assessment.status == ComplianceStatus.COMPLIANT:
                    compliant_requirements += 1
                elif result.compliance_assessment.status == ComplianceStatus.NON_COMPLIANT:
                    non_compliant_requirements += 1
                elif result.compliance_assessment.status == ComplianceStatus.INSUFFICIENT_INFO:
                    insufficient_info_requirements += 1
            else:
                not_applicable_requirements += 1
        
        # Calculate compliance score (only for applicable requirements)
        if applicable_requirements > 0:
            overall_compliance_score = (compliant_requirements / applicable_requirements) * 100
        else:
            overall_compliance_score = 100.0  # All requirements not applicable
        
        # Determine compliance status
        if overall_compliance_score >= 90:
            compliance_status = "EXCELLENT"
        elif overall_compliance_score >= 75:
            compliance_status = "GOOD"
        elif overall_compliance_score >= 60:
            compliance_status = "FAIR"
        elif overall_compliance_score >= 40:
            compliance_status = "POOR"
        else:
            compliance_status = "CRITICAL"
        
        return ComplianceSummary(
            total_requirements=total_requirements,
            applicable_requirements=applicable_requirements,
            compliant_requirements=compliant_requirements,
            non_compliant_requirements=non_compliant_requirements,
            insufficient_info_requirements=insufficient_info_requirements,
            not_applicable_requirements=not_applicable_requirements,
            overall_compliance_score=overall_compliance_score,
            compliance_status=compliance_status
        )
    
    async def generate_compliance_report(
        self,
        entity_name: str,
        entity_business_description: str,
        assessment_results: List[IFRSAssessmentResult],
        summary: ComplianceSummary
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive compliance report
        
        Args:
            entity_name: Name of the entity
            entity_business_description: Description of entity's business
            assessment_results: List of assessment results
            summary: Compliance summary statistics
            
        Returns:
            Dictionary containing the complete compliance report
        """
        try:
            # Prepare compliance results for the summary prompt
            compliance_results = []
            for result in assessment_results:
                compliance_results.append({
                    "standard": result.requirement.standard_name,
                    "requirement": result.requirement.requirement_text,
                    "applicability_status": result.applicability_assessment.status.value,
                    "compliance_status": result.compliance_assessment.status.value,
                    "reasoning": result.compliance_assessment.reasoning,
                    "evidence": result.compliance_assessment.evidence_citations
                })
            
            # Format the summary prompt
            prompt = PROMPTS["ifrs_compliance_summary"].format(
                entity_name=entity_name,
                entity_business_description=entity_business_description,
                assessment_date=datetime.now().isoformat(),
                total_requirements=summary.total_requirements,
                compliance_results=json.dumps(compliance_results, indent=2)
            )
            
            # Generate the summary report
            summary_response = await self.rag.aquery(
                query=prompt,
                param=QueryParam(mode="hybrid", top_k=30)
            )
            
            # Parse the summary response
            summary_report = convert_response_to_json(summary_response)
            
            # Combine with detailed results
            complete_report = {
                "entity_info": {
                    "name": entity_name,
                    "business_description": entity_business_description,
                    "assessment_date": datetime.now().isoformat()
                },
                "summary_statistics": asdict(summary),
                "executive_summary": summary_report.get("executive_summary", {}),
                "risk_assessment": summary_report.get("risk_assessment", {}),
                "recommendations": summary_report.get("recommendations", []),
                "next_steps": summary_report.get("next_steps", {}),
                "detailed_assessments": [
                    {
                        "requirement": {
                            "standard_name": result.requirement.standard_name,
                            "requirement_text": result.requirement.requirement_text,
                            "requirement_id": result.requirement.requirement_id
                        },
                        "applicability_assessment": {
                            "status": result.applicability_assessment.status.value,
                            "reasoning": result.applicability_assessment.reasoning
                        },
                        "compliance_assessment": {
                            "status": result.compliance_assessment.status.value,
                            "reasoning": result.compliance_assessment.reasoning,
                            "evidence_citations": result.compliance_assessment.evidence_citations,
                            "suggested_follow_up": result.compliance_assessment.suggested_follow_up
                        },
                        "assessment_timestamp": result.assessment_timestamp.isoformat()
                    }
                    for result in assessment_results
                ]
            }
            
            return complete_report
            
        except Exception as e:
            self.logger.error(f"Error generating compliance report: {str(e)}")
            raise
    
    async def load_ifrs_requirements_from_text(
        self,
        ifrs_text: str,
        requirements_delimiter: str = "##"
    ) -> List[IFRSRequirement]:
        """
        Parse IFRS requirements from text format
        
        Args:
            ifrs_text: Text containing IFRS requirements
            requirements_delimiter: Delimiter used to separate requirements
            
        Returns:
            List of IFRSRequirement objects
        """
        requirements = []
        sections = ifrs_text.split(requirements_delimiter)
        
        for section in sections:
            section = section.strip()
            if not section:
                continue
            
            # Try to extract standard name and requirement text
            lines = section.split('\n')
            standard_name = None
            requirement_text = ""
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Look for standard name patterns (e.g., "IFRS 1", "IAS 16")
                if not standard_name and any(keyword in line.upper() for keyword in ["IFRS", "IAS", "SIC", "IFRIC"]):
                    standard_name = line
                else:
                    requirement_text += line + " "
            
            if standard_name and requirement_text.strip():
                requirements.append(IFRSRequirement(
                    standard_name=standard_name,
                    requirement_text=requirement_text.strip(),
                    requirement_id=f"req_{len(requirements) + 1}"
                ))
        
        return requirements
    
    async def extract_entity_info_from_afs(
        self,
        afs_content: str
    ) -> Tuple[str, str]:
        """
        Extract entity name and business description from financial statements
        
        Args:
            afs_content: Content of the annual financial statements
            
        Returns:
            Tuple of (entity_name, business_description)
        """
        try:
            # Create a prompt to extract entity information
            extraction_prompt = f"""
            Extract the following information from the provided Annual Financial Statements:
            
            1. Entity Name: The legal name of the reporting entity
            2. Business Description: A concise description of the entity's primary business activities and industry (2-3 sentences)
            
            Annual Financial Statements Content:
            {afs_content[:5000]}  # Use first 5000 characters for extraction
            
            Provide the information in JSON format:
            {{
                "entity_name": "[Entity Name]",
                "business_description": "[Business Description]"
            }}
            """
            
            response = await self.rag.aquery(
                query=extraction_prompt,
                param=QueryParam(mode="naive", top_k=20)
            )
            
            extracted_data = convert_response_to_json(response)
            
            entity_name = extracted_data.get("entity_name", "Unknown Entity")
            business_description = extracted_data.get("business_description", "Business description not available")
            
            return entity_name, business_description
            
        except Exception as e:
            self.logger.warning(f"Could not extract entity info: {str(e)}")
            return "Unknown Entity", "Business description not available" 