"""One-shot resume text extractor — run from backend/ directory"""
import sys
import os

# Add backend dir to path since pdfplumber is installed there
sys.path.insert(0, os.path.dirname(__file__))

try:
    import pdfplumber
except ImportError:
    print("ERROR: pdfplumber not installed. Run: pip install pdfplumber")
    sys.exit(1)

PDF_PATH = r"d:\Memes and shit\skillmatchmain\skillmatch-connect-main\TrilokKrResume (1).pdf"

with pdfplumber.open(PDF_PATH) as pdf:
    full_text = ""
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            full_text += text + "\n"

print(full_text)
