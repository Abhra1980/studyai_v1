import { useState } from "react";

const phases = [
  {
    id: 1,
    name: "Discovery & Research",
    icon: "🔍",
    color: "#6366F1",
    duration: "1–3 weeks",
    summary: "Understand the problem deeply before writing a single line of code. Evaluate AI/LLM opportunities early.",
    steps: [
      { title: "Problem Definition", desc: "Define the core problem, target users, and business goals. Write a clear problem statement. Identify if AI/LLM/ML can add value vs. rule-based solutions." },
      { title: "Market & Competitor Research", desc: "Analyze competitors, market size (TAM/SAM/SOM), and identify gaps/opportunities. Study AI-native competitors and LLM-powered products in the space." },
      { title: "User Research", desc: "Conduct user interviews, surveys, contextual inquiry. Build empathy maps and personas. Identify pain points where AI agents, chatbots, or intelligent automation can help." },
      { title: "AI/LLM Opportunity Assessment", desc: "Evaluate where LLMs (GPT, Claude, Gemini, Llama, Mistral), RAG pipelines, AI agents, or traditional ML models can solve user problems. Assess build vs. buy (API vs. fine-tuned vs. open-source)." },
      { title: "Data Strategy & Feasibility", desc: "Technical feasibility (can we build it?), data feasibility (do we have training data? Can we build a vector DB?). Assess data for RAG: documents, knowledge bases, SQL databases. Business feasibility (ROI)." },
      { title: "Define Success Metrics", desc: "Set north star metric, KPIs, OKRs. For ML: accuracy thresholds, latency SLAs, fairness metrics. For LLMs: hallucination rate, response quality, token costs, user satisfaction." },
    ],
    deliverables: ["Problem Statement", "User Personas", "Competitive Analysis", "AI Opportunity Assessment", "Data Strategy Report", "Feasibility Report", "Success Metrics Doc"],
    tools: ["Notion", "Miro", "Google Forms", "Dovetail", "Typeform", "ChatGPT/Claude for Research"],
  },
  {
    id: 2,
    name: "Product Design",
    icon: "🎨",
    color: "#8B5CF6",
    duration: "2–4 weeks",
    summary: "Design the experience before building — including AI-specific UX patterns for LLMs, agents, and intelligent features.",
    steps: [
      { title: "Information Architecture", desc: "Define site maps, navigation flows, content hierarchy, and user journey maps. Plan conversational flows for AI chatbots and agent interactions." },
      { title: "Wireframing (Low-Fi)", desc: "Sketch rough layouts for all key screens. Include AI-powered features: chat interfaces, search with RAG, recommendation panels, agent dashboards." },
      { title: "AI/LLM UX Design", desc: "Design conversational UX for LLM interactions: streaming responses, confidence indicators, source citations (RAG), feedback loops (thumbs up/down), prompt interfaces, and agent task views." },
      { title: "UI Design (High-Fi)", desc: "Create pixel-perfect designs with your design system — colors, typography, components, spacing. Design for AI uncertainty: loading states, error handling, fallback UX." },
      { title: "Prototyping & Usability Testing", desc: "Build interactive prototypes simulating real flows including AI features. Test with 5–8 users. Validate AI feature comprehension, trust, and transparency." },
      { title: "Design Review & Handoff", desc: "Finalize designs, document specs, create component library. Include AI component specs: chat bubbles, citation cards, agent status indicators, vector search results." },
    ],
    deliverables: ["User Flows", "Wireframes", "High-Fi Mockups", "AI/Chat UI Specs", "Interactive Prototype", "Design System", "Usability Test Report"],
    tools: ["Figma", "Sketch", "Adobe XD", "Maze", "UserTesting", "Storybook", "v0.dev"],
  },
  {
    id: 3,
    name: "Technical Architecture",
    icon: "🏗️",
    color: "#3B82F6",
    duration: "1–3 weeks",
    summary: "Plan the technical foundation — including LLM, RAG, Vector DB, AI Agent, SQL, and data platform architecture.",
    steps: [
      { title: "System Design", desc: "Define architecture: monolith vs microservices, API design, data flow diagrams (C4 model). Plan AI service layer: LLM gateway, RAG pipeline, agent orchestration, embedding service." },
      { title: "Tech Stack Selection", desc: "Frontend (React/Next.js), Backend (FastAPI/Django), Database (PostgreSQL/MongoDB), Cloud (AWS/GCP/Azure). AI Stack: LLM provider, vector DB (Pinecone/Weaviate/Qdrant/Chroma/pgvector), orchestration (LangChain/LlamaIndex)." },
      { title: "SQL & Database Architecture", desc: "Design relational DB schema (PostgreSQL/MySQL), write optimized SQL queries (CTEs, window functions, indexing). Plan data warehouse (Snowflake/BigQuery/Redshift/Databricks SQL). Design for analytics and ML feature stores." },
      { title: "LLM & RAG Architecture", desc: "Design RAG pipeline: document ingestion → chunking strategy → embedding model → vector DB → retrieval → LLM generation. Choose embedding models (OpenAI, Cohere, Sentence-BERT). Plan prompt management, caching (semantic cache), and guardrails." },
      { title: "AI Agent Architecture", desc: "Design autonomous/semi-autonomous AI agents: tool use, function calling, multi-step reasoning, memory (short/long-term). Plan agent frameworks (LangGraph, CrewAI, AutoGPT). Define agent boundaries, human-in-the-loop escalation paths." },
      { title: "Vector Database Design", desc: "Select vector DB (Pinecone, Weaviate, Qdrant, Chroma, Milvus, pgvector). Design index strategy, metadata filtering, hybrid search (vector + keyword). Plan embedding pipeline and data refresh strategy." },
      { title: "Data & ML Pipeline Architecture", desc: "Design ETL/ELT pipelines (Airflow, dbt, Spark). Plan Databricks workspace: notebooks, Unity Catalog, Delta Lake, MLflow integration. Feature store design (Feast/Tecton/Databricks Feature Store)." },
      { title: "API Contract & Integration Design", desc: "Write OpenAPI/Swagger specs. Define endpoints for CRUD, LLM inference, RAG queries, agent tasks. Design streaming API (SSE/WebSocket) for LLM responses. gRPC for low-latency ML serving." },
      { title: "Infrastructure & Security Planning", desc: "CI/CD pipeline, Docker/K8s setup, IaC (Terraform/CDK). Auth (OAuth2/JWT), encryption, RBAC. AI-specific: prompt injection prevention, PII filtering, content moderation, API key management for LLM providers." },
    ],
    deliverables: ["System Architecture Diagram", "RAG Pipeline Design", "AI Agent Design Doc", "Vector DB Schema", "SQL/DB Schema", "API Specs (OpenAPI)", "Data Pipeline Design", "ADRs", "Security Plan"],
    tools: ["Draw.io", "Excalidraw", "Swagger Editor", "dbdiagram.io", "Terraform", "Databricks", "LangSmith"],
  },
  {
    id: 4,
    name: "Project Setup & Sprint 0",
    icon: "⚙️",
    color: "#0EA5E9",
    duration: "1–2 weeks",
    summary: "Set up everything — dev environment, AI/ML tooling, databases, vector stores, and data pipelines before feature work begins.",
    steps: [
      { title: "Repository & Dev Environment", desc: "Create repos (monorepo/multi-repo), branching strategy, PR templates. Docker Compose for local dev with all services: API, DB, Redis, vector DB, LLM proxy." },
      { title: "Database & SQL Setup", desc: "PostgreSQL/MySQL setup with migrations (Alembic/Django). Seed data, SQL query library. Set up Databricks workspace, Delta Lake tables, Unity Catalog for data governance." },
      { title: "Vector Database Setup", desc: "Provision vector DB (Pinecone/Weaviate/Qdrant/pgvector). Create collections/indexes, configure embedding dimensions, set up metadata schemas. Test similarity search." },
      { title: "LLM & AI Service Setup", desc: "Configure LLM API keys (OpenAI, Anthropic Claude, Google Gemini). Set up LangChain/LlamaIndex scaffolding. Initialize prompt templates, RAG pipeline skeleton, and agent framework." },
      { title: "CI/CD & MLOps Pipeline", desc: "GitHub Actions/GitLab CI: linting, testing, build, deploy. ML pipeline: experiment tracking (MLflow/W&B), model registry, data versioning (DVC). Databricks jobs for scheduled training." },
      { title: "Project Management & Monitoring Setup", desc: "Jira/Linear board, sprint structure, backlog. Monitoring: Prometheus + Grafana, Sentry, LangSmith/Arize for LLM observability. Health checks for all services." },
    ],
    deliverables: ["Working Dev Environment", "Vector DB Instance", "LLM Service Skeleton", "SQL Database with Migrations", "Databricks Workspace", "CI/CD Pipeline", "Jira Board with Backlog"],
    tools: ["GitHub", "Docker", "Databricks", "Pinecone/Weaviate", "LangChain", "MLflow", "Sentry", "Linear"],
  },
  {
    id: 5,
    name: "Development (Sprints)",
    icon: "💻",
    color: "#10B981",
    duration: "6–16 weeks (iterative)",
    summary: "Build features iteratively — backend APIs, frontend UI, LLM integrations, RAG pipelines, AI agents, and data engineering.",
    steps: [
      { title: "Sprint Planning", desc: "Select stories from backlog, break into tasks, estimate. Include AI-specific tasks: prompt engineering, RAG tuning, agent development, SQL query optimization, model training." },
      { title: "Backend & API Development", desc: "Build APIs (FastAPI/Django), database models, business logic, background tasks (Celery). SQL stored procedures, complex queries. REST + streaming endpoints for LLM responses." },
      { title: "Frontend Development", desc: "Implement UI components (React), state management, API integration. Build AI-powered UIs: chat interfaces, streaming LLM responses (SSE/EventSource), RAG citation display, agent dashboards." },
      { title: "LLM & RAG Development", desc: "Build RAG pipeline: document loaders → text splitters → embeddings → vector store → retriever → LLM chain. Prompt engineering (zero-shot, few-shot, chain-of-thought). Implement guardrails, hallucination detection, source citation." },
      { title: "AI Agent Development", desc: "Build autonomous agents: tool definitions, function calling, multi-step planning, memory management. Implement agent frameworks (LangGraph/CrewAI). Define agent personas, safety boundaries, human escalation triggers." },
      { title: "Data Engineering & SQL", desc: "Build ETL/ELT pipelines (Airflow/dbt/Spark). Write complex SQL: CTEs, window functions, materialized views. Databricks notebooks for data processing, Delta Lake tables, feature engineering. Data quality checks (Great Expectations)." },
      { title: "ML Model Development", desc: "Data pipeline, feature engineering, model training (scikit-learn/PyTorch/TensorFlow). Fine-tuning LLMs (LoRA/QLoRA/PEFT). Experiment tracking (MLflow/W&B). Model evaluation and bias audits." },
      { title: "Code Review & Sprint Ceremonies", desc: "PR reviews, pair programming, daily standups. Sprint Review demos including AI feature showcases. Sprint Retrospective for continuous improvement." },
    ],
    deliverables: ["Working Features (each sprint)", "RAG Pipeline", "AI Agent(s)", "SQL Queries & Data Pipelines", "API Documentation", "Tests", "Sprint Review Recordings"],
    tools: ["VS Code", "LangChain", "LlamaIndex", "Databricks", "pgAdmin/DBeaver", "Postman", "MLflow", "React DevTools"],
  },
  {
    id: 6,
    name: "Testing & QA",
    icon: "🧪",
    color: "#F59E0B",
    duration: "Continuous + 1–2 weeks pre-launch",
    summary: "Quality is built in — test everything from SQL queries to LLM outputs, RAG retrieval accuracy, agent behavior, and end-to-end flows.",
    steps: [
      { title: "Unit & Integration Testing", desc: "Backend: pytest. Frontend: Vitest/Jest + RTL. SQL: test queries against seed data. API integration tests. Target 80%+ coverage on critical paths." },
      { title: "LLM & RAG Testing", desc: "Test RAG retrieval accuracy (precision@k, recall@k, MRR). Evaluate LLM responses: faithfulness, relevance, hallucination rate. Automated eval with LLM-as-judge. Red teaming for prompt injection and jailbreak attempts." },
      { title: "AI Agent Testing", desc: "Test agent tool selection, multi-step reasoning, error recovery. Validate safety boundaries and escalation triggers. Stress test with adversarial inputs. Monitor token usage and cost per interaction." },
      { title: "End-to-End & Performance Testing", desc: "Cypress/Playwright: simulate real user flows including AI interactions. Load testing (Locust/k6): API throughput, LLM response latency, vector DB query performance under load." },
      { title: "SQL & Data Pipeline Testing", desc: "Validate SQL query correctness, performance (EXPLAIN ANALYZE). Test ETL/ELT pipeline data quality (Great Expectations). Verify Databricks jobs, Delta Lake integrity, data freshness." },
      { title: "Security & Compliance Testing", desc: "OWASP ZAP scan, dependency vulnerability scan (Snyk/Trivy). AI-specific: prompt injection testing, PII leak detection, content moderation validation. GDPR/compliance checks." },
      { title: "User Acceptance Testing (UAT)", desc: "Real users test in staging environment including AI features. Validate LLM response quality, RAG accuracy, agent helpfulness. Collect feedback, fix critical issues, sign-off." },
      { title: "Accessibility Testing", desc: "Screen reader testing, keyboard navigation, WCAG 2.1 AA compliance. Ensure AI chat interfaces are accessible. axe-core automated checks." },
    ],
    deliverables: ["Test Reports", "LLM Eval Reports", "RAG Accuracy Benchmarks", "Agent Safety Audit", "SQL Performance Report", "Security Audit", "UAT Sign-off"],
    tools: ["pytest", "Vitest", "Cypress", "Playwright", "Locust", "LangSmith", "RAGAS", "Giskard", "axe-core"],
  },
  {
    id: 7,
    name: "Deployment & Release",
    icon: "🚀",
    color: "#EF4444",
    duration: "1–3 days",
    summary: "Ship to production — deploy LLM services, vector databases, data pipelines, AI agents, and application stack with confidence.",
    steps: [
      { title: "Pre-Deployment Checklist", desc: "All tests pass, staging validated, DB migrations tested, rollback plan ready. LLM API keys in secrets manager, vector DB indexes verified, Databricks jobs scheduled, monitoring alerts configured." },
      { title: "Infrastructure Provisioning", desc: "Terraform/CDK: VPC, databases, K8s cluster, load balancers, DNS, SSL. Provision vector DB (managed or self-hosted). GPU instances for ML serving. Databricks workspace + clusters." },
      { title: "Database & Vector DB Migration", desc: "Run SQL migrations (Alembic/Django) on production. Verify data integrity. Populate vector DB with production embeddings. Validate vector search quality in prod environment." },
      { title: "AI/LLM Service Deployment", desc: "Deploy LLM gateway, RAG pipeline, embedding service, agent orchestrator. Configure model endpoints (vLLM/TGI for self-hosted, or API keys for managed). Set up semantic caching, rate limiting, fallback chains." },
      { title: "Data Pipeline Deployment", desc: "Deploy Airflow DAGs, dbt models, Spark jobs. Activate Databricks scheduled jobs and streaming pipelines. Verify Delta Lake tables, feature store serving, data freshness monitors." },
      { title: "Progressive Rollout", desc: "Canary deployment (5% → 25% → 50% → 100%) or blue-green switch. Feature flags for AI features: controlled access to LLM chat, agent features, RAG search. Shadow mode for new models." },
      { title: "Smoke Testing in Production", desc: "Verify critical flows: login, core features, AI chat, RAG search, agent tasks, SQL reports, payments. Validate LLM response quality and latency in production." },
      { title: "Go-Live Communication", desc: "Notify stakeholders, update status page, publish release notes highlighting AI capabilities. Enable support channels, prepare AI-specific troubleshooting guides." },
    ],
    deliverables: ["Production Deployment", "Vector DB (Production)", "AI Services Live", "Data Pipelines Active", "Release Notes", "Runbook", "Rollback Plan"],
    tools: ["Terraform", "Docker", "Kubernetes", "ArgoCD", "Databricks", "LaunchDarkly", "vLLM/TGI", "GitHub Actions"],
  },
  {
    id: 8,
    name: "Post-Launch & Iteration",
    icon: "📊",
    color: "#EC4899",
    duration: "Ongoing",
    summary: "Launch is just the beginning — monitor AI quality, iterate on prompts, retrain models, optimize RAG, evolve agents, and continuously improve.",
    steps: [
      { title: "Monitoring & Alerting", desc: "Track uptime, error rates, latency (P50/P95/P99), resource utilization. AI-specific: LLM response latency, token costs, vector DB query times, agent completion rates. PagerDuty/OpsGenie alerts." },
      { title: "LLM & RAG Monitoring", desc: "Monitor LLM response quality, hallucination rates, prompt/completion token usage, cost per query. Track RAG retrieval accuracy, embedding drift, knowledge base freshness. Use LangSmith/Arize/W&B for LLM observability." },
      { title: "AI Agent Monitoring", desc: "Track agent task success rate, multi-step completion, tool usage patterns, escalation frequency. Monitor for agent loops, excessive token consumption, safety boundary violations. Continuous red teaming." },
      { title: "Data & SQL Analytics", desc: "Product analytics: funnels, retention, cohorts (Amplitude/Mixpanel/PostHog). SQL dashboards for business KPIs. Databricks analytics: data quality monitoring, pipeline health, feature drift detection." },
      { title: "Model & Knowledge Base Iteration", desc: "Retrain ML models on new data. Update RAG knowledge base: add new documents, re-embed with improved chunking. Fine-tune LLMs with user feedback (LoRA/DPO). Update vector DB indexes." },
      { title: "A/B Experimentation", desc: "A/B test prompts, RAG strategies, agent configurations, model versions, UI changes. Measure impact on quality metrics, user satisfaction, and cost. Use GrowthBook/Statsig for experimentation." },
      { title: "AGI-Readiness & Frontier AI", desc: "Stay current with frontier AI: new foundation models, multi-modal capabilities, reasoning models (o1/o3), agent frameworks, AGI research. Plan architecture for model-agnostic design to swap providers easily." },
      { title: "Iteration & Roadmap Planning", desc: "Feed learnings back into discovery. Update roadmap with AI feature improvements, new agent capabilities, RAG enhancements, data pipeline optimizations. Plan next sprint cycle." },
    ],
    deliverables: ["Monitoring Dashboard", "LLM Quality Reports", "Agent Performance Metrics", "Analytics & SQL Dashboards", "Experiment Results", "Updated Roadmap"],
    tools: ["Grafana", "LangSmith", "Arize", "Databricks", "Amplitude", "PostHog", "GrowthBook", "MLflow", "Sentry"],
  },
];

const techCategories = [
  { name: "LLMs", items: ["GPT-4/4o", "Claude", "Gemini", "Llama 3", "Mistral", "Phi-3", "Command R+"], color: "#8B5CF6" },
  { name: "RAG & Embeddings", items: ["LangChain", "LlamaIndex", "OpenAI Embed", "Cohere", "Sentence-BERT", "RAGAS"], color: "#3B82F6" },
  { name: "Vector DBs", items: ["Pinecone", "Weaviate", "Qdrant", "Chroma", "Milvus", "pgvector", "FAISS"], color: "#06B6D4" },
  { name: "AI Agents", items: ["LangGraph", "CrewAI", "AutoGPT", "Function Calling", "Tool Use", "MCP"], color: "#10B981" },
  { name: "Data & SQL", items: ["PostgreSQL", "MySQL", "Databricks", "Snowflake", "BigQuery", "dbt", "Delta Lake"], color: "#F59E0B" },
  { name: "MLOps", items: ["MLflow", "W&B", "Kubeflow", "Airflow", "DVC", "BentoML", "Seldon"], color: "#EF4444" },
];

export default function ProductLifecycle() {
  const [activePhase, setActivePhase] = useState(0);
  const [activeStep, setActiveStep] = useState(null);
  const [showTechStack, setShowTechStack] = useState(false);
  const phase = phases[activePhase];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-6" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          AI-Era Product Development Lifecycle
        </h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base">From Discovery to Deployment — 8 Phases of Building Production AI/ML Software</p>
        <p className="text-gray-500 mt-1 text-xs">LLMs • RAG • Vector DBs • AI Agents • SQL • Databricks • MLOps • Full-Stack</p>

        {/* Tech Stack Toggle */}
        <button
          onClick={() => setShowTechStack(!showTechStack)}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-medium border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all"
        >
          {showTechStack ? "Hide" : "Show"} AI/ML Tech Stack Overview ✨
        </button>
      </div>

      {/* Tech Stack Overview Panel */}
      {showTechStack && (
        <div className="mb-8 rounded-2xl border border-gray-800 bg-gray-900 p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {techCategories.map((cat) => (
            <div key={cat.name}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: cat.color }}>{cat.name}</h4>
              <div className="space-y-1">
                {cat.items.map((item) => (
                  <div key={item} className="text-xs text-gray-400 flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline Navigation */}
      <div className="relative mb-8 overflow-x-auto pb-2">
        <div className="flex items-center justify-between min-w-max md:min-w-0 px-2">
          {phases.map((p, i) => (
            <div key={p.id} className="flex items-center flex-1">
              <button
                onClick={() => { setActivePhase(i); setActiveStep(null); }}
                className="flex flex-col items-center group relative z-10 focus:outline-none"
              >
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl transition-all duration-300 border-2"
                  style={{
                    backgroundColor: i === activePhase ? p.color : "transparent",
                    borderColor: i <= activePhase ? p.color : "#374151",
                    transform: i === activePhase ? "scale(1.15)" : "scale(1)",
                    boxShadow: i === activePhase ? `0 0 20px ${p.color}44` : "none",
                  }}
                >
                  {p.icon}
                </div>
                <span className={`text-xs mt-2 text-center max-w-20 leading-tight transition-colors ${i === activePhase ? "text-white font-semibold" : "text-gray-500"}`}>
                  {p.name}
                </span>
              </button>
              {i < phases.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mt-[-20px]" style={{ backgroundColor: i < activePhase ? phases[i + 1].color : "#374151" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Phase Header */}
      <div className="rounded-2xl p-5 md:p-6 mb-6 border" style={{ backgroundColor: `${phase.color}11`, borderColor: `${phase.color}33` }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{phase.icon}</span>
              <h2 className="text-2xl font-bold" style={{ color: phase.color }}>
                Phase {phase.id}: {phase.name}
              </h2>
            </div>
            <p className="text-gray-300 text-sm md:text-base">{phase.summary}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 whitespace-nowrap self-start">
            <span className="text-gray-400 text-xs">⏱ Duration:</span>
            <span className="text-white font-semibold text-sm">{phase.duration}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Steps */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Steps ({phase.steps.length})</h3>
          <div className="space-y-2">
            {phase.steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(activeStep === i ? null : i)}
                className="w-full text-left rounded-xl border transition-all duration-200 focus:outline-none"
                style={{
                  backgroundColor: activeStep === i ? `${phase.color}15` : "#111827",
                  borderColor: activeStep === i ? `${phase.color}55` : "#1F2937",
                }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${phase.color}22`, color: phase.color }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white text-sm">{step.title}</h4>
                        <svg className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${activeStep === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                      {activeStep === i && (
                        <p className="text-gray-400 text-sm mt-2 leading-relaxed">{step.desc}</p>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Deliverables */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">📦 Key Deliverables</h3>
            <div className="space-y-2">
              {phase.deliverables.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: phase.color }} />
                  <span className="text-gray-300 text-sm">{d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">🛠 Tools & Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {phase.tools.map((t, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-medium border" style={{ borderColor: `${phase.color}44`, color: phase.color, backgroundColor: `${phase.color}11` }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Phase Progress */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">🗺 Lifecycle Progress</h3>
            <div className="space-y-2">
              {phases.map((p, i) => (
                <div key={p.id} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center text-xs" style={{ backgroundColor: i <= activePhase ? `${p.color}33` : "#1F2937" }}>
                    {i < activePhase ? "✓" : i === activePhase ? "→" : " "}
                  </div>
                  <span className={`text-xs ${i === activePhase ? "text-white font-semibold" : i < activePhase ? "text-gray-400" : "text-gray-600"}`}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => { if (activePhase > 0) { setActivePhase(activePhase - 1); setActiveStep(null); } }}
          disabled={activePhase === 0}
          className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous Phase
        </button>
        <button
          onClick={() => { if (activePhase < phases.length - 1) { setActivePhase(activePhase + 1); setActiveStep(null); } }}
          disabled={activePhase === phases.length - 1}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: phase.color }}
        >
          Next Phase →
        </button>
      </div>
    </div>
  );
}
