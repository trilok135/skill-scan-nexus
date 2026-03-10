import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedUser() {
    console.log("🚀 Seeding user: thrilokrajakeerthi@gmail.com");

    let { data, error } = await supabase.auth.signUp({
        email: "thrilokrajakeerthi@gmail.com",
        password: "1234567890",
        options: {
            data: {
                full_name: "Thrilok Raja Keerthi",
                role: "student",
            },
        },
    });

    if (error && error.message.includes("already registered")) {
        console.log("🔄 User already exists — logging in to seed data...");
        const signin = await supabase.auth.signInWithPassword({
            email: "thrilokrajakeerthi@gmail.com",
            password: "1234567890",
        });
        data = signin.data;
        error = signin.error;
    }

    if (error) {
        console.error("❌ Error authenticating user:", error.message);
        process.exit(1);
    } else {
        console.log("✅ User authenticated successfully!");
        console.log("   ID:", data.user?.id);
        console.log("   Email:", data.user?.email);

        // Seed the profile with a sample resume
        const sampleSkills = [
            { skill_name: "React", proficiency: "advanced", source: "resume" },
            { skill_name: "TypeScript", proficiency: "intermediate", source: "resume" },
            { skill_name: "Python", proficiency: "advanced", source: "resume" },
            { skill_name: "FastAPI", proficiency: "advanced", source: "resume" },
            { skill_name: "Machine Learning", proficiency: "beginner", source: "resume" }
        ];

        const { error: profileError } = await supabase.from("profiles").update({
            extracted_skills: sampleSkills,
            resume_text: "Sample Resume: Experienced Full Stack Engineer specializing in React and Python (FastAPI). Passionate about building highly scalable systems and seamless UIs. Familiar with basic Machine Learning concepts and looking for a software engineering role.",
            resume_url: "https://example.com/sample-resume.pdf",
            full_name: "Thrilok Raja Keerthi"
        }).eq("id", data.user?.id);

        if (profileError) {
            console.error("❌ Error seeding resume data to profile:", profileError.message);
        } else {
            console.log("✅ Sample resume and skills successfully seeded into database!");
        }
    }

    console.log("\n📧 Email confirmation:");
    console.log("   If 'Confirm email' is ON in Supabase Dashboard,");
    console.log("   the user will receive a confirmation email at thrilokrajakeerthi@gmail.com");
    console.log("\n   To enable: Supabase Dashboard → Auth → Providers → Email → Confirm email");
}

seedUser();
