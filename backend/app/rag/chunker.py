from __future__ import annotations

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.schemas.curriculum import CurriculumDay


class CurriculumChunker:
    """Chunk a curriculum into reusable LangChain documents."""

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50) -> None:
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
        )

    def chunk(self, curriculum_days: list[CurriculumDay]) -> list[Document]:
        """Convert curriculum days into documents and then split them."""
        raw_documents: list[Document] = []

        for curriculum_day in curriculum_days:
            page_content = (
                f"Day {curriculum_day.day}: {curriculum_day.topic}. "
                f"Objectives: {', '.join(curriculum_day.objectives) if curriculum_day.objectives else 'None'}. "
                f"Tools: {', '.join(curriculum_day.tools) if curriculum_day.tools else 'None'}."
            )
            raw_documents.append(
                Document(
                    page_content=page_content,
                    metadata={
                        "day": curriculum_day.day,
                        "topic": curriculum_day.topic,
                        "objectives": curriculum_day.objectives,
                        "tools": curriculum_day.tools,
                    },
                )
            )

        return self.splitter.split_documents(raw_documents)
