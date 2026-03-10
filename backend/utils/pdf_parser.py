import logging
from typing import Optional
import pdfplumber
import io

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract clean text from PDF resume bytes.
    Uses pdfplumber for high-quality text extraction across all pages.
    """
    try:
        text_parts = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

        full_text = "\n".join(text_parts)

        # Basic cleanup
        lines = [line.strip() for line in full_text.splitlines() if line.strip()]
        cleaned = "\n".join(lines)

        logger.info(f"Extracted {len(cleaned)} characters from PDF ({len(text_parts)} pages)")
        return cleaned

    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        return ""
