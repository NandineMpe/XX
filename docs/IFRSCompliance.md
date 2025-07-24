# IFRS Compliance Assessment with LightRAG

## Overview

LightRAG now includes comprehensive IFRS (International Financial Reporting Standards) compliance assessment capabilities. This feature implements a sophisticated two-step assessment approach that mirrors how human auditors evaluate financial statements for compliance with IFRS requirements.

## Key Features

### Two-Step Assessment Process

1. **Applicability Assessment**: Determines if a given IFRS standard/requirement is relevant to the entity based on its business nature, industry, and activities.

2. **Compliance Assessment**: If and only if the standard/requirement is deemed applicable, then evaluates the Financial Statement Content against that specific requirement.

### Core Capabilities

- **Single Requirement Assessment**: Assess individual IFRS requirements against financial statements
- **Batch Assessment**: Process multiple requirements concurrently for efficiency
- **Comprehensive Reporting**: Generate detailed compliance reports with executive summaries
- **Entity Information Extraction**: Automatically extract entity details from financial statements
- **IFRS Requirements Parsing**: Parse IFRS requirements from text documents
- **Risk Assessment**: Identify and categorize compliance risks
- **Recommendations Engine**: Provide actionable recommendations for compliance improvement

## Architecture

### Components

1. **IFRSComplianceAssessor**: Main class for performing compliance assessments
2. **Data Models**: Structured data classes for requirements, assessments, and results
3. **API Routes**: RESTful endpoints for compliance operations
4. **Prompt Templates**: Specialized prompts for IFRS assessment tasks

### Data Flow

```
IFRS Requirements → Applicability Assessment → Compliance Assessment → Summary Report
     ↓                      ↓                        ↓                    ↓
Text/PDF Input → Business Context Analysis → Evidence Evaluation → Executive Summary
```

## Installation and Setup

### Prerequisites

- LightRAG installed and configured
- OpenAI API key (or other supported LLM provider)
- Python 3.8+

### Configuration

1. Set up your environment variables:
```bash
export OPENAI_API_KEY="your-api-key"
```

2. Ensure LightRAG is properly configured with your preferred LLM and embedding functions.

## Usage

### Basic Usage

```python
from lightrag import LightRAG
from lightrag.ifrs_compliance import IFRSComplianceAssessor, IFRSRequirement

# Initialize LightRAG
rag = LightRAG(
    working_dir="./compliance_workspace",
    embedding_func=openai_embed,
    llm_model_func=gpt_4o_mini_complete,
)

# Initialize compliance assessor
compliance_assessor = IFRSComplianceAssessor(rag)

# Create IFRS requirement
requirement = IFRSRequirement(
    standard_name="IAS 1 Presentation of Financial Statements",
    requirement_text="An entity shall present a complete set of financial statements at least annually.",
    requirement_id="IAS1_1"
)

# Perform assessment
result = await compliance_assessor.assess_single_requirement(
    entity_name="Sample Corp",
    entity_business_description="Manufacturing company",
    ifrs_requirement=requirement,
    afs_content="Financial statements content..."
)
```

### API Usage

#### Single Requirement Assessment

```bash
curl -X POST "http://localhost:8080/compliance/assess/single" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "entity_name": "Sample Corp",
    "entity_business_description": "Manufacturing company",
    "ifrs_requirement": {
      "standard_name": "IAS 1",
      "requirement_text": "An entity shall present a complete set of financial statements at least annually."
    },
    "afs_content": "Financial statements content..."
  }'
```

#### Multiple Requirements Assessment

```bash
curl -X POST "http://localhost:8080/compliance/assess" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "entity_name": "Sample Corp",
    "entity_business_description": "Manufacturing company",
    "ifrs_requirements": [
      {
        "standard_name": "IAS 1",
        "requirement_text": "An entity shall present a complete set of financial statements at least annually."
      }
    ],
    "afs_content": "Financial statements content...",
    "max_concurrent": 5
  }'
```

#### Comprehensive Report

```bash
curl -X POST "http://localhost:8080/compliance/assess/detailed" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "entity_name": "Sample Corp",
    "entity_business_description": "Manufacturing company",
    "ifrs_requirements": [...],
    "afs_content": "Financial statements content..."
  }'
```

## API Endpoints

### Compliance Assessment Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/compliance/assess` | POST | Assess multiple IFRS requirements |
| `/compliance/assess/single` | POST | Assess a single IFRS requirement |
| `/compliance/assess/detailed` | POST | Generate comprehensive compliance report |
| `/compliance/requirements/parse` | POST | Parse IFRS requirements from text |
| `/compliance/entity/extract` | POST | Extract entity information from financial statements |
| `/compliance/status` | GET | Get compliance system status |

### Request/Response Models

#### ComplianceAssessmentRequest
```json
{
  "entity_name": "string",
  "entity_business_description": "string",
  "ifrs_requirements": [
    {
      "standard_name": "string",
      "requirement_text": "string",
      "requirement_id": "string (optional)",
      "category": "string (optional)",
      "priority": "string (optional)"
    }
  ],
  "afs_content": "string",
  "ifrs_standards_context": "string (optional)",
  "max_concurrent": "integer (optional, default: 5)"
}
```

#### ComplianceAssessmentResponse
```json
{
  "status": "success|partial_success|failure",
  "message": "string",
  "assessment_id": "string",
  "total_requirements": "integer",
  "applicable_requirements": "integer",
  "compliant_requirements": "integer",
  "overall_compliance_score": "float",
  "compliance_status": "string",
  "assessment_timestamp": "string"
}
```

## Assessment Process

### Step 1: Applicability Assessment

The system first determines if an IFRS standard is applicable to the entity by considering:

- **Business Nature**: What type of business the entity operates
- **Industry Context**: The specific industry and sector
- **Operational Activities**: Core business activities and transactions
- **Regulatory Environment**: Applicable regulations and standards

**Possible Outcomes:**
- `APPLICABLE`: The standard is relevant to the entity
- `NOT_APPLICABLE`: The standard is not relevant (e.g., IFRS 17 for a manufacturing company)

### Step 2: Compliance Assessment

Only if the standard is applicable, the system evaluates compliance by:

- **Evidence Analysis**: Examining financial statement content for compliance evidence
- **Requirement Mapping**: Matching IFRS requirements to financial statement disclosures
- **Gap Identification**: Identifying missing or insufficient information
- **Compliance Scoring**: Determining compliance status

**Possible Outcomes:**
- `COMPLIANT`: Financial statements meet the requirement
- `NON_COMPLIANT`: Financial statements do not meet the requirement
- `INSUFFICIENT_INFO`: Not enough information to determine compliance
- `N/A_NOT_APPLICABLE`: Standard was not applicable (from Step 1)

## Output Formats

### Assessment Results

Each assessment produces structured results including:

```json
{
  "applicability_assessment": {
    "status": "APPLICABLE|NOT_APPLICABLE",
    "reasoning": "Detailed explanation of applicability decision"
  },
  "compliance_assessment": {
    "status": "COMPLIANT|NON_COMPLIANT|INSUFFICIENT_INFO|N/A_NOT_APPLICABLE",
    "reasoning": "Detailed explanation of compliance decision",
    "evidence_citations": [
      "Direct quotes from financial statements"
    ],
    "suggested_follow_up": "Recommendations for improvement"
  }
}
```

### Comprehensive Reports

Detailed reports include:

- **Executive Summary**: High-level compliance overview
- **Risk Assessment**: Categorized compliance risks
- **Recommendations**: Actionable improvement suggestions
- **Detailed Assessments**: Individual requirement assessments
- **Statistics**: Compliance metrics and scores

## Best Practices

### Preparing IFRS Requirements

1. **Structured Format**: Use consistent formatting for requirement text
2. **Clear Identification**: Include standard names and requirement IDs
3. **Categorization**: Group requirements by category and priority
4. **Context**: Provide additional IFRS context when needed

### Financial Statement Preparation

1. **Complete Content**: Include all relevant financial statement sections
2. **Clear Formatting**: Ensure text is properly formatted and readable
3. **Entity Information**: Include business description and industry context
4. **Comparative Data**: Include comparative information when available

### Assessment Configuration

1. **Concurrency**: Adjust `max_concurrent` based on system capabilities
2. **Context**: Provide additional IFRS context for complex requirements
3. **Validation**: Review assessment results for accuracy
4. **Documentation**: Maintain audit trails of assessments

## Examples

### Running the Demo

```bash
# Set up environment
export OPENAI_API_KEY="your-api-key"

# Run the demo
python examples/ifrs_compliance_demo.py
```

### Custom Implementation

```python
# Load IFRS requirements from file
with open("ifrs_requirements.txt", "r") as f:
    ifrs_text = f.read()

requirements = await compliance_assessor.load_ifrs_requirements_from_text(ifrs_text)

# Extract entity information
entity_name, business_description = await compliance_assessor.extract_entity_info_from_afs(afs_content)

# Perform comprehensive assessment
results = await compliance_assessor.assess_multiple_requirements(
    entity_name=entity_name,
    entity_business_description=business_description,
    ifrs_requirements=requirements,
    afs_content=afs_content
)

# Generate report
summary = compliance_assessor.calculate_compliance_summary(results)
report = await compliance_assessor.generate_compliance_report(
    entity_name=entity_name,
    entity_business_description=business_description,
    assessment_results=results,
    summary=summary
)
```

## Troubleshooting

### Common Issues

1. **API Key Issues**: Ensure your LLM API key is properly configured
2. **Memory Limitations**: Reduce `max_concurrent` for large assessments
3. **Timeout Errors**: Increase timeout settings for complex requirements
4. **Parsing Errors**: Check IFRS requirement format and delimiters

### Performance Optimization

1. **Batch Processing**: Use batch assessment for multiple requirements
2. **Caching**: Leverage LightRAG's built-in caching mechanisms
3. **Concurrency**: Adjust concurrent processing based on system resources
4. **Chunking**: Break large financial statements into manageable chunks

## Integration

### With Existing LightRAG Features

The IFRS compliance functionality integrates seamlessly with existing LightRAG capabilities:

- **Document Processing**: Use existing document upload and processing
- **Knowledge Graph**: Leverage entity extraction and relationship mapping
- **Query System**: Utilize advanced querying for context retrieval
- **Caching**: Benefit from built-in response caching

### External Systems

The API endpoints can be integrated with:

- **Audit Management Systems**: Automated compliance checking
- **Financial Reporting Tools**: Real-time compliance validation
- **Regulatory Reporting**: Automated regulatory compliance assessment
- **Risk Management Systems**: Compliance risk monitoring

## Future Enhancements

Planned improvements include:

- **Multi-language Support**: Support for different languages and jurisdictions
- **Advanced Analytics**: Machine learning-based compliance prediction
- **Real-time Monitoring**: Continuous compliance monitoring
- **Integration APIs**: Enhanced integration with external systems
- **Custom Standards**: Support for custom compliance frameworks

## Support

For questions and support:

1. Check the [LightRAG documentation](https://github.com/your-repo/lightrag)
2. Review the example scripts in the `examples/` directory
3. Open an issue on the GitHub repository
4. Contact the development team

## License

This IFRS compliance functionality is part of LightRAG and follows the same licensing terms. 