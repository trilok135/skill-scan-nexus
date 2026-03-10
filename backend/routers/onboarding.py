from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os, numpy as np
from sentence_transformers import SentenceTransformer, util
from .auth import get_current_user   
from ..database import supabase      

router = APIRouter(prefix="/api/student", tags=["onboarding"])

# ── LOAD MODEL ONCE AT STARTUP — all-MiniLM-L6-v2 ────────────────────
# 80MB, fast, accurate enough for skill taxonomy matching
# Loads in ~2 seconds, then cached in memory for all subsequent calls
_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    return _model

# ── SKILL TAXONOMY — 120 canonical skills with categories ────────────
# These are pre-embedded at startup and cached
SKILL_TAXONOMY = [
    # Frontend
    "React", "Vue.js", "Angular", "Next.js", "TypeScript", "JavaScript",
    "Tailwind CSS", "CSS", "HTML", "GraphQL", "Redux", "Webpack", "Vite",
    "Jest", "Cypress", "WebSockets", "Accessibility", "Figma", "Storybook",
    # Backend
    "Node.js", "Python", "FastAPI", "Django", "Flask", "Express.js",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "REST API", "gRPC",
    "Message Queues", "JWT Authentication", "OAuth", "Microservices",
    "Celery", "SQL", "Database Design", "API Design",
    # DevOps / Cloud
    "Docker", "Kubernetes", "AWS", "Google Cloud", "Azure", "CI/CD",
    "GitHub Actions", "Terraform", "Ansible", "Nginx", "Linux",
    "Bash Scripting", "Prometheus", "Grafana", "Monitoring",
    # ML / AI
    "PyTorch", "TensorFlow", "scikit-learn", "Pandas", "NumPy",
    "Transformers", "LangChain", "Hugging Face", "ONNX", "Vector Databases",
    "OpenCV", "NLP", "Computer Vision", "MLOps", "Jupyter",
    "Feature Engineering", "Model Deployment", "FAISS",
    # Mobile
    "React Native", "Flutter", "Swift", "Kotlin", "Expo", "Firebase",
    "iOS Development", "Android Development", "Push Notifications",
    # General Engineering
    "Git", "Agile", "System Design", "Data Structures", "Algorithms",
    "Clean Code", "Code Review", "Technical Writing", "Problem Solving",
]

_taxonomy_embeddings = None

def get_taxonomy_embeddings():
    global _taxonomy_embeddings
    if _taxonomy_embeddings is None:
        model = get_model()
        _taxonomy_embeddings = model.encode(SKILL_TAXONOMY, convert_to_tensor=True)
    return _taxonomy_embeddings

# ── PROFICIENCY SCORING ───────────────────────────────────────────────
def score_to_proficiency(correct: int, total: int) -> str:
    if total == 0: return "beginner"
    ratio = correct / total
    if ratio >= 0.8:  return "advanced"
    if ratio >= 0.6:  return "intermediate"
    return "beginner"

# ── REQUEST SCHEMA ────────────────────────────────────────────────────
class MCQQuestionMeta(BaseModel):
    question: str
    skill: str
    correct_index: int

class OnboardingRequest(BaseModel):
    role: str
    years_experience: float
    selected_skills: List[str]
    mcq_answers: List[int]
    mcq_questions: List[MCQQuestionMeta]

# ── ENDPOINT ──────────────────────────────────────────────────────────
@router.post("/onboarding")
async def complete_onboarding(
    payload: OnboardingRequest,
    current_user: dict = Depends(get_current_user)
):
    student_id = current_user["user_id"]
    model = get_model()
    taxonomy_embs = get_taxonomy_embeddings()

    # ── Step 1: Embed user's selected skills
    if not payload.selected_skills:
        raise HTTPException(status_code=400, detail="No skills provided")

    user_skill_embs = model.encode(payload.selected_skills, convert_to_tensor=True)

    # ── Step 2: Match each user skill to closest canonical skill
    canonical_skills = []
    for i, skill_name in enumerate(payload.selected_skills):
        scores = util.cos_sim(user_skill_embs[i], taxonomy_embs)[0]
        best_idx = int(scores.argmax())
        best_score = float(scores[best_idx])

        if best_score >= 0.55:  # confidence threshold
            canonical_skills.append({
                "raw_input": skill_name,
                "canonical": SKILL_TAXONOMY[best_idx],
                "confidence": round(best_score, 3),
            })

    # ── Step 3: Score MCQ answers → proficiency per skill
    skill_scores: dict[str, list] = {}
    for qi, (q, user_answer) in enumerate(zip(payload.mcq_questions, payload.mcq_answers)):
        skill = q.skill
        is_correct = (user_answer == q.correct_index)
        if skill not in skill_scores:
            skill_scores[skill] = []
        skill_scores[skill].append(is_correct)

    # ── Step 4: Build final skill profile
    skill_profile = []
    for cs in canonical_skills:
        canonical_name = cs["canonical"]
        raw_name = cs["raw_input"]
        scores_for_skill = skill_scores.get(raw_name, skill_scores.get(canonical_name, []))
        correct = sum(scores_for_skill)
        total = len(scores_for_skill)
        proficiency = score_to_proficiency(correct, total)

        skill_profile.append({
            "skill_name": canonical_name,
            "proficiency": proficiency,
            "confidence": cs["confidence"],
            "source": "quiz",
        })

    # ── Step 5: Compute career tier from years + skill count
    skill_count = len(skill_profile)
    advanced_count = sum(1 for s in skill_profile if s["proficiency"] == "advanced")
    yrs = payload.years_experience

    if yrs >= 5 and advanced_count >= 4:
        tier = "gold"
    elif yrs >= 2 and skill_count >= 6:
        tier = "silver"
    else:
        tier = "bronze"

    profile_completeness = min(100, int((skill_count / 15) * 60 + (yrs / 10) * 40))

    # ── Step 6: Upsert to Supabase
    try:
        # Delete existing quiz skills for this student (re-onboarding case)
        supabase.table("student_skills")\
            .delete()\
            .eq("student_id", student_id)\
            .eq("source", "quiz")\
            .execute()

        # Insert new skill profile
        if skill_profile:
            rows = [{"student_id": student_id, **s} for s in skill_profile]
            supabase.table("student_skills").insert(rows).execute()

        # Update student record
        supabase.table("students").upsert({
            "user_id": student_id,
            "target_role": payload.role,
            "years_experience": payload.years_experience,
            "career_tier": tier,
            "profile_complete_pct": profile_completeness,
            "onboarding_complete": True,
        }).eq("user_id", student_id).execute()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return {
        "status": "success",
        "data": {
            "skills_detected": len(skill_profile),
            "career_tier": tier,
            "profile_completeness": profile_completeness,
            "skill_profile": skill_profile,
        }
    }
