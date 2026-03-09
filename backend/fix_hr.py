import os

hr_path = "d:/Memes and shit/skillmatchmain/skillmatch-connect-main/backend/routers/hr.py"

with open(hr_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('supabase.table("student_profiles")', 'supabase.table("profiles")')
content = content.replace('.eq("user_id"', '.eq("id"')
content = content.replace('.in_("user_id"', '.in_("id"')

with open(hr_path, "w", encoding="utf-8") as f:
    f.write(content)

print("HR router replaced successfully.")
