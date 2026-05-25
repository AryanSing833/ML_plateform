from src.rag.embeddings import EmbeddingsModel
from src.rag.vector_store import VectorStore
from src.rag.groq_client import GroqClient
from src.rag.web_search import WebSearch
from src.rag.memory import MemoryManager

# Global Singletons to ensure state is shared between routes
embeddings_model = EmbeddingsModel()
vector_store = VectorStore()
groq_client = GroqClient()
web_search = WebSearch()
memory_manager = MemoryManager()
