#!/usr/bin/env python3
"""
IFRS Compliance Assessment Demo

This script demonstrates the comprehensive IFRS compliance assessment capabilities
of LightRAG using the two-step assessment approach.
"""

import os
import asyncio
import json
import logging
from datetime import datetime
from typing import List

from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import gpt_4o_mini_complete, openai_embed
from lightrag.ifrs_compliance import (
    IFRSComplianceAssessor,
    IFRSRequirement,
    ComplianceStatus,
    ApplicabilityStatus
)
from lightrag.kg.shared_storage import initialize_pipeline_status
from lightrag.utils import logger, set_verbose_debug

from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=".env", override=False)

WORKING_DIR = "./ifrs_compliance_demo"

def configure_logging():
    """Configure logging for the application"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger.setLevel(logging.INFO)
    set_verbose_debug(os.getenv("VERBOSE_DEBUG", "false").lower() == "true")

async def initialize_rag():
    """Initialize the LightRAG instance"""
    rag = LightRAG(
        working_dir=WORKING_DIR,
        embedding_func=openai_embed,
        llm_model_func=gpt_4o_mini_complete,
    )

    await rag.initialize_storages()
    await initialize_pipeline_status()

    return rag

def create_sample_ifrs_requirements() -> List[IFRSRequirement]:
    """Create sample IFRS requirements for demonstration"""
    return [
        IFRSRequirement(
            standard_name="IAS 1 Presentation of Financial Statements",
            requirement_text="An entity shall present a complete set of financial statements (including comparative information) at least annually.",
            requirement_id="IAS1_1",
            category="Presentation",
            priority="High"
        ),
        IFRSRequirement(
            standard_name="IAS 1 Presentation of Financial Statements",
            requirement_text="Financial statements shall present fairly the financial position, financial performance and cash flows of an entity.",
            requirement_id="IAS1_2",
            category="Presentation",
            priority="High"
        ),
        IFRSRequirement(
            standard_name="IAS 16 Property, Plant and Equipment",
            requirement_text="An entity shall measure an item of property, plant and equipment at cost on initial recognition.",
            requirement_id="IAS16_1",
            category="Measurement",
            priority="High"
        ),
        IFRSRequirement(
            standard_name="IFRS 17 Insurance Contracts",
            requirement_text="An entity shall apply IFRS 17 to contracts under which it provides insurance coverage.",
            requirement_id="IFRS17_1",
            category="Insurance",
            priority="Medium"
        ),
        IFRSRequirement(
            standard_name="IAS 38 Intangible Assets",
            requirement_text="An entity shall recognise an intangible asset if, and only if, specified criteria are met.",
            requirement_id="IAS38_1",
            category="Recognition",
            priority="High"
        )
    ]

def create_sample_financial_statements() -> str:
    """Create sample financial statements content for demonstration"""
    return """
    KERRY GROUP PLC
    CONSOLIDATED FINANCIAL STATEMENTS
    For the year ended 31 December 2023
    
    STRATEGIC REPORT
    
    Nature of Business:
    Kerry Group plc is a global leader in the food and ingredients industry, providing taste and nutrition solutions for the food, beverage, and pharmaceutical markets. The Group operates in over 30 countries and serves customers in more than 150 countries worldwide.
    
    CONSOLIDATED STATEMENT OF FINANCIAL POSITION
    As at 31 December 2023
    
    ASSETS
    Non-current assets
    Property, plant and equipment                     €2,456,000,000
    Intangible assets                                 €4,123,000,000
    Goodwill                                         €3,789,000,000
    Other non-current assets                          €567,000,000
    Total non-current assets                          €10,935,000,000
    
    Current assets
    Inventories                                       €1,234,000,000
    Trade and other receivables                       €2,345,000,000
    Cash and cash equivalents                         €1,567,000,000
    Total current assets                              €5,146,000,000
    
    Total assets                                      €16,081,000,000
    
    EQUITY AND LIABILITIES
    Equity
    Share capital                                     €180,000,000
    Share premium                                     €2,345,000,000
    Retained earnings                                 €8,234,000,000
    Other reserves                                    €456,000,000
    Total equity                                      €11,215,000,000
    
    Non-current liabilities
    Borrowings                                        €2,345,000,000
    Deferred tax liabilities                          €567,000,000
    Other non-current liabilities                     €234,000,000
    Total non-current liabilities                     €3,146,000,000
    
    Current liabilities
    Trade and other payables                          €1,234,000,000
    Current tax liabilities                           €234,000,000
    Borrowings                                        €252,000,000
    Total current liabilities                         €1,720,000,000
    
    Total liabilities                                 €4,866,000,000
    
    Total equity and liabilities                      €16,081,000,000
    
    CONSOLIDATED STATEMENT OF COMPREHENSIVE INCOME
    For the year ended 31 December 2023
    
    Revenue                                           €8,234,000,000
    Cost of sales                                     (€5,678,000,000)
    Gross profit                                      €2,556,000,000
    
    Operating expenses
    Selling and distribution costs                    (€1,234,000,000)
    Administrative expenses                           (€567,000,000)
    Research and development costs                    (€234,000,000)
    Total operating expenses                          (€2,035,000,000)
    
    Operating profit                                  €521,000,000
    
    Finance income                                    €23,000,000
    Finance costs                                     (€45,000,000)
    Net finance costs                                 (€22,000,000)
    
    Profit before tax                                 €499,000,000
    Income tax expense                                (€125,000,000)
    Profit for the year                               €374,000,000
    
    Other comprehensive income
    Items that may be reclassified to profit or loss
    Currency translation differences                   €45,000,000
    Items that will not be reclassified to profit or loss
    Remeasurement of defined benefit pension plans    (€12,000,000)
    Total other comprehensive income                  €33,000,000
    
    Total comprehensive income for the year           €407,000,000
    
    NOTES TO THE FINANCIAL STATEMENTS
    
    Note 1: Basis of preparation
    The consolidated financial statements have been prepared in accordance with International Financial Reporting Standards (IFRS) as adopted by the European Union and the Companies Act 2014.
    
    Note 2: Property, plant and equipment
    Property, plant and equipment are stated at cost less accumulated depreciation and impairment losses. Depreciation is calculated using the straight-line method over the estimated useful lives of the assets.
    
    Note 3: Intangible assets
    Intangible assets are recognised at cost and are amortised over their estimated useful lives. Goodwill is not amortised but is tested for impairment annually.
    
    Note 4: Revenue recognition
    Revenue is recognised when control of goods or services is transferred to customers at an amount that reflects the consideration to which the Group expects to be entitled.
    """

async def demo_single_requirement_assessment(compliance_assessor: IFRSComplianceAssessor):
    """Demonstrate single requirement assessment"""
    print("\n" + "="*60)
    print("DEMO: Single IFRS Requirement Assessment")
    print("="*60)
    
    # Create sample data
    entity_name = "Kerry Group plc"
    entity_business_description = "A global leader in the food and ingredients industry, providing taste and nutrition solutions for the food, beverage, and pharmaceutical markets."
    ifrs_requirement = IFRSRequirement(
        standard_name="IAS 1 Presentation of Financial Statements",
        requirement_text="An entity shall present a complete set of financial statements (including comparative information) at least annually.",
        requirement_id="IAS1_1"
    )
    afs_content = create_sample_financial_statements()
    
    # Perform assessment
    print(f"Assessing requirement: {ifrs_requirement.standard_name}")
    print(f"Requirement: {ifrs_requirement.requirement_text}")
    
    result = await compliance_assessor.assess_single_requirement(
        entity_name=entity_name,
        entity_business_description=entity_business_description,
        ifrs_requirement=ifrs_requirement,
        afs_content=afs_content
    )
    
    # Display results
    print(f"\nAssessment Results:")
    print(f"Applicability: {result.applicability_assessment.status.value}")
    print(f"Applicability Reasoning: {result.applicability_assessment.reasoning}")
    print(f"Compliance: {result.compliance_assessment.status.value}")
    print(f"Compliance Reasoning: {result.compliance_assessment.reasoning}")
    print(f"Evidence Citations: {result.compliance_assessment.evidence_citations}")
    print(f"Suggested Follow-up: {result.compliance_assessment.suggested_follow_up}")

async def demo_multiple_requirements_assessment(compliance_assessor: IFRSComplianceAssessor):
    """Demonstrate multiple requirements assessment"""
    print("\n" + "="*60)
    print("DEMO: Multiple IFRS Requirements Assessment")
    print("="*60)
    
    # Create sample data
    entity_name = "Kerry Group plc"
    entity_business_description = "A global leader in the food and ingredients industry, providing taste and nutrition solutions for the food, beverage, and pharmaceutical markets."
    ifrs_requirements = create_sample_ifrs_requirements()
    afs_content = create_sample_financial_statements()
    
    print(f"Assessing {len(ifrs_requirements)} IFRS requirements...")
    
    # Perform assessment
    results = await compliance_assessor.assess_multiple_requirements(
        entity_name=entity_name,
        entity_business_description=entity_business_description,
        ifrs_requirements=ifrs_requirements,
        afs_content=afs_content,
        max_concurrent=3
    )
    
    # Calculate summary
    summary = compliance_assessor.calculate_compliance_summary(results)
    
    # Display summary
    print(f"\nAssessment Summary:")
    print(f"Total Requirements: {summary.total_requirements}")
    print(f"Applicable Requirements: {summary.applicable_requirements}")
    print(f"Compliant Requirements: {summary.compliant_requirements}")
    print(f"Non-Compliant Requirements: {summary.non_compliant_requirements}")
    print(f"Insufficient Info Requirements: {summary.insufficient_info_requirements}")
    print(f"Not Applicable Requirements: {summary.not_applicable_requirements}")
    print(f"Overall Compliance Score: {summary.overall_compliance_score:.1f}%")
    print(f"Compliance Status: {summary.compliance_status}")
    
    # Display detailed results
    print(f"\nDetailed Results:")
    for i, result in enumerate(results, 1):
        print(f"\n{i}. {result.requirement.standard_name} - {result.requirement.requirement_id}")
        print(f"   Applicability: {result.applicability_assessment.status.value}")
        print(f"   Compliance: {result.compliance_assessment.status.value}")
        if result.compliance_assessment.status != ComplianceStatus.N_A_NOT_APPLICABLE:
            print(f"   Evidence: {result.compliance_assessment.evidence_citations[0] if result.compliance_assessment.evidence_citations else 'No evidence cited'}")

async def demo_comprehensive_report(compliance_assessor: IFRSComplianceAssessor):
    """Demonstrate comprehensive compliance report generation"""
    print("\n" + "="*60)
    print("DEMO: Comprehensive Compliance Report")
    print("="*60)
    
    # Create sample data
    entity_name = "Kerry Group plc"
    entity_business_description = "A global leader in the food and ingredients industry, providing taste and nutrition solutions for the food, beverage, and pharmaceutical markets."
    ifrs_requirements = create_sample_ifrs_requirements()
    afs_content = create_sample_financial_statements()
    
    print("Generating comprehensive compliance report...")
    
    # Perform assessment
    results = await compliance_assessor.assess_multiple_requirements(
        entity_name=entity_name,
        entity_business_description=entity_business_description,
        ifrs_requirements=ifrs_requirements,
        afs_content=afs_content,
        max_concurrent=3
    )
    
    # Calculate summary
    summary = compliance_assessor.calculate_compliance_summary(results)
    
    # Generate comprehensive report
    report = await compliance_assessor.generate_compliance_report(
        entity_name=entity_name,
        entity_business_description=entity_business_description,
        assessment_results=results,
        summary=summary
    )
    
    # Display report highlights
    print(f"\nComprehensive Report Highlights:")
    print(f"Entity: {report['entity_info']['name']}")
    print(f"Assessment Date: {report['entity_info']['assessment_date']}")
    
    if 'executive_summary' in report:
        exec_summary = report['executive_summary']
        print(f"Overall Compliance Score: {exec_summary.get('overall_compliance_score', 'N/A')}")
        print(f"Compliance Status: {exec_summary.get('compliance_status', 'N/A')}")
        print(f"Key Highlights: {exec_summary.get('key_highlights', 'N/A')}")
    
    if 'recommendations' in report and report['recommendations']:
        print(f"\nTop Recommendations:")
        for i, rec in enumerate(report['recommendations'][:3], 1):
            print(f"{i}. Priority: {rec.get('priority', 'N/A')}")
            print(f"   Category: {rec.get('category', 'N/A')}")
            print(f"   Description: {rec.get('description', 'N/A')}")
    
    # Save report to file
    report_filename = f"ifrs_compliance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_filename, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\nComprehensive report saved to: {report_filename}")

async def demo_entity_extraction(compliance_assessor: IFRSComplianceAssessor):
    """Demonstrate entity information extraction"""
    print("\n" + "="*60)
    print("DEMO: Entity Information Extraction")
    print("="*60)
    
    afs_content = create_sample_financial_statements()
    
    print("Extracting entity information from financial statements...")
    
    entity_name, business_description = await compliance_assessor.extract_entity_info_from_afs(
        afs_content=afs_content
    )
    
    print(f"Extracted Entity Name: {entity_name}")
    print(f"Extracted Business Description: {business_description}")

async def demo_ifrs_requirements_parsing(compliance_assessor: IFRSComplianceAssessor):
    """Demonstrate IFRS requirements parsing"""
    print("\n" + "="*60)
    print("DEMO: IFRS Requirements Parsing")
    print("="*60)
    
    # Sample IFRS text
    ifrs_text = """
    ## IFRS 1 First-time Adoption of International Financial Reporting Standards
    An entity shall prepare and present an opening IFRS statement of financial position at the date of transition to IFRSs.
    
    ## IAS 1 Presentation of Financial Statements
    An entity shall present a complete set of financial statements (including comparative information) at least annually.
    Financial statements shall present fairly the financial position, financial performance and cash flows of an entity.
    
    ## IAS 16 Property, Plant and Equipment
    An entity shall measure an item of property, plant and equipment at cost on initial recognition.
    After initial recognition, an entity shall choose either the cost model or the revaluation model as its accounting policy.
    """
    
    print("Parsing IFRS requirements from text...")
    
    requirements = await compliance_assessor.load_ifrs_requirements_from_text(
        ifrs_text=ifrs_text,
        requirements_delimiter="##"
    )
    
    print(f"Parsed {len(requirements)} requirements:")
    for i, req in enumerate(requirements, 1):
        print(f"{i}. {req.standard_name}")
        print(f"   Requirement: {req.requirement_text[:100]}...")
        print(f"   ID: {req.requirement_id}")

async def main():
    """Main demonstration function"""
    print("IFRS Compliance Assessment Demo")
    print("="*60)
    
    # Check if OPENAI_API_KEY environment variable exists
    if not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY environment variable is not set.")
        print("Please set this variable before running the program.")
        return
    
    # Configure logging
    configure_logging()
    
    # Create working directory
    if not os.path.exists(WORKING_DIR):
        os.makedirs(WORKING_DIR)
    
    # Initialize RAG
    print("Initializing LightRAG...")
    rag = await initialize_rag()
    
    # Initialize compliance assessor
    compliance_assessor = IFRSComplianceAssessor(rag)
    
    try:
        # Run demonstrations
        await demo_entity_extraction(compliance_assessor)
        await demo_ifrs_requirements_parsing(compliance_assessor)
        await demo_single_requirement_assessment(compliance_assessor)
        await demo_multiple_requirements_assessment(compliance_assessor)
        await demo_comprehensive_report(compliance_assessor)
        
        print("\n" + "="*60)
        print("Demo completed successfully!")
        print("="*60)
        
    except Exception as e:
        print(f"Error during demo: {str(e)}")
        logging.error(f"Demo error: {str(e)}")
    
    finally:
        # Cleanup
        await rag.finalize_storages()

if __name__ == "__main__":
    asyncio.run(main()) 