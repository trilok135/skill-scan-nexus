import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

// ── STAGE 1 DATA ──────────────────────────────────────────────────────
const ROLE_CATEGORIES = [
  { id: 'frontend', label: 'Frontend Engineer', icon: '⬡', color: '#60A5FA' },
  { id: 'backend', label: 'Backend Engineer', icon: '⬡', color: '#34D399' },
  { id: 'fullstack', label: 'Full Stack Engineer', icon: '⬡', color: '#D4A853' },
  { id: 'ml', label: 'ML / AI Engineer', icon: '⬡', color: '#F472B6' },
  { id: 'devops', label: 'DevOps / Cloud', icon: '⬡', color: '#A78BFA' },
  { id: 'mobile', label: 'Mobile Engineer', icon: '⬡', color: '#FB923C' },
]

// ── STAGE 3 DATA — skill chips per role ──────────────────────────────
const SKILL_POOL: Record<string, string[]> = {
  frontend: ['React', 'Vue', 'Angular', 'TypeScript', 'Next.js', 'Tailwind CSS',
    'GraphQL', 'Redux', 'Webpack', 'Jest', 'Cypress', 'WebSockets',
    'CSS Animations', 'Figma', 'Accessibility (a11y)'],
  backend: ['Node.js', 'Python', 'FastAPI', 'Django', 'Express', 'PostgreSQL',
    'Redis', 'Docker', 'REST APIs', 'gRPC', 'Message Queues',
    'JWT Auth', 'SQL', 'MongoDB', 'Microservices'],
  fullstack: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'REST APIs',
    'Next.js', 'Redis', 'CI/CD', 'GraphQL', 'Tailwind CSS',
    'MongoDB', 'JWT Auth', 'AWS S3', 'Git'],
  ml: ['Python', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy', 'Transformers',
    'LangChain', 'FastAPI', 'SQL', 'Docker', 'Hugging Face',
    'ONNX', 'Vector Databases', 'OpenCV', 'Jupyter'],
  devops: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux',
    'GitHub Actions', 'Nginx', 'Prometheus', 'Grafana',
    'Ansible', 'Bash', 'Python', 'GCP', 'Azure'],
  mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Expo',
    'Firebase', 'REST APIs', 'AsyncStorage', 'Push Notifications',
    'App Store Deploy', 'TypeScript', 'Redux', 'GraphQL',
    'Animations', 'Offline Storage'],
}

// ── STAGE 4 DATA — MCQ bank per skill ────────────────────────────────
const MCQ_BANK: Record<string, Array<{
  question: string
  options: string[]
  correctIndex: number
}>> = {
  'React': [
    {
      question: 'What hook would you use to run a side effect after every render?',
      options: ['useState', 'useEffect', 'useMemo', 'useCallback'],
      correctIndex: 1
    },
    {
      question: 'What does the key prop do in a list render?',
      options: [
        'Adds a CSS class',
        'Helps React identify which items changed',
        'Passes data to children',
        'Prevents re-renders'
      ],
      correctIndex: 1
    },
    {
      question: 'What is React.memo used for?',
      options: [
        'Memoizing async functions',
        'Preventing re-render if props unchanged',
        'Caching API responses',
        'Creating context providers'
      ],
      correctIndex: 1
    }
  ],
  'Python': [
    {
      question: 'What does the GIL prevent in CPython?',
      options: [
        'Memory allocation errors',
        'Multiple threads executing Python bytecode simultaneously',
        'Garbage collection',
        'Module circular imports'
      ],
      correctIndex: 1
    },
    {
      question: 'What is the output of: list(map(lambda x: x**2, [1,2,3]))?',
      options: ['[1,4,9]', '[2,4,6]', '(1,4,9)', '[1,2,3]'],
      correctIndex: 0
    },
    {
      question: 'Which is the correct way to create a virtual environment?',
      options: [
        'python --venv myenv',
        'pip install virtualenv myenv',
        'python -m venv myenv',
        'virtualenv --create myenv'
      ],
      correctIndex: 2
    }
  ],
  'Docker': [
    {
      question: 'What command shows all running containers?',
      options: ['docker list', 'docker ps', 'docker show', 'docker containers'],
      correctIndex: 1
    },
    {
      question: 'What is the difference between CMD and ENTRYPOINT in a Dockerfile?',
      options: [
        'CMD sets env vars, ENTRYPOINT copies files',
        'ENTRYPOINT sets the executable, CMD provides default args',
        'They are identical',
        'CMD runs at build time, ENTRYPOINT at push time'
      ],
      correctIndex: 1
    },
    {
      question: 'What does docker-compose up --build do?',
      options: [
        'Starts containers without rebuilding images',
        'Only builds images without starting',
        'Rebuilds images and starts all services',
        'Attaches to a running container'
      ],
      correctIndex: 2
    }
  ],
  'PostgreSQL': [
    {
      question: 'What does EXPLAIN ANALYZE do?',
      options: [
        'Creates an index automatically',
        'Shows the query execution plan with actual timing',
        'Runs the query twice for comparison',
        'Validates SQL syntax'
      ],
      correctIndex: 1
    },
    {
      question: 'What is a covering index?',
      options: [
        'An index on multiple tables',
        'An index that includes all columns needed by a query',
        'A partial index with a WHERE clause',
        'A full-text search index'
      ],
      correctIndex: 1
    }
  ],
  'TypeScript': [
    {
      question: 'What is the difference between type and interface in TypeScript?',
      options: [
        'type is for primitives only, interface for objects',
        'interface can be extended and merged, type cannot be re-opened',
        'They are completely identical',
        'type is deprecated in TS 5.x'
      ],
      correctIndex: 1
    },
    {
      question: 'What does the "!" non-null assertion operator do?',
      options: [
        'Throws an error if value is null',
        'Tells TypeScript compiler the value is definitely not null/undefined',
        'Converts null to false',
        'Creates a strict null check'
      ],
      correctIndex: 1
    }
  ],
}

// Generate 5 MCQ questions from selected skills
function generateQuestions(selectedSkills: string[]) {
  const available = selectedSkills.filter(s => MCQ_BANK[s])
  const questions: Array<typeof MCQ_BANK[string][0] & { skill: string }> = []
  let i = 0
  while (questions.length < 5 && available.length > 0) {
    const skill = available[i % available.length]
    const bank = MCQ_BANK[skill]
    const q = bank[Math.floor(questions.length / available.length) % bank.length]
    if (q && !questions.find(ex => ex.question === q.question)) {
      questions.push({ ...q, skill })
    }
    i++
    if (i > 50) break // safety
  }
  return questions
}

// ── STATE SHAPE ───────────────────────────────────────────────────────
interface QuizState {
  stage: 1 | 2 | 3 | 4 | 'analyzing' | 'done'
  selectedRole: string
  yearsExperience: number
  selectedSkills: string[]
  mcqAnswers: number[]           // index of chosen option per question
  generatedQuestions: ReturnType<typeof generateQuestions>
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────
export default function SkillQuiz() {
  const navigate = useNavigate()
  const [state, setState] = useState<QuizState>({
    stage: 1,
    selectedRole: '',
    yearsExperience: 0,
    selectedSkills: [],
    mcqAnswers: [],
    generatedQuestions: [],
  })

  // Redirect if already onboarded
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/login'); return }
      supabase
        .from('students')
        .select('onboarding_complete')
        .eq('user_id', session.user.id)
        .single()
        .then(({ data }) => {
          if (data?.onboarding_complete) navigate('/dashboard')
        })
    })
  }, [])

  async function submitQuiz() {
    setState(s => ({ ...s, stage: 'analyzing' }))
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/login'); return }

    const res = await fetch('http://localhost:8000/api/student/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        role: state.selectedRole,
        years_experience: state.yearsExperience,
        selected_skills: state.selectedSkills,
        mcq_answers: state.mcqAnswers,
        mcq_questions: state.generatedQuestions.map(q => ({
          question: q.question,
          skill: q.skill,
          correct_index: q.correctIndex,
        })),
      }),
    })

    if (res.ok) {
      setState(s => ({ ...s, stage: 'done' }))
      setTimeout(() => navigate('/dashboard'), 2000)
    } else {
      alert('Something went wrong. Please try again.')
      setState(s => ({ ...s, stage: 4 }))
    }
  }

  return (
    <div className="quiz-root">
      {/* Animated mesh background */}
      <div className="quiz-bg" />

      {/* Progress bar */}
      <div className="quiz-progress-track">
        <div
          className="quiz-progress-fill"
          style={{
            width: `${state.stage === 1 ? 0 :
                state.stage === 2 ? 25 :
                  state.stage === 3 ? 50 :
                    state.stage === 4 ? 75 :
                      state.stage === 'analyzing' ? 90 : 100
              }%`
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {state.stage === 1 && (
          <motion.div key="s1"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="quiz-stage"
          >
            <p className="quiz-step-label">Step 1 of 4</p>
            <h1 className="quiz-heading">What role are you<br />targeting?</h1>
            <p className="quiz-sub">We'll personalise your skill profile around this.</p>
            <div className="role-grid">
              {ROLE_CATEGORIES.map(role => (
                <button
                  key={role.id}
                  className={`role-card ${state.selectedRole === role.id ? 'role-card--active' : ''}`}
                  style={state.selectedRole === role.id ? { borderColor: role.color } : {}}
                  onClick={() => setState(s => ({ ...s, selectedRole: role.id }))}
                >
                  <span className="role-icon" style={{ color: role.color }}>{role.icon}</span>
                  <span className="role-label">{role.label}</span>
                </button>
              ))}
            </div>
            <button
              className="quiz-cta"
              disabled={!state.selectedRole}
              onClick={() => setState(s => ({ ...s, stage: 2 }))}
            >
              Continue →
            </button>
          </motion.div>
        )}

        {state.stage === 2 && (
          <motion.div key="s2"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="quiz-stage"
          >
            <p className="quiz-step-label">Step 2 of 4</p>
            <h1 className="quiz-heading">How long have you been<br />coding?</h1>
            <div className="slider-wrap">
              <input
                type="range" min={0} max={10} step={0.5}
                value={state.yearsExperience}
                onChange={e => setState(s => ({ ...s, yearsExperience: parseFloat(e.target.value) }))}
                className="quiz-slider"
              />
              <div className="slider-value">
                {state.yearsExperience === 0 ? 'Just starting out' :
                  state.yearsExperience < 1 ? 'Less than 1 year' :
                    state.yearsExperience === 1 ? '1 year' :
                      state.yearsExperience >= 10 ? '10+ years' :
                        `${state.yearsExperience} years`}
              </div>
            </div>
            <button
              className="quiz-cta"
              onClick={() => setState(s => ({ ...s, stage: 3 }))}
            >
              Continue →
            </button>
          </motion.div>
        )}

        {state.stage === 3 && (
          <motion.div key="s3"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="quiz-stage"
          >
            <p className="quiz-step-label">Step 3 of 4</p>
            <h1 className="quiz-heading">Which of these do<br />you already know?</h1>
            <p className="quiz-sub">Select everything you've used in a real project or can explain confidently.</p>
            <div className="skill-chip-grid">
              {(SKILL_POOL[state.selectedRole] || []).map(skill => (
                <button
                  key={skill}
                  className={`skill-chip ${state.selectedSkills.includes(skill) ? 'skill-chip--active' : ''}`}
                  onClick={() => setState(s => ({
                    ...s,
                    selectedSkills: s.selectedSkills.includes(skill)
                      ? s.selectedSkills.filter(x => x !== skill)
                      : [...s.selectedSkills, skill]
                  }))}
                >
                  {skill}
                  {state.selectedSkills.includes(skill) && <span className="chip-check"> ✓</span>}
                </button>
              ))}
            </div>
            <p className="quiz-selected-count">
              {state.selectedSkills.length} skill{state.selectedSkills.length !== 1 ? 's' : ''} selected
            </p>
            <button
              className="quiz-cta"
              disabled={state.selectedSkills.length < 2}
              onClick={() => {
                const questions = generateQuestions(state.selectedSkills)
                setState(s => ({ ...s, stage: 4, generatedQuestions: questions, mcqAnswers: [] }))
              }}
            >
              Continue →
            </button>
          </motion.div>
        )}

        {state.stage === 4 && (
          <motion.div key="s4"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="quiz-stage"
          >
            <p className="quiz-step-label">Step 4 of 4 — Depth Check</p>
            <h1 className="quiz-heading">Quick knowledge<br />verification</h1>
            <p className="quiz-sub">
              {state.generatedQuestions.length} questions based on your selected skills.
              No right or wrong pressure — this helps us calibrate your level.
            </p>
            <div className="mcq-list">
              {state.generatedQuestions.map((q, qi) => (
                <div key={qi} className="mcq-item">
                  <p className="mcq-question">
                    <span className="mcq-num">Q{qi + 1}</span> {q.question}
                  </p>
                  <div className="mcq-options">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        className={`mcq-option ${state.mcqAnswers[qi] === oi ? 'mcq-option--selected' : ''}`}
                        onClick={() => setState(s => {
                          const answers = [...s.mcqAnswers]
                          answers[qi] = oi
                          return { ...s, mcqAnswers: answers }
                        })}
                      >
                        <span className="mcq-letter">{['A', 'B', 'C', 'D'][oi]}</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="quiz-cta"
              disabled={state.mcqAnswers.filter(a => a !== undefined).length < state.generatedQuestions.length}
              onClick={submitQuiz}
            >
              Analyse My Skills →
            </button>
          </motion.div>
        )}

        {state.stage === 'analyzing' && (
          <motion.div key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="quiz-stage quiz-stage--center"
          >
            <div className="analyzer-pulse" />
            <h2 className="quiz-heading" style={{ fontSize: '2rem' }}>
              Analysing your skills...
            </h2>
            <p className="quiz-sub">Running transformer embedding pipeline</p>
          </motion.div>
        )}

        {state.stage === 'done' && (
          <motion.div key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="quiz-stage quiz-stage--center"
          >
            <div className="done-checkmark">✓</div>
            <h2 className="quiz-heading">Skill profile built.</h2>
            <p className="quiz-sub">Taking you to your dashboard...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
