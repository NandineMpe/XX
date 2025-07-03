"""
Law for Lawymen - South Africa Demo Script

This script demonstrates how to use the customized LightRAG system for South African legal 
document analysis and plain-language legal guidance. It shows how to:

1. Initialize the South African legal RAG system
2. Insert South African legal documents and content
3. Query the system with common South African legal questions
4. Get plain-language explanations of South African legal concepts

Usage:
    python examples/law_for_lawymen_demo.py

Requirements:
    - Set your OpenAI API key in the .env file
    - Ensure the legal_prompts.py module is available
"""

import os
import asyncio
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import gpt_4o_mini_complete, gpt_4o_complete, openai_embed
from lightrag.kg.shared_storage import initialize_pipeline_status
from lightrag.utils import setup_logger

# Import our custom legal prompts
try:
    from lightrag.legal_prompts import (
        LEGAL_QUERY_RESPONSE_PROMPT,
        LEGAL_ENTITY_TYPES,
        LEGAL_RELATIONSHIP_TYPES
    )
except ImportError:
    print("Legal prompts module not found. Using default prompts.")
    LEGAL_QUERY_RESPONSE_PROMPT = None

# Setup logging
setup_logger("lightrag", level="INFO")

# Configuration
WORKING_DIR = "./legal_rag_storage"
LEGAL_DOCUMENTS_DIR = "./legal_documents"

# Sample South African legal content for demonstration
SAMPLE_LEGAL_CONTENT = {
    "rental_housing_act": """
    South African Rental Housing Act: Tenant Rights

    Under the Rental Housing Act 50 of 1999, tenants in South Africa have specific rights:

    Rights:
    1. Right to Habitable Accommodation: Your landlord must provide accommodation that meets basic health and safety standards including adequate water, sanitation, electricity, and protection from elements.
    2. Right to Privacy: Landlords must give reasonable notice (usually 24 hours) before entering your rental unit.
    3. Right to Security Deposit Return: Deposits must be held in interest-bearing accounts and returned within 7-14 days after lease ends.
    4. Protection Against Unfair Eviction: The Prevention of Illegal Eviction Act (PIE Act) protects you from unlawful evictions.
    5. Protection Against Discrimination: You cannot be discriminated against based on race, gender, religion, or other protected characteristics.

    Responsibilities:
    1. Pay Rent on Time: Pay rent as specified in your lease agreement.
    2. Maintain the Property: Keep your rental unit reasonably clean and report maintenance issues.
    3. Follow Lease Terms: Comply with reasonable lease provisions.
    4. Give Proper Notice: Provide required notice when terminating lease.

    South African Eviction Process:
    1. Breach Notice: Landlord serves written notice to remedy breach (usually 20 business days for rent)
    2. Notice to Vacate: If breach not remedied, minimum 20 business days notice to vacate
    3. Court Application: Landlord must apply to court and prove eviction is just and equitable
    4. Court Order: Sheriff executes eviction only after court order

    Rental Housing Tribunals:
    - Free dispute resolution service
    - Available in all provinces
    - Can make binding orders
    - Contact your provincial tribunal for assistance

    When to Seek Legal Help:
    - Facing eviction proceedings
    - Landlord refuses to maintain habitability standards
    - Discrimination or harassment
    - Deposit wrongfully withheld
    - Complex lease disputes
    """,
    
    "small_claims_court": """
    Small Claims Court Guide

    Small claims court is designed for ordinary people to resolve disputes without lawyers for amounts typically under $5,000-$10,000 (varies by state).

    What Cases Can Be Filed:
    - Unpaid debts
    - Property damage
    - Breach of contract
    - Security deposit disputes
    - Minor personal injury claims
    - Landlord-tenant disputes

    Filing Process:
    1. Determine if your case qualifies (amount and type of dispute)
    2. Try to resolve the matter outside court first
    3. File complaint at appropriate courthouse
    4. Pay filing fee (usually $30-$100)
    5. Serve papers on defendant
    6. Prepare for hearing

    Preparing Your Case:
    - Organize all documents (contracts, receipts, photos, correspondence)
    - Prepare a clear timeline of events
    - Bring witnesses if available
    - Calculate exact damages
    - Practice explaining your case clearly and concisely

    At the Hearing:
    - Arrive early and dress appropriately
    - Present facts clearly and stick to relevant information
    - Show respect to the judge
    - Bring all evidence and be prepared to explain it
    - Listen carefully to the other side's arguments

    After Judgment:
    - If you win, you may need to collect the judgment yourself
    - If you lose, you may be able to appeal in some circumstances
    - Payment plans may be available

    Limitations:
    - Cannot seek punitive damages in most small claims courts
    - Cannot have attorney represent you in court (in most states)
    - Limited time to file (statute of limitations applies)
    """,
    
    "contract_basics": """
    Contract Law Basics

    A contract is a legally binding agreement between two or more parties. Understanding contract basics can help you in business and personal transactions.

    Elements of a Valid Contract:
    1. Offer: One party proposes terms
    2. Acceptance: Other party agrees to those terms
    3. Consideration: Something of value exchanged (money, services, goods)
    4. Legal Capacity: Parties must be legally able to enter contracts
    5. Legal Purpose: Contract cannot be for illegal activities

    Types of Contracts:
    - Written contracts: Terms are documented in writing
    - Oral contracts: Verbal agreements (harder to prove)
    - Implied contracts: Created by actions and circumstances
    - Express contracts: Terms are clearly stated

    Contract Terms:
    - Material terms: Essential elements (price, delivery, specifications)
    - Conditions: Requirements that must be met
    - Warranties: Promises about quality or performance
    - Remedies: What happens if contract is breached

    Breach of Contract:
    A breach occurs when one party fails to perform their obligations. Types include:
    - Material breach: Significant failure that defeats contract purpose
    - Minor breach: Small violation that doesn't destroy contract value
    - Anticipatory breach: One party indicates they won't perform

    Remedies for Breach:
    - Damages: Money compensation for losses
    - Specific performance: Court orders party to fulfill obligations
    - Rescission: Contract is cancelled and parties restored to original position
    - Reformation: Contract terms are modified to reflect true agreement

    Contract Defenses:
    - Fraud: One party was deceived
    - Duress: One party was forced to agree
    - Undue influence: One party took advantage of relationship
    - Mistake: Both parties were mistaken about important facts
    - Impossibility: Performance became impossible

    When to Seek Legal Help:
    - Complex business contracts
    - Significant financial stakes
    - Disputes over contract interpretation
    - Breach of contract situations
    - Contract modification needs
    """
}

# Sample South African legal questions for demonstration
SAMPLE_QUESTIONS = [
    "What are my rights as a tenant under the South African Rental Housing Act?",
    "Can my landlord evict me without going to court in South Africa?",
    "What is the PIE Act and how does it protect me from eviction?",
    "How do I lodge a complaint with a Rental Housing Tribunal?",
    "What are my consumer rights under the Consumer Protection Act?",
    "How long do I have to return goods under South African consumer law?",
    "What should I do if a supplier refuses to honor the 6-month warranty?",
    "How do I contact Legal Aid South Africa for free legal help?",
    "What is the difference between the Magistrate's Court and High Court?",
    "Can I represent myself in a South African small claims court?"
]

async def initialize_legal_rag():
    """Initialize the Law for Lawymen RAG system with legal-optimized settings."""
    
    # Create working directory if it doesn't exist
    if not os.path.exists(WORKING_DIR):
        os.makedirs(WORKING_DIR)
    
    # Initialize LightRAG with legal-optimized parameters
    rag = LightRAG(
        working_dir=WORKING_DIR,
        embedding_func=openai_embed,
        llm_model_func=gpt_4o_mini_complete,
        # Legal-optimized parameters
        chunk_token_size=1500,  # Larger chunks for legal context
        chunk_overlap_token_size=200,  # More overlap for legal continuity
        summary_to_max_tokens=750,  # More detailed entity summaries
        # Enhanced legal entity types
        addon_params={
            "example_number": 3,
            "language": "English",
            "entity_types": LEGAL_ENTITY_TYPES[:20] if LEGAL_ENTITY_TYPES else [
                "person", "organization", "law", "case", "court", "contract",
                "right", "obligation", "procedure", "jurisdiction"
            ]
        }
    )
    
    # Initialize storage and pipeline
    await rag.initialize_storages()
    await initialize_pipeline_status()
    
    return rag

async def insert_legal_content(rag):
    """Insert sample legal content into the RAG system."""
    print("📚 Inserting legal content into the knowledge base...")
    
    # Insert each piece of legal content
    for topic, content in SAMPLE_LEGAL_CONTENT.items():
        print(f"   Adding {topic.replace('_', ' ').title()} content...")
        await rag.ainsert(content)
    
    print("✅ Legal content successfully added to knowledge base!")

async def demonstrate_legal_queries(rag):
    """Demonstrate legal queries with the customized system."""
    print("\n🏛️ Law for Lawymen - Legal Query Demonstration")
    print("=" * 60)
    
    for i, question in enumerate(SAMPLE_QUESTIONS, 1):
        print(f"\n📋 Question {i}: {question}")
        print("-" * 50)
        
        try:
            # Use hybrid mode for comprehensive legal research
            response = await rag.aquery(
                question,
                param=QueryParam(
                    mode="hybrid",
                    response_type="Multiple Paragraphs",
                    top_k=80,  # More results for comprehensive legal research
                    max_token_for_text_unit=6000,  # Larger context for legal documents
                    max_token_for_global_context=5000,
                    max_token_for_local_context=5000,
                    # Custom user prompt for legal context
                    user_prompt="Explain this in plain language that a non-lawyer can understand. Include practical steps and mention when professional legal help is recommended."
                )
            )
            
            print(f"💡 Answer:\n{response}")
            
        except Exception as e:
            print(f"❌ Error processing question: {e}")
        
        # Add separator between questions
        if i < len(SAMPLE_QUESTIONS):
            print("\n" + "="*60)

async def demonstrate_legal_knowledge_graph(rag):
    """Demonstrate legal knowledge graph capabilities."""
    print("\n🕸️ Legal Knowledge Graph Demonstration")
    print("=" * 50)
    
    # Query for context only to see what the system has learned
    context_query = "What legal concepts and relationships has the system learned?"
    
    try:
        context_response = await rag.aquery(
            context_query,
            param=QueryParam(
                mode="global",
                only_need_context=True,
                top_k=50
            )
        )
        
        print("📊 Legal Knowledge Graph Context:")
        print(context_response[:1000] + "..." if len(context_response) > 1000 else context_response)
        
    except Exception as e:
        print(f"❌ Error retrieving knowledge graph context: {e}")

async def main():
    """Main demonstration function."""
    print("🏛️ Welcome to Law for Lawymen - Legal RAG System Demo")
    print("=" * 60)
    print("This demo shows how LightRAG can be customized for legal applications.")
    print("The system helps non-lawyers understand legal concepts in plain language.\n")
    
    try:
        # Initialize the legal RAG system
        print("🚀 Initializing Law for Lawymen system...")
        rag = await initialize_legal_rag()
        print("✅ System initialized successfully!")
        
        # Insert legal content
        await insert_legal_content(rag)
        
        # Demonstrate legal queries
        await demonstrate_legal_queries(rag)
        
        # Demonstrate knowledge graph
        await demonstrate_legal_knowledge_graph(rag)
        
        print("\n🎉 Demo completed successfully!")
        print("\n📝 Next Steps:")
        print("1. Add your own legal documents to the system")
        print("2. Customize the legal prompts for your specific needs")
        print("3. Start the web UI with: lightrag-server")
        print("4. Access the system at: http://localhost:9621/webui/")
        
    except Exception as e:
        print(f"❌ Demo failed with error: {e}")
        print("Please check your .env configuration and API keys.")
    
    finally:
        # Clean up
        if 'rag' in locals():
            await rag.finalize_storages()

if __name__ == "__main__":
    # Check for API key
    if not os.getenv("OPENAI_API_KEY") and not os.getenv("LLM_BINDING_API_KEY"):
        print("⚠️  Warning: No OpenAI API key found!")
        print("Please set OPENAI_API_KEY in your environment or update the .env file.")
        print("You can get an API key from: https://platform.openai.com/api-keys")
        exit(1)
    
    # Run the demo
    asyncio.run(main())
