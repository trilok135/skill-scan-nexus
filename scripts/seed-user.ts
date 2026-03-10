import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import resumeData from "../src/data/sample-resume.json" assert { type: "json" };

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const USER_EMAIL = "thrilokrajakeerthi@gmail.com";
const USER_PASSWORD = "1234567890";

async function seedUser() {
    console.log("🚀 Seeding user:", USER_EMAIL);

    // Try sign up first
    let { data, error } = await supabase.auth.signUp({
        email: USER_EMAIL,
        password: USER_PASSWORD,
        options: {
            data: {
                full_name: resumeData.name,
                role: "student",
            },
        },
    });

    // If already registered, sign in instead
    if (error && error.message.includes("already registered")) {
        console.log("🔄 User already exists — signing in to seed data...");
        const signin = await supabase.auth.signInWithPassword({
            email: USER_EMAIL,
            password: USER_PASSWORD,
        });
        data = signin.data;
        error = signin.error;
    }

    if (error) {
        console.error("❌ Auth error:", error.message);
        process.exit(1);
    }

    const userId = data.user?.id;
    if (!userId) {
        console.error("❌ Could not retrieve user ID");
        process.exit(1);
    }

    console.log("✅ Authenticated as:", data.user?.email);
    console.log("   User ID:", userId);

    // Upsert the profile with real resume data
    const { error: profileError } = await supabase
        .from("profiles")
        .update({
            full_name: resumeData.name,
            extracted_skills: resumeData.extracted_skills,
            resume_text: resumeData.resume_text,
            resume_url: "https://example.com/trilok-resume.pdf",
            experience: resumeData.experience,
            education: resumeData.education,
            projects: resumeData.projects,
            last_updated: new Date().toISOString(),
        })
        .eq("id", userId);

    if (profileError) {
        console.error("❌ Error seeding profile:", profileError.message);
        process.exit(1);
    }

    console.log("\n✅ Resume data seeded successfully!");
    console.log(`   Skills: ${resumeData.extracted_skills.map((s: any) => s.skill_name).join(", ")}`);
    console.log(`   Experience: ${resumeData.experience.length} entries`);
    console.log(`   Projects: ${resumeData.projects.length} entries`);
    console.log("\n🎯 Login with:");
    console.log(`   Email:    ${USER_EMAIL}`);
    console.log(`   Password: ${USER_PASSWORD}`);
    console.log("\n   Dashboard will show all skills and resume data immediately after login.");
}

seedUser();
