from __future__ import annotations

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

from app.rag.embeddings import EmbeddingProvider


class FAISSVectorStore:
    """A thin LangChain/FAISS wrapper for curriculum retrieval."""

    def __init__(self, embedding_provider: EmbeddingProvider | None = None) -> None:
        self.embedding_provider = embedding_provider or EmbeddingProvider()
        self.index: FAISS | None = None

    def build(self, documents: list[Document]) -> FAISS:
        if not documents:
            raise ValueError("Cannot build a FAISS index from an empty document set")

        self.index = FAISS.from_documents(
            documents,
            embedding=self.embedding_provider.embedding_model,
        )
        return self.index

    def retrieve(self, query: str, top_k: int = 5) -> list[Document]:
        if self.index is None:
            raise RuntimeError("The FAISS index has not been initialized")

        results = self.index.similarity_search(query, k=top_k)
        return results
