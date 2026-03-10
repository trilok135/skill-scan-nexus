"""
Tests for SkillMatch AI Backend
Run with: pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app

client = TestClient(app)


# ─── Auth Tests ───────────────────────────────────────────────────────────

def test_register_student(tmp_email="test_student_101@skillmatch.ai"):
    res = client.post("/api/auth/register", json={
        "email": tmp_email,
        "password": "TestPass123!",
        "full_name": "Test Student",
        "role": "student"
    })
    assert res.status_code in (201, 400)  # 400 = already exists


def test_login_invalid():
    res = client.post("/api/auth/login", json={
        "email": "nobody@nowhere.com",
        "password": "wrongpassword"
    })
    assert res.status_code == 401


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] in ("healthy", "unhealthy")


def test_root():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["service"] == "SkillMatch AI"


# ─── Skills Tests ─────────────────────────────────────────────────────────

def test_list_all_skills():
    res = client.get("/api/skills/all")
    assert res.status_code == 200
    data = res.json()
    assert "categories" in data
    assert data["total_skills"] > 100


def test_extract_skills_unauthenticated():
    """Should return 403 without a token."""
    res = client.post("/api/skills/extract", json={"text": "I know Python and React"})
    assert res.status_code == 403


# ─── Jobs Tests ───────────────────────────────────────────────────────────

def test_list_jobs():
    res = client.get("/api/jobs/")
    assert res.status_code == 200
    data = res.json()
    assert "jobs" in data


def test_get_nonexistent_job():
    res = client.get("/api/jobs/00000000-0000-0000-0000-000000000000")
    assert res.status_code == 404


# ─── NLP Unit Tests ───────────────────────────────────────────────────────

def test_skill_extraction_unit():
    from services.nlp_service import extract_skills_from_text
    text = "I have 3 years of experience with Python, Django, PostgreSQL and Docker."
    skills = extract_skills_from_text(text)
    skill_names = [s["skill_name"] for s in skills]
    assert "Python" in skill_names
    assert "Docker" in skill_names


def test_gap_analysis_unit():
    from services.gap_analysis import calculate_gap
    student_skills = [
        {"skill_name": "Python", "proficiency": "advanced"},
        {"skill_name": "SQL", "proficiency": "intermediate"},
    ]
    required_skills = [
        {"skill_name": "Python", "importance": "must_have"},
        {"skill_name": "Machine Learning", "importance": "must_have"},
        {"skill_name": "SQL", "importance": "nice_to_have"},
    ]
    result = calculate_gap(student_skills, required_skills)
    assert "Python" in result["matched_skills"]
    assert "Machine Learning" in result["missing_skills"]
    assert 0 <= result["match_score"] <= 100
