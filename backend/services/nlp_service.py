"""
NLP Service — Skill extraction from resume text.
Uses spaCy PhraseMatcher when available, falls back to regex keyword matching.
"""
import re
import logging
from typing import List, Dict

from utils.skill_taxonomy import ALL_SKILLS, SKILL_SYNONYMS

logger = logging.getLogger(__name__)

# ─── Try to load spaCy ────────────────────────────────────────────────────
SPACY_AVAILABLE = False
nlp = None
matcher = None

try:
    import spacy
    from spacy.matcher import PhraseMatcher

    try:
        nlp = spacy.load("en_core_web_md")
        matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
        patterns = [nlp.make_doc(skill.lower()) for skill in ALL_SKILLS]
        matcher.add("SKILLS", patterns)
        SPACY_AVAILABLE = True
        logger.info("spaCy model loaded ✓")
    except OSError:
        logger.warning(
            "spaCy model not found. Run: python -m spacy download en_core_web_md\n"
            "Falling back to regex-based extraction."
        )
except ImportError:
    logger.warning("spaCy not installed. Using regex skill extraction.")


# ─── Helpers ──────────────────────────────────────────────────────────────

def normalize_skill(raw: str) -> str:
    """Return canonical skill name via synonyms map."""
    return SKILL_SYNONYMS.get(raw, raw)


def _determine_proficiency(skill: str, text_lower: str) -> str:
    s = skill.lower()
    advanced_indicators = [f"senior {s}", f"advanced {s}", f"expert {s}",
                           f"lead {s}", f"{s} expert", f"{s} senior",
                           f"proficient in {s}", f"{s} developer"]
    beginner_indicators = [f"basic {s}", f"beginner {s}", f"learning {s}",
                           f"familiar with {s}", f"exposure to {s}",
                           f"introduction to {s}", f"beginner level {s}"]
    if any(p in text_lower for p in advanced_indicators):
        return "advanced"
    if any(p in text_lower for p in beginner_indicators):
        return "beginner"
    return "intermediate"


# ─── Extraction methods ───────────────────────────────────────────────────

def _extract_spacy(text: str) -> List[str]:
    doc = nlp(text.lower())
    matches = matcher(doc)
    found = set()
    for match_id, start, end in matches:
        token_text = doc[start:end].text.strip()
        for skill in ALL_SKILLS:
            if skill.lower() == token_text:
                found.add(normalize_skill(skill))
                break
    return list(found)


def _extract_regex(text: str) -> List[str]:
    found = set()
    text_lower = text.lower()
    for skill in ALL_SKILLS:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, text_lower):
            found.add(normalize_skill(skill))
    for alias, canonical in SKILL_SYNONYMS.items():
        pattern = r"\b" + re.escape(alias.lower()) + r"\b"
        if re.search(pattern, text_lower):
            found.add(canonical)
    return list(found)


# ─── Public API ───────────────────────────────────────────────────────────

def extract_skills_from_text(text: str) -> List[Dict]:
    """
    Extract skills from resume/LinkedIn text.
    Returns: [{skill_name, proficiency, source}]
    """
    if not text or len(text.strip()) < 20:
        return []

    skills_list = _extract_spacy(text) if SPACY_AVAILABLE else _extract_regex(text)
    text_lower = text.lower()

    return [
        {
            "skill_name": skill,
            "proficiency": _determine_proficiency(skill, text_lower),
            "source": "resume",
        }
        for skill in skills_list
    ]
