"""
Gap Analysis Service — compares student skills vs job role requirements.
Must-have skills are weighted 70%, nice-to-have 30%.
"""
from typing import List, Dict, Tuple


def calculate_gap(
    student_skills: List[Dict],  # [{skill_name, proficiency, source}]
    required_skills: List[Dict],  # [{skill_name, importance}]
) -> Dict:
    """
    Returns:
        matched_skills  : list of skill names the student has
        missing_skills  : list of skill names the student is missing
        match_score     : 0–100 float (weighted)
        must_have_score : 0–100 float (must_have coverage only)
        details         : per-skill breakdown
    """
    if not required_skills:
        return {
            "matched_skills": [],
            "missing_skills": [],
            "match_score": 0.0,
            "must_have_score": 0.0,
            "details": [],
        }

    # Normalise student skill names to lowercase set
    student_skill_names = {s["skill_name"].lower() for s in student_skills}

    must_have = [r for r in required_skills if r.get("importance") == "must_have"]
    nice_to_have = [r for r in required_skills if r.get("importance") != "must_have"]

    matched = []
    missing = []
    details = []

    def _matched(skill_name: str) -> bool:
        return skill_name.lower() in student_skill_names

    for req in required_skills:
        sn = req["skill_name"]
        has_it = _matched(sn)
        if has_it:
            matched.append(sn)
        else:
            missing.append(sn)
        details.append(
            {
                "skill_name": sn,
                "importance": req.get("importance", "nice_to_have"),
                "matched": has_it,
            }
        )

    # Score calculation (weighted)
    def _pct(items):
        if not items:
            return 100.0
        covered = sum(1 for r in items if _matched(r["skill_name"]))
        return round(covered / len(items) * 100, 1)

    must_score = _pct(must_have)
    nice_score = _pct(nice_to_have)

    if must_have and nice_to_have:
        weighted = 0.70 * must_score + 0.30 * nice_score
    elif must_have:
        weighted = must_score
    else:
        weighted = nice_score

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "match_score": round(weighted, 1),
        "must_have_score": must_score,
        "details": details,
    }
