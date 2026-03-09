"""
Recommendation Engine — matches missing skills to courses + practice tasks.
Courses are sorted: free first → highest rated → shortest duration.
"""
import logging
from typing import List, Dict

from database import get_supabase

logger = logging.getLogger(__name__)

# ─── Practice task templates per skill category ───────────────────────────
PRACTICE_TASKS: Dict[str, List[Dict]] = {
    "Python": [
        {"title": "Build a CLI Tool", "description": "Build a command-line calculator or to-do app using Python.", "skill": "Python", "difficulty": "beginner", "estimated_hours": 3},
        {"title": "REST API with FastAPI", "description": "Create a simple CRUD REST API using FastAPI and SQLite.", "skill": "Python", "difficulty": "intermediate", "estimated_hours": 5},
    ],
    "Machine Learning": [
        {"title": "Titanic Survival Prediction", "description": "Train a classification model on the Titanic dataset (Kaggle).", "skill": "Machine Learning", "difficulty": "beginner", "estimated_hours": 4},
        {"title": "House Price Regression", "description": "Implement a regression pipeline with feature engineering.", "skill": "Machine Learning", "difficulty": "intermediate", "estimated_hours": 6},
    ],
    "SQL": [
        {"title": "Sales Analysis Queries", "description": "Write 20 SQL queries of increasing complexity on a sales dataset.", "skill": "SQL", "difficulty": "beginner", "estimated_hours": 3},
        {"title": "Database Design", "description": "Design a normalized database schema for an e-commerce platform.", "skill": "SQL", "difficulty": "intermediate", "estimated_hours": 4},
    ],
    "React": [
        {"title": "Todo App", "description": "Build a fully functional todo app with hooks and local state.", "skill": "React", "difficulty": "beginner", "estimated_hours": 4},
        {"title": "Dashboard UI", "description": "Create a data dashboard with charts using Recharts.", "skill": "React", "difficulty": "intermediate", "estimated_hours": 8},
    ],
    "Docker": [
        {"title": "Containerise a Flask App", "description": "Write a Dockerfile and docker-compose.yml for a Flask API.", "skill": "Docker", "difficulty": "beginner", "estimated_hours": 3},
    ],
    "AWS": [
        {"title": "Deploy to EC2", "description": "Deploy a simple web server on an AWS EC2 free-tier instance.", "skill": "AWS", "difficulty": "beginner", "estimated_hours": 4},
    ],
    "Deep Learning": [
        {"title": "Image Classifier", "description": "Train a CNN to classify CIFAR-10 images using PyTorch/Keras.", "skill": "Deep Learning", "difficulty": "intermediate", "estimated_hours": 8},
    ],
    "Natural Language Processing": [
        {"title": "Sentiment Analyser", "description": "Build a sentiment analysis model on movie reviews.", "skill": "Natural Language Processing", "difficulty": "intermediate", "estimated_hours": 6},
    ],
    "default": [
        {"title": "Mini Project", "description": "Build a small project demonstrating your understanding of this skill.", "skill": "general", "difficulty": "beginner", "estimated_hours": 4},
    ],
}


def _get_practice_tasks(missing_skills: List[str]) -> List[Dict]:
    """Return max 6 relevant practice tasks for missing skills."""
    tasks = []
    for skill in missing_skills[:6]:
        skill_tasks = PRACTICE_TASKS.get(skill, PRACTICE_TASKS.get("default", []))
        for t in skill_tasks[:1]:  # one task per skill
            tasks.append({**t, "skill": skill})
    return tasks


def get_recommendations(missing_skills: List[str], job_role_id: str) -> Dict:
    """
    Fetch courses that cover any of the missing skills.
    Returns sorted courses + practice tasks.
    """
    if not missing_skills:
        return {"recommended_courses": [], "practice_tasks": []}

    supabase = get_supabase()
    missing_lower = [s.lower() for s in missing_skills]

    try:
        # Fetch all courses; filter those covering missing skills
        result = supabase.table("courses").select("*").execute()
        all_courses = result.data or []

        relevant = []
        for course in all_courses:
            covered = course.get("skills_covered") or []
            covered_lower = [c.lower() for c in covered]
            if any(s in covered_lower for s in missing_lower):
                relevant.append(course)

        # Sort: free first, then highest rating, then shortest duration
        def sort_key(c):
            type_order = {"free": 0, "certification": 1, "paid": 2}
            return (type_order.get(c.get("course_type", "paid"), 2), -c.get("rating", 0), c.get("duration_hours", 999))

        relevant.sort(key=sort_key)

        practice_tasks = _get_practice_tasks(missing_skills)

        return {
            "recommended_courses": relevant[:10],   # top 10
            "practice_tasks": practice_tasks,
        }

    except Exception as e:
        logger.error(f"Recommendation engine error: {e}")
        return {"recommended_courses": [], "practice_tasks": _get_practice_tasks(missing_skills)}
