import pdfplumber
import sys

pdf_path = r"d:/Memes and shit/skillmatchmain/skillmatch-connect-main/TrilokKrResume (1).pdf"

with pdfplumber.open(pdf_path) as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            print(text)
