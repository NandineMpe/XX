#!/usr/bin/env python3
"""
Real IFRS Compliance Assessment Script

This script performs actual IFRS compliance assessments using:
1. Real IFRS requirements loaded from a file
2. Real financial statements from the RAG system
3. Real compliance checks against actual data

Usage:
    python real_ifrs_compliance_assessment.py --ifrs-file path/to/ifrs_requirements.txt --entity-name "Company Name" --output-dir ./results
"""

import asyncio
import argparse
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

# Add the parent directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from lightrag import LightRAG
from lightrag.ifrs_compliance import (
    IFRSComplianceAssessor,
    IFRSRequirement,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class RealIFRSComplianceAssessment:
    """
    Real IFRS Compliance Assessment System

    This class handles the complete workflow for performing actual IFRS compliance
    assessments using real data from files and RAG systems.
    """

    def __init__(self, working_dir: str = "./ifrs_assessment_workspace"):
        """
        Initialize the real IFRS compliance assessment system

        Args:
            working_dir: Directory for storing assessment results and temporary files
        """
        self.working_dir = Path(working_dir)
        self.working_dir.mkdir(parents=True, exist_ok=True)

        self.rag: Optional[LightRAG] = None
        self.assessor: Optional[IFRSComplianceAssessor] = None

        logger.info("Initialized IFRS Compliance Assessment System")
        logger.info(f"Working directory: {self.working_dir}")

    async def initialize_rag(self, config_path: Optional[str] = None) -> None:
        """
        Initialize the LightRAG system

        Args:
            config_path: Path to LightRAG configuration file
        """
        try:
            logger.info("Initializing LightRAG system...")

            # Initialize LightRAG with your actual configuration
            if config_path and os.path.exists(config_path):
                # Load from config file
                self.rag = await LightRAG.from_config(config_path)
                logger.info(f"Loaded LightRAG from config: {config_path}")
            else:
                # Initialize with default configuration
                self.rag = await LightRAG(
                    # Add your actual configuration here
                    # Example:
                    # llm_name="gpt-4",
                    # llm_config={"api_key": os.getenv("OPENAI_API_KEY")},
                    # kv_storage="json",
                    # vector_storage="faiss",
                    # graph_storage="networkx"
                )
                logger.info("Initialized LightRAG with default configuration")

            # Initialize the compliance assessor
            self.assessor = IFRSComplianceAssessor(self.rag)
            logger.info("IFRS Compliance Assessor initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize LightRAG: {str(e)}")
            raise

    def load_ifrs_requirements_from_file(
        self, file_path: str, delimiter: str = "##"
    ) -> List[IFRSRequirement]:
        """
        Load IFRS requirements from a text file

        Args:
            file_path: Path to the file containing IFRS requirements
            delimiter: Delimiter used to separate different requirements

        Returns:
            List of IFRSRequirement objects
        """
        try:
            logger.info(f"Loading IFRS requirements from: {file_path}")

            if not os.path.exists(file_path):
                raise FileNotFoundError(
                    f"IFRS requirements file not found: {file_path}"
                )

            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Parse requirements using the assessor's method
            requirements = asyncio.run(
                self.assessor.load_ifrs_requirements_from_text(content, delimiter)
            )

            logger.info(f"Successfully loaded {len(requirements)} IFRS requirements")
            return requirements

        except Exception as e:
            logger.error(f"Failed to load IFRS requirements: {str(e)}")
            raise

    async def extract_financial_statements_from_rag(
        self, query: str = "financial statements annual report"
    ) -> str:
        """
        Extract financial statements content from the RAG system

        Args:
            query: Query to search for financial statements in the RAG

        Returns:
            Extracted financial statements content
        """
        try:
            logger.info("Extracting financial statements from RAG system...")

            # Use RAG to search for financial statements content
            response = await self.rag.aquery(query=query, mode="hybrid", top_k=10)

            if not response or not response.content:
                raise ValueError("No financial statements content found in RAG system")

            # Combine all relevant content
            afs_content = response.content

            logger.info(
                f"Extracted {len(afs_content)} characters of financial statements content"
            )
            return afs_content

        except Exception as e:
            logger.error(f"Failed to extract financial statements: {str(e)}")
            raise

    async def extract_entity_info_from_afs(self, afs_content: str) -> tuple[str, str]:
        """
        Extract entity name and business description from financial statements

        Args:
            afs_content: Financial statements content

        Returns:
            Tuple of (entity_name, business_description)
        """
        try:
            logger.info("Extracting entity information from financial statements...")

            (
                entity_name,
                business_description,
            ) = await self.assessor.extract_entity_info_from_afs(
                afs_content=afs_content
            )

            logger.info(f"Extracted entity: {entity_name}")
            logger.info(f"Business description: {business_description[:100]}...")

            return entity_name, business_description

        except Exception as e:
            logger.error(f"Failed to extract entity info: {str(e)}")
            raise

    async def perform_compliance_assessment(
        self,
        entity_name: str,
        entity_business_description: str,
        ifrs_requirements: List[IFRSRequirement],
        afs_content: str,
        max_concurrent: int = 5,
    ) -> List[Any]:
        """
        Perform the actual compliance assessment

        Args:
            entity_name: Name of the entity being assessed
            entity_business_description: Description of the entity's business
            ifrs_requirements: List of IFRS requirements to assess
            afs_content: Financial statements content
            max_concurrent: Maximum concurrent assessments

        Returns:
            List of assessment results
        """
        try:
            logger.info(
                f"Starting compliance assessment for {len(ifrs_requirements)} requirements..."
            )
            logger.info(f"Entity: {entity_name}")
            logger.info(f"Max concurrent assessments: {max_concurrent}")

            # Perform the assessment
            results = await self.assessor.assess_multiple_requirements(
                entity_name=entity_name,
                entity_business_description=entity_business_description,
                ifrs_requirements=ifrs_requirements,
                afs_content=afs_content,
                max_concurrent=max_concurrent,
            )

            logger.info(f"Completed assessment of {len(results)} requirements")
            return results

        except Exception as e:
            logger.error(f"Failed to perform compliance assessment: {str(e)}")
            raise

    def calculate_summary_statistics(self, results: List[Any]) -> Dict[str, Any]:
        """
        Calculate summary statistics from assessment results

        Args:
            results: List of assessment results

        Returns:
            Dictionary containing summary statistics
        """
        try:
            logger.info("Calculating summary statistics...")

            summary = self.assessor.calculate_compliance_summary(results)

            stats = {
                "total_requirements": summary.total_requirements,
                "applicable_requirements": summary.applicable_requirements,
                "compliant_requirements": summary.compliant_requirements,
                "non_compliant_requirements": summary.non_compliant_requirements,
                "insufficient_info_requirements": summary.insufficient_info_requirements,
                "not_applicable_requirements": summary.not_applicable_requirements,
                "overall_compliance_score": summary.overall_compliance_score,
                "compliance_status": summary.compliance_status,
            }

            logger.info(f"Compliance Score: {summary.overall_compliance_score:.2f}%")
            logger.info(f"Compliance Status: {summary.compliance_status}")

            return stats

        except Exception as e:
            logger.error(f"Failed to calculate summary statistics: {str(e)}")
            raise

    async def generate_comprehensive_report(
        self,
        entity_name: str,
        entity_business_description: str,
        results: List[Any],
        summary_stats: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive compliance report

        Args:
            entity_name: Name of the entity
            entity_business_description: Business description
            results: Assessment results
            summary_stats: Summary statistics

        Returns:
            Comprehensive report dictionary
        """
        try:
            logger.info("Generating comprehensive compliance report...")

            summary = self.assessor.calculate_compliance_summary(results)
            report = await self.assessor.generate_compliance_report(
                entity_name=entity_name,
                entity_business_description=entity_business_description,
                assessment_results=results,
                summary=summary,
            )

            logger.info("Comprehensive report generated successfully")
            return report

        except Exception as e:
            logger.error(f"Failed to generate comprehensive report: {str(e)}")
            raise

    def save_results(
        self,
        results: List[Any],
        summary_stats: Dict[str, Any],
        comprehensive_report: Dict[str, Any],
        output_dir: str,
    ) -> None:
        """
        Save assessment results to files

        Args:
            results: Assessment results
            summary_stats: Summary statistics
            comprehensive_report: Comprehensive report
            output_dir: Directory to save results
        """
        try:
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

            # Save detailed results
            results_file = output_path / f"detailed_results_{timestamp}.json"
            with open(results_file, "w", encoding="utf-8") as f:
                json.dump(results, f, indent=2, default=str)
            logger.info(f"Detailed results saved to: {results_file}")

            # Save summary statistics
            summary_file = output_path / f"summary_statistics_{timestamp}.json"
            with open(summary_file, "w", encoding="utf-8") as f:
                json.dump(summary_stats, f, indent=2)
            logger.info(f"Summary statistics saved to: {summary_file}")

            # Save comprehensive report
            report_file = output_path / f"comprehensive_report_{timestamp}.json"
            with open(report_file, "w", encoding="utf-8") as f:
                json.dump(comprehensive_report, f, indent=2, default=str)
            logger.info(f"Comprehensive report saved to: {report_file}")

            # Create a summary text file
            summary_text_file = output_path / f"assessment_summary_{timestamp}.txt"
            with open(summary_text_file, "w", encoding="utf-8") as f:
                f.write("IFRS COMPLIANCE ASSESSMENT SUMMARY\n")
                f.write("=" * 50 + "\n\n")
                f.write(
                    f"Assessment Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
                )
                f.write(f"Total Requirements: {summary_stats['total_requirements']}\n")
                f.write(
                    f"Applicable Requirements: {summary_stats['applicable_requirements']}\n"
                )
                f.write(
                    f"Compliant Requirements: {summary_stats['compliant_requirements']}\n"
                )
                f.write(
                    f"Non-Compliant Requirements: {summary_stats['non_compliant_requirements']}\n"
                )
                f.write(
                    f"Insufficient Info Requirements: {summary_stats['insufficient_info_requirements']}\n"
                )
                f.write(
                    f"Not Applicable Requirements: {summary_stats['not_applicable_requirements']}\n"
                )
                f.write(
                    f"Overall Compliance Score: {summary_stats['overall_compliance_score']:.2f}%\n"
                )
                f.write(f"Compliance Status: {summary_stats['compliance_status']}\n")

            logger.info(f"Assessment summary saved to: {summary_text_file}")

        except Exception as e:
            logger.error(f"Failed to save results: {str(e)}")
            raise

    async def run_complete_assessment(
        self,
        ifrs_file_path: str,
        entity_name: Optional[str] = None,
        output_dir: str = "./assessment_results",
        max_concurrent: int = 5,
        ifrs_delimiter: str = "##",
    ) -> None:
        """
        Run the complete IFRS compliance assessment workflow

        Args:
            ifrs_file_path: Path to IFRS requirements file
            entity_name: Name of the entity (if not provided, will be extracted)
            output_dir: Directory to save results
            max_concurrent: Maximum concurrent assessments
            ifrs_delimiter: Delimiter for IFRS requirements
        """
        try:
            logger.info("Starting complete IFRS compliance assessment workflow...")

            # Step 1: Load IFRS requirements
            ifrs_requirements = self.load_ifrs_requirements_from_file(
                ifrs_file_path, ifrs_delimiter
            )

            # Step 2: Extract financial statements from RAG
            afs_content = await self.extract_financial_statements_from_rag()

            # Step 3: Extract entity information (if not provided)
            if not entity_name:
                (
                    entity_name,
                    entity_business_description,
                ) = await self.extract_entity_info_from_afs(afs_content)
            else:
                # Use provided entity name and extract business description
                entity_business_description = await self.extract_entity_info_from_afs(
                    afs_content
                )[1]

            # Step 4: Perform compliance assessment
            results = await self.perform_compliance_assessment(
                entity_name=entity_name,
                entity_business_description=entity_business_description,
                ifrs_requirements=ifrs_requirements,
                afs_content=afs_content,
                max_concurrent=max_concurrent,
            )

            # Step 5: Calculate summary statistics
            summary_stats = self.calculate_summary_statistics(results)

            # Step 6: Generate comprehensive report
            comprehensive_report = await self.generate_comprehensive_report(
                entity_name=entity_name,
                entity_business_description=entity_business_description,
                results=results,
                summary_stats=summary_stats,
            )

            # Step 7: Save results
            self.save_results(results, summary_stats, comprehensive_report, output_dir)

            logger.info(
                "Complete IFRS compliance assessment workflow finished successfully!"
            )

        except Exception as e:
            logger.error(f"Assessment workflow failed: {str(e)}")
            raise
        finally:
            # Clean up RAG system
            if self.rag:
                await self.rag.finalize_storages()


def main():
    """Main function to run the real IFRS compliance assessment"""
    parser = argparse.ArgumentParser(
        description="Real IFRS Compliance Assessment Script",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    # Run assessment with default settings
    python real_ifrs_compliance_assessment.py --ifrs-file ifrs_requirements.txt

    # Run assessment with custom entity name and output directory
    python real_ifrs_compliance_assessment.py --ifrs-file ifrs_requirements.txt --entity-name "ABC Corporation" --output-dir ./my_results

    # Run assessment with custom concurrency and delimiter
    python real_ifrs_compliance_assessment.py --ifrs-file ifrs_requirements.txt --max-concurrent 10 --delimiter "###"
        """,
    )

    parser.add_argument(
        "--ifrs-file",
        required=True,
        help="Path to the file containing IFRS requirements",
    )

    parser.add_argument(
        "--entity-name",
        help="Name of the entity being assessed (if not provided, will be extracted from financial statements)",
    )

    parser.add_argument(
        "--output-dir",
        default="./assessment_results",
        help="Directory to save assessment results (default: ./assessment_results)",
    )

    parser.add_argument(
        "--max-concurrent",
        type=int,
        default=5,
        help="Maximum concurrent assessments (default: 5)",
    )

    parser.add_argument(
        "--delimiter",
        default="##",
        help="Delimiter for separating IFRS requirements (default: ##)",
    )

    parser.add_argument("--config", help="Path to LightRAG configuration file")

    parser.add_argument(
        "--working-dir",
        default="./ifrs_assessment_workspace",
        help="Working directory for temporary files (default: ./ifrs_assessment_workspace)",
    )

    args = parser.parse_args()

    # Validate arguments
    if not os.path.exists(args.ifrs_file):
        logger.error(f"IFRS requirements file not found: {args.ifrs_file}")
        sys.exit(1)

    # Run the assessment
    async def run_assessment():
        assessment = RealIFRSComplianceAssessment(args.working_dir)

        try:
            # Initialize RAG system
            await assessment.initialize_rag(args.config)

            # Run complete assessment
            await assessment.run_complete_assessment(
                ifrs_file_path=args.ifrs_file,
                entity_name=args.entity_name,
                output_dir=args.output_dir,
                max_concurrent=args.max_concurrent,
                ifrs_delimiter=args.delimiter,
            )

            logger.info("Assessment completed successfully!")

        except Exception as e:
            logger.error(f"Assessment failed: {str(e)}")
            sys.exit(1)

    # Run the async assessment
    asyncio.run(run_assessment())


if __name__ == "__main__":
    main()
