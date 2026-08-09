from __future__ import annotations

from langchain_core.documents import Document

from app.rag.vector_store import FAISSVectorStore


class RAGRetriever:
    """Retrieval abstraction that accepts a prepared FAISS vector store."""

    def __init__(self, vector_store: FAISSVectorStore | None = None) -> None:
        self.vector_store = vector_store or FAISSVectorStore()

    def add_documents(self, documents: list[Document]) -> None:
        self.vector_store.build(documents)

    def retrieve(self, query: str, top_k: int = 5) -> list[Document]:
        return self.vector_store.retrieve(query, top_k=top_k)
