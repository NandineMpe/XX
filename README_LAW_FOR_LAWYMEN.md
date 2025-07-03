# 🏛️ Law for Lawymen - South Africa

**Simplifying South African Legal Knowledge for Everyone**

Law for Lawymen - South Africa is a specialized version of LightRAG designed to make South African legal information accessible to non-lawyers. This system helps ordinary South Africans understand complex legal concepts, procedures, and their rights and obligations under South African law through plain-language explanations and intelligent legal document analysis.

![Law for Lawymen Banner](assets/logo.png)

## 🎯 Mission

Our mission is to democratize legal knowledge by:
- **Translating legal jargon** into plain, everyday language
- **Providing practical guidance** on common legal issues
- **Empowering individuals** to understand their rights and obligations
- **Making legal research** accessible to everyone
- **Bridging the gap** between complex legal systems and ordinary people

## ✨ Key Features

### 🔍 **Intelligent Legal Research**
- Advanced RAG (Retrieval-Augmented Generation) for legal documents
- Multi-modal search across statutes, cases, regulations, and legal guides
- Context-aware responses that understand legal relationships

### 🗣️ **Plain Language Explanations**
- Converts complex legal terminology into understandable language
- Provides practical implications of legal concepts
- Explains the "why" behind legal rules, not just the "what"

### 🕸️ **Legal Knowledge Graph**
- Visual representation of legal relationships
- Connects laws, cases, procedures, and entities
- Helps users understand how different legal concepts relate

### 📚 **Comprehensive Legal Coverage**
- Tenant rights and landlord-tenant law
- Contract law basics
- Small claims court procedures
- Employment law fundamentals
- Family law essentials
- Consumer protection rights
- And much more...

### ⚖️ **Ethical AI Guidance**
- Clear distinction between legal information and legal advice
- Recommendations for when to seek professional legal help
- Transparent about limitations and uncertainties

## 🚀 Quick Start

### Prerequisites

1. **Python 3.10+** installed on your system
2. **OpenAI API Key** (or compatible LLM service)
3. **Git** for cloning the repository

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NandineMpe/LightRAG.git
   cd LightRAG
   ```

2. **Install dependencies:**
   ```bash
   pip install -e ".[api]"
   ```

3. **Configure your environment:**
   ```bash
   cp .env.example .env
   # Edit .env file with your API keys and preferences
   ```

4. **Set your OpenAI API Key:**
   ```bash
   # In .env file, update:
   LLM_BINDING_API_KEY=your_openai_api_key_here
   EMBEDDING_BINDING_API_KEY=your_openai_api_key_here
   ```

### Running the Demo

Experience Law for Lawymen with our comprehensive demo:

```bash
python examples/law_for_lawymen_demo.py
```

This demo will:
- Initialize the legal RAG system
- Load sample legal content
- Demonstrate legal queries and responses
- Show the legal knowledge graph in action

### Starting the Web Interface

Launch the full web interface:

```bash
lightrag-server
```

Then open your browser to: **http://localhost:9621/webui/**

## 📖 Usage Guide

### 1. **Adding Legal Documents**

Upload your legal documents through the web interface or programmatically:

```python
import asyncio
from lightrag import LightRAG
from lightrag.llm.openai import gpt_4o_mini_complete, openai_embed

async def add_legal_document():
    rag = LightRAG(
        working_dir="./legal_rag_storage",
        embedding_func=openai_embed,
        llm_model_func=gpt_4o_mini_complete
    )
    
    await rag.initialize_storages()
    
    # Add legal content
    with open("tenant_rights_guide.txt", "r") as f:
        content = f.read()
    
    await rag.ainsert(content)
    await rag.finalize_storages()

asyncio.run(add_legal_document())
```

### 2. **Asking Legal Questions**

Use natural language to ask legal questions:

**Examples:**
- "What are my rights as a tenant?"
- "How do I file a small claims case?"
- "What makes a contract legally binding?"
- "Can my employer fire me without cause?"
- "What should I do if I'm being evicted?"

### 3. **Understanding Legal Relationships**

Explore the legal knowledge graph to understand how different legal concepts connect:
- Laws and their enforcement mechanisms
- Court hierarchies and jurisdictions
- Legal procedures and their requirements
- Rights and corresponding obligations

## 🛠️ Customization

### Legal Entity Types

The system recognizes specialized legal entities:

```python
LEGAL_ENTITY_TYPES = [
    "law", "statute", "regulation", "case", "court", "judge",
    "attorney", "contract", "right", "obligation", "procedure",
    "jurisdiction", "precedent", "doctrine", "penalty", "remedy"
]
```

### Custom Legal Prompts

Modify `lightrag/legal_prompts.py` to customize how the system:
- Extracts legal entities and relationships
- Responds to legal queries
- Summarizes legal content
- Explains complex legal concepts

### Configuration Options

Key settings in `.env` for legal optimization:

```bash
# Legal-specific RAG settings
HISTORY_TURNS=5                    # More context for legal discussions
TOP_K=80                          # More comprehensive legal research
MAX_TOKEN_TEXT_CHUNK=6000         # Larger chunks for legal documents
CHUNK_SIZE=1500                   # Optimized for legal content
CHUNK_OVERLAP_SIZE=200            # Better legal context preservation

# Legal entity and relation settings
FORCE_LLM_SUMMARY_ON_MERGE=8      # More thorough legal entity merging
MAX_TOKEN_SUMMARY=750             # Detailed legal summaries
```

## 📚 South African Legal Content Areas

### Currently Supported:
- **Rental Housing Act 50 of 1999**: Tenant and landlord rights, eviction procedures, Rental Housing Tribunals
- **Consumer Protection Act 68 of 2008**: Consumer rights, warranties, cooling-off periods, product liability
- **Prevention of Illegal Eviction Act (PIE Act)**: Protection against unlawful evictions
- **Contract Law**: Formation, breach, remedies under South African common law
- **Small Claims Court**: Magistrate's Court procedures for amounts under R20,000

### Planned Additions:
- **Labour Relations Act**: Employment rights, unfair dismissal, CCMA procedures
- **Basic Conditions of Employment Act**: Working hours, leave, minimum wages
- **Promotion of Equality and Prevention of Unfair Discrimination Act**: Anti-discrimination laws
- **National Credit Act**: Credit agreements, debt counselling, reckless lending
- **Companies Act**: Business registration, director duties, close corporations
- **Matrimonial Property Act**: Marriage regimes, divorce, property division
- **Children's Act**: Child custody, maintenance, adoption procedures
- **Criminal Procedure Act**: Arrest procedures, bail, court processes
- **Road Traffic Act**: Traffic violations, licensing, accident procedures
- **Immigration Act**: Visa applications, work permits, permanent residence

## ⚠️ Important Disclaimers

### Legal Information vs. Legal Advice

**Law for Lawymen provides legal information, not legal advice.**

- **Legal Information**: General explanations of laws and procedures
- **Legal Advice**: Specific guidance for your particular situation

### When to Seek Professional Help

You should consult with a qualified attorney when:
- Facing serious legal consequences
- Dealing with complex legal documents
- Involved in litigation
- Unsure about your legal rights or obligations
- The stakes are high (financial, personal, or professional)

### Limitations

- Laws vary by jurisdiction (state, country, local)
- Legal information may become outdated
- Every legal situation is unique
- The system cannot replace professional legal counsel

## 🤝 Contributing

We welcome contributions to make legal knowledge more accessible!

### Ways to Contribute:

1. **Legal Content**: Add guides for new legal areas
2. **Translations**: Help make the system multilingual
3. **Bug Reports**: Report issues or inaccuracies
4. **Feature Requests**: Suggest improvements
5. **Documentation**: Improve guides and examples

### Contribution Guidelines:

1. **Accuracy**: Ensure legal information is current and accurate
2. **Clarity**: Write in plain language accessible to non-lawyers
3. **Citations**: Include references to relevant laws and cases
4. **Disclaimers**: Always include appropriate legal disclaimers

## 📄 License

This project is licensed under the same terms as the original LightRAG project. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **LightRAG Team**: For creating the excellent foundation
- **Legal Community**: For guidance on making law accessible
- **Open Source Contributors**: For ongoing improvements
- **Users**: For feedback and real-world testing

## 📞 Support

### Getting Help:
- **Documentation**: Check this README and the examples
- **Issues**: Report bugs on GitHub
- **Discussions**: Join community discussions
- **Professional Legal Help**: Consult with qualified attorneys for legal advice

### Contact:
- **GitHub**: [https://github.com/NandineMpe/LightRAG](https://github.com/NandineMpe/LightRAG)
- **Original Project**: [https://github.com/HKUDS/LightRAG](https://github.com/HKUDS/LightRAG)

---

**Remember: This system provides legal information to help you understand the law, but it cannot replace professional legal advice. When in doubt, consult with a qualified attorney.**

*Making the law accessible to everyone, one question at a time.* 🏛️⚖️
