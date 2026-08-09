from __future__ import annotations

from pathlib import Path

from langchain_core.documents import Document

from app.rag.chunker import CurriculumChunker
from app.rag.embeddings import EmbeddingProvider
from app.rag.vector_store import FAISSVectorStore
from app.services.curriculum_service import CurriculumService


class RAGPipeline:
    """Production-ready modular interface for curriculum indexing and retrieval."""

    def __init__(
        self,
        data_file: Path | str | None = None,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        embedding_provider: EmbeddingProvider | None = None,
    ) -> None:
        self.curriculum_service = CurriculumService(data_file=data_file)
        self.chunker = CurriculumChunker(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        self.embedding_provider = embedding_provider or EmbeddingProvider()
        self.vector_store = FAISSVectorStore(embedding_provider=self.embedding_provider)

        self.documents: list[Document] = []
        self.index_ready = False
        self._load_and_index()

    def _load_and_index(self) -> None:
        curriculum_days = self.curriculum_service.load_curriculum()
        self.documents = self.chunker.chunk(curriculum_days)
        self.vector_store.build(self.documents)
        self.index_ready = True

    def retrieve(self, query: str, top_k: int = 5) -> list[Document]:
        if not self.index_ready:
            raise RuntimeError("The RAG pipeline has not been initialized")

        return self.vector_store.retrieve(query, top_k=top_k)

    def get_top_retrieval_text(self, query: str, top_k: int = 5) -> list[str]:
        documents = self.retrieve(query, top_k=top_k)
        return [document.page_content for document in documents]
