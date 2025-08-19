import asyncio
from io import BytesIO

from pypdf import PdfReader

async def pdf_to_text(pdf_bytes: bytes) -> str:
    def read():
        parts = []
        io = BytesIO(pdf_bytes)
        reader = PdfReader(io)
        for page in reader.pages:
            text = page.extract_text() or ""  # can be None
            if text.strip():
                parts.append(text.strip())
        return "\n\n".join(parts)
    return await asyncio.to_thread(read)