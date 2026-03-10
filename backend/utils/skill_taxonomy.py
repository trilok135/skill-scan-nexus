"""
Skill Taxonomy: Master list of ~200+ tech skills organised by category.
Used by the NLP service for skill extraction and matching.
"""

SKILL_TAXONOMY: dict = {
    "Programming Languages": [
        "Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#", "Go",
        "Rust", "Ruby", "PHP", "Swift", "Kotlin", "R", "MATLAB", "Scala", "Dart",
        "Perl", "Bash", "Shell", "PowerShell", "Haskell", "Elixir", "Groovy",
        "Julia", "Lua", "Assembly", "COBOL", "Fortran", "Objective-C",
    ],
    "Web Frontend": [
        "React", "Angular", "Vue.js", "Next.js", "Nuxt.js", "Svelte",
        "HTML", "HTML5", "CSS", "CSS3", "Bootstrap", "Tailwind CSS",
        "jQuery", "Redux", "MobX", "Zustand", "GraphQL", "Webpack", "Vite",
        "SASS", "SCSS", "Material UI", "Ant Design", "Chakra UI",
        "Storybook", "Cypress", "Jest", "React Testing Library",
        "Progressive Web Apps", "WebSockets", "Socket.io", "Axios",
    ],
    "Web Backend": [
        "Node.js", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot",
        "Spring", "Laravel", "Ruby on Rails", "ASP.NET", ".NET", "Gin", "Fiber",
        "NestJS", "Hapi.js", "Koa.js", "Fastify", "Strapi", "gRPC",
        "Microservices", "REST API", "RESTful API", "WebSockets",
    ],
    "Databases": [
        "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch",
        "SQLite", "Oracle", "DynamoDB", "Cassandra", "Firebase", "Supabase",
        "CouchDB", "Neo4j", "InfluxDB", "MariaDB", "MS SQL Server",
        "Database Design", "ORM", "Prisma", "Sequelize", "SQLAlchemy", "Mongoose",
    ],
    "Data Science & Machine Learning": [
        "Machine Learning", "Deep Learning", "Artificial Intelligence",
        "TensorFlow", "PyTorch", "Keras", "scikit-learn", "Pandas", "NumPy",
        "Matplotlib", "Seaborn", "Plotly", "Jupyter", "Data Analysis",
        "Data Visualization", "Statistics", "Probability", "Linear Algebra",
        "Natural Language Processing", "Computer Vision", "Reinforcement Learning",
        "Neural Networks", "CNN", "RNN", "LSTM", "Transformers", "BERT",
        "Large Language Models", "LLM", "Feature Engineering", "MLOps",
        "Hugging Face", "XGBoost", "LightGBM", "Random Forest", "A/B Testing",
    ],
    "Cloud & DevOps": [
        "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud",
        "Docker", "Kubernetes", "CI/CD", "Jenkins", "GitHub Actions",
        "GitLab CI", "CircleCI", "Travis CI", "Terraform", "Ansible",
        "Helm", "Prometheus", "Grafana", "ELK Stack", "Linux", "Nginx",
        "Apache", "Load Balancing", "Serverless", "Lambda", "CloudFormation",
        "ArgoCD", "Service Mesh", "Istio",
    ],
    "Mobile Development": [
        "Android", "iOS", "React Native", "Flutter", "Xamarin",
        "SwiftUI", "Jetpack Compose", "Ionic", "Capacitor", "Cordova",
        "Unity", "Mobile UI Design",
    ],
    "Data Engineering": [
        "Apache Spark", "Hadoop", "Apache Kafka", "Apache Airflow", "dbt",
        "ETL", "Data Pipeline", "Data Warehouse", "Data Lake",
        "Snowflake", "BigQuery", "Redshift", "Databricks",
        "Flink", "Hive", "Parquet", "Delta Lake",
    ],
    "Cybersecurity": [
        "Cybersecurity", "Ethical Hacking", "Penetration Testing",
        "Network Security", "Cryptography", "OWASP", "Vulnerability Assessment",
        "SIEM", "SOC", "Incident Response", "Digital Forensics",
        "Malware Analysis", "Reverse Engineering", "Security Auditing",
        "Identity and Access Management", "Zero Trust", "OAuth", "JWT",
    ],
    "Design & UX": [
        "UI Design", "UX Design", "Figma", "Adobe XD", "Sketch",
        "Photoshop", "Illustrator", "InVision", "Framer",
        "User Research", "Wireframing", "Prototyping", "Usability Testing",
        "Design Systems", "Accessibility", "Information Architecture",
    ],
    "Project Management & Tools": [
        "Agile", "Scrum", "Kanban", "Jira", "Confluence", "Trello",
        "Asana", "Notion", "Git", "GitHub", "GitLab", "Bitbucket",
        "Code Review", "Technical Writing", "Documentation", "SDLC",
    ],
    "Business & Analytics": [
        "Product Management", "Business Analysis", "Data Analytics",
        "Business Intelligence", "Power BI", "Tableau", "Looker",
        "Excel", "Google Analytics", "SEO", "Financial Modeling",
        "Stakeholder Management", "Marketing Analytics",
    ],
}

# Synonyms map: aliases → canonical skill name
SKILL_SYNONYMS: dict = {
    "ML": "Machine Learning",
    "DL": "Deep Learning",
    "AI": "Artificial Intelligence",
    "JS": "JavaScript",
    "TS": "TypeScript",
    "k8s": "Kubernetes",
    "React.js": "React",
    "ReactJS": "React",
    "Vue": "Vue.js",
    "VueJS": "Vue.js",
    "AngularJS": "Angular",
    "Node": "Node.js",
    "NodeJS": "Node.js",
    "Express": "Express.js",
    "NLP": "Natural Language Processing",
    "CV": "Computer Vision",
    "RL": "Reinforcement Learning",
    "GCP": "Google Cloud",
    "sklearn": "scikit-learn",
    "Sklearn": "scikit-learn",
    "Postgres": "PostgreSQL",
    "Mongo": "MongoDB",
    "ES": "Elasticsearch",
    "TF": "TensorFlow",
    "Spark": "Apache Spark",
    "Kafka": "Apache Kafka",
    "Airflow": "Apache Airflow",
}

# Flat list of all canonical skills
ALL_SKILLS: list = list({skill for skills in SKILL_TAXONOMY.values() for skill in skills})
