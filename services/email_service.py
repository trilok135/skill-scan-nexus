"""
Email Service — async email notifications using aiosmtplib.
Sends welcome emails, free course alerts, and verification emails.
"""
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Dict

import aiosmtplib
from config import settings

logger = logging.getLogger(__name__)


async def _send(to_email: str, subject: str, html_content: str) -> None:
    """Core async SMTP sender."""
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.warning(f"SMTP not configured — email to {to_email} skipped")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(html_content, "html"))

    try:
        async with aiosmtplib.SMTP(
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            use_tls=False,
        ) as smtp:
            await smtp.ehlo()
            await smtp.starttls()
            await smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            await smtp.send_message(msg)
        logger.info(f"Email sent → {to_email} | {subject}")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")


# ─── Email Templates ──────────────────────────────────────────────────────

def _base_template(title: str, body: str) -> str:
    return f"""
    <html><body style="font-family:Inter,sans-serif;background:#f4f6fb;margin:0;padding:0;">
    <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;
                box-shadow:0 4px 20px rgba(0,0,0,.08);overflow:hidden;">
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:30px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">SkillMatch AI</h1>
        <p style="color:#e0e7ff;margin:6px 0 0;font-size:14px;">Your Personal Career Navigator</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#1e1b4b;margin-top:0;">{title}</h2>
        {body}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">
        <p style="color:#9ca3af;font-size:12px;text-align:center;">
          SkillMatch AI &bull; Bridging student potential with industry expectations
        </p>
      </div>
    </div></body></html>
    """


async def send_welcome_email(user: Dict) -> None:
    body = f"""
    <p style="color:#374151;">Hi <strong>{user.get('full_name', 'there')}</strong>! 🎉</p>
    <p style="color:#374151;">Welcome to <strong>SkillMatch AI</strong> — your personal career navigator.</p>
    <p style="color:#374151;">Here's what you can do next:</p>
    <ul style="color:#374151;line-height:1.8;">
      <li>📄 Upload your resume to extract your skills automatically</li>
      <li>🎯 Discover your skill gap for any job role</li>
      <li>📚 Get personalised free course recommendations</li>
      <li>💼 Track your progress toward your dream job</li>
    </ul>
    <a href="{settings.FRONTEND_URL}/dashboard"
       style="display:inline-block;margin-top:16px;padding:12px 28px;
              background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;
              border-radius:8px;text-decoration:none;font-weight:600;">
      Go to Dashboard →
    </a>
    """
    await _send(user["email"], "Welcome to SkillMatch AI 🚀", _base_template("Welcome aboard!", body))


async def send_free_course_alert(user: Dict, courses: List[Dict]) -> None:
    course_items = "".join(
        f'<li style="margin-bottom:12px;">'
        f'<a href="{c.get("url","#")}" style="color:#6366f1;font-weight:600;">{c.get("title","Course")}</a>'
        f' — {c.get("provider","")}'
        f'</li>'
        for c in courses[:5]
    )
    body = f"""
    <p style="color:#374151;">Hi <strong>{user.get('full_name', 'there')}</strong>! 🎁</p>
    <p style="color:#374151;">Great news! We found <strong>{len(courses)} free course(s)</strong>
    that match your skill gaps:</p>
    <ul style="color:#374151;line-height:1.8;">{course_items}</ul>
    <p style="color:#374151;">Don't miss these opportunities to level up your profile!</p>
    <a href="{settings.FRONTEND_URL}/recommendations"
       style="display:inline-block;margin-top:16px;padding:12px 28px;
              background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;
              border-radius:8px;text-decoration:none;font-weight:600;">
      View All Recommendations →
    </a>
    """
    await _send(user["email"], "🎁 Free Courses for Your Skill Gaps!", _base_template("New Free Courses Available!", body))


async def send_verification_email(user: Dict, token: str) -> None:
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    body = f"""
    <p style="color:#374151;">Hi <strong>{user.get('full_name', 'there')}</strong>!</p>
    <p style="color:#374151;">Please verify your email address to activate your SkillMatch AI account.</p>
    <a href="{verify_url}"
       style="display:inline-block;margin-top:16px;padding:12px 28px;
              background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;
              border-radius:8px;text-decoration:none;font-weight:600;">
      Verify Email →
    </a>
    <p style="color:#9ca3af;font-size:12px;margin-top:16px;">This link expires in 24 hours.</p>
    """
    await _send(user["email"], "Verify Your SkillMatch AI Email", _base_template("Email Verification", body))
