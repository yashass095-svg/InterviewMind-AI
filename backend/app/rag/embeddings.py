from __future__ import annotations

from langchain_community.embeddings import FakeEmbeddings


class EmbeddingProvider:
    """A LangChain-compatible embedding adapter with a deterministic placeholder provider."""

    def __init__(self, embedding_model: object | None = None) -> None:
        # Use a deterministic placeholder embedding layer until a provider is connected.
        self.embedding_model = embedding_model or FakeEmbeddings(size=768)

    def embed_query(self, query: str) -> list[float]:
        return self.embedding_model.embed_query(query)

    def embed_documents(self, documents: list[str]) -> list[list[float]]:
        return self.embedding_model.embed_documents(documents)
