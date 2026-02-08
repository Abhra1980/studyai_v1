import { useState, useEffect } from "react";

const learningPaths = [
  {
    id: "foundation",
    phase: "Phase 1",
    name: "Foundation & Core Skills",
    icon: "🧱",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    accent: "#764ba2",
    duration: "8–12 weeks",
    tagline: "Build the bedrock — math, programming, databases, and CS fundamentals before touching any ML.",
    tracks: [
      {
        name: "Mathematics & Statistics",
        modules: ["Module 1–14 (Statistics for AI & ML)"],
        skills: [
          "Descriptive & inferential statistics",
          "Probability theory & Bayes' theorem",
          "Probability distributions (Gaussian, Poisson, Bernoulli, Beta)",
          "Hypothesis testing, p-values, confidence intervals",
          "MLE, MAP estimation",
          "Correlation & regression analysis",
          "Bias-variance tradeoff, regularization theory",
        ],
        project: "Build a statistical analysis dashboard on a real dataset — EDA, hypothesis tests, distribution fitting, and regression modeling with visualization.",
        tools: ["Python", "NumPy", "SciPy", "Pandas", "Matplotlib", "Seaborn", "Jupyter"],
      },
      {
        name: "Python Programming Mastery",
        modules: ["Module 31 (Python Core & Advanced)"],
        skills: [
          "Data types, data structures, control flow, functions",
          "OOP: classes, inheritance, polymorphism, dunder methods",
          "Iterators, generators, context managers, decorators",
          "Type hints, async/await, concurrency (threading, multiprocessing, asyncio)",
          "Memory management, profiling, optimization",
        ],
        project: "Build a CLI task manager with async file I/O, decorators for logging, context managers for DB connections, and full type hints.",
        tools: ["Python 3.11+", "Poetry/venv", "pytest", "mypy", "Ruff"],
      },
      {
        name: "Data Structures & Algorithms",
        modules: ["Module 87 (DSA)"],
        skills: [
          "Arrays, strings, hashing, two-pointer, sliding window",
          "Linked lists, stacks, queues, deques",
          "Trees (BST, heaps, tries), graphs (BFS, DFS, Dijkstra)",
          "Recursion, backtracking, dynamic programming",
          "Sorting algorithms, binary search, greedy, Big-O analysis",
        ],
        project: "Solve 100+ LeetCode problems covering all patterns. Build a graph-based route optimizer using Dijkstra's algorithm.",
        tools: ["Python", "LeetCode", "NeetCode", "Visualgo"],
      },
      {
        name: "SQL & Database Mastery",
        modules: ["Module 80 (SQL)", "Module 35 (Database Integration)"],
        skills: [
          "DDL, DML — table design, constraints, CRUD operations",
          "JOINs (inner, outer, cross, self), subqueries, CTEs, recursive CTEs",
          "Window functions: ROW_NUMBER, RANK, LAG/LEAD, running totals",
          "Indexing (B-tree, GIN, GiST), EXPLAIN ANALYZE, query optimization",
          "Transactions, isolation levels, connection pooling",
          "PostgreSQL advanced: JSONB, full-text search, materialized views",
          "NoSQL: MongoDB, Redis, Elasticsearch basics",
        ],
        project: "Design and build a normalized e-commerce database with complex analytical queries — cohort retention, funnel analysis, and running revenue calculations using window functions.",
        tools: ["PostgreSQL", "pgAdmin/DBeaver", "SQLAlchemy", "Redis", "MongoDB"],
      },
      {
        name: "OS, Linux & Networking",
        modules: ["Module 88 (OS)", "Module 89 (Networking)", "Module 90 (Linux)"],
        skills: [
          "Processes, threads, memory management, virtual memory",
          "File systems, I/O management, synchronization primitives",
          "TCP/IP, HTTP/1.1/2/3, DNS, TLS, WebSocket, gRPC",
          "Linux CLI: file ops, text processing (grep/sed/awk), permissions",
          "Bash scripting: variables, loops, functions, error handling",
          "Process management, systemd, cron jobs, SSH",
        ],
        project: "Write a bash deployment script that provisions a Linux server, sets up Nginx, configures SSL, deploys a Python app, and sets up monitoring cron jobs.",
        tools: ["Ubuntu/WSL", "Bash", "Nginx", "SSH", "Wireshark"],
      },
      {
        name: "Software Design Patterns",
        modules: ["Module 91 (Design Patterns & SOLID)"],
        skills: [
          "SOLID principles with Python & TypeScript examples",
          "Creational: Singleton, Factory, Builder, Prototype",
          "Structural: Adapter, Decorator, Facade, Proxy",
          "Behavioral: Observer, Strategy, Command, State, Iterator",
          "Architectural: MVC, Repository, CQRS, Clean Architecture, DDD",
        ],
        project: "Refactor a monolithic app using design patterns — Repository for data access, Strategy for payment processing, Observer for event notifications, and Facade for external API integration.",
        tools: ["Python", "TypeScript", "UML/Mermaid diagrams"],
      },
    ],
    milestone: "🏆 Milestone: You can write production Python, design optimized databases, navigate Linux servers, solve algorithm problems, and understand the math behind ML. You're ready for ML.",
  },
  {
    id: "ml",
    phase: "Phase 2",
    name: "Machine Learning & Deep Learning",
    icon: "🤖",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    accent: "#f5576c",
    duration: "10–16 weeks",
    tagline: "Master the ML lifecycle — from classical algorithms to deep learning, CNNs, RNNs, and Transformers.",
    tracks: [
      {
        name: "ML Fundamentals & Classical Algorithms",
        modules: ["Module 1–6 (ML Intro to Ensembles)"],
        skills: [
          "ML pipeline: problem → data → features → model → evaluate → deploy",
          "Linear & logistic regression, KNN, SVM, Naive Bayes, Decision Trees",
          "Ensemble methods: Random Forest, XGBoost, LightGBM, CatBoost, stacking",
          "Feature engineering: encoding, scaling, selection, PCA",
          "Cross-validation, hyperparameter tuning (GridSearch, Optuna)",
          "Evaluation: confusion matrix, ROC-AUC, F1, RMSE",
        ],
        project: "End-to-end ML project: predict customer churn using XGBoost with feature engineering, cross-validation, SHAP explanations, and a FastAPI serving endpoint.",
        tools: ["scikit-learn", "XGBoost", "LightGBM", "Pandas", "SHAP", "Optuna"],
      },
      {
        name: "Unsupervised Learning & Dimensionality Reduction",
        modules: ["Module 7–8 (Clustering & Dim Reduction)"],
        skills: [
          "K-Means, DBSCAN, GMM, hierarchical clustering",
          "PCA, t-SNE, UMAP for visualization",
          "Autoencoders for representation learning",
          "Cluster evaluation: silhouette, Davies-Bouldin",
        ],
        project: "Customer segmentation system: cluster users from behavioral data, visualize with UMAP, and build segment-specific recommendation rules.",
        tools: ["scikit-learn", "UMAP", "Plotly", "Streamlit"],
      },
      {
        name: "Deep Learning Foundations",
        modules: ["Module 12 (Neural Networks)", "Module 10 (Optimization)"],
        skills: [
          "MLP, backpropagation, activation functions (ReLU, GELU, Swish)",
          "Loss functions: MSE, cross-entropy, hinge, Huber",
          "Optimizers: SGD, Adam, AdamW, learning rate scheduling",
          "Regularization: dropout, batch norm, weight decay, data augmentation",
          "Transfer learning and fine-tuning pretrained models",
        ],
        project: "Build and train a multi-layer neural network from scratch (NumPy), then replicate in PyTorch with proper training loop, learning rate scheduling, and TensorBoard logging.",
        tools: ["PyTorch", "TensorFlow", "TensorBoard", "NumPy"],
      },
      {
        name: "Computer Vision (CNNs)",
        modules: ["Module 13 (CNNs)", "Module 19 (Computer Vision)"],
        skills: [
          "Convolution, pooling, stride, padding, receptive field",
          "Architectures: ResNet, EfficientNet, MobileNet, ConvNeXt",
          "Object detection: YOLOv8, Faster R-CNN",
          "Segmentation: U-Net, Mask R-CNN, SAM",
          "Fine-tuning pretrained models on custom datasets",
        ],
        project: "Build a real-time object detection system using YOLOv8 — train on custom dataset, deploy as FastAPI endpoint with webcam demo.",
        tools: ["PyTorch", "Ultralytics YOLOv8", "OpenCV", "Albumentations", "Roboflow"],
      },
      {
        name: "NLP & Sequence Models",
        modules: ["Module 14 (RNNs)", "Module 15 (Transformers)", "Module 18 (NLP)"],
        skills: [
          "Tokenization: BPE, WordPiece, SentencePiece",
          "Word embeddings: Word2Vec, GloVe, FastText",
          "RNN, LSTM, GRU — sequence modeling fundamentals",
          "Transformer architecture: self-attention, multi-head attention, positional encoding",
          "BERT, GPT, T5 — pre-training and fine-tuning",
          "Text classification, NER, summarization, question answering",
        ],
        project: "Fine-tune a BERT model for multi-label text classification on a custom dataset, with evaluation metrics, inference API, and interactive Gradio demo.",
        tools: ["Hugging Face Transformers", "PyTorch", "spaCy", "Gradio"],
      },
      {
        name: "Generative Models & Advanced Topics",
        modules: ["Module 16 (Generative)", "Module 17 (RL)", "Module 22 (GNNs)", "Module 11 (Bayesian ML)"],
        skills: [
          "VAE, GAN (DCGAN, StyleGAN), diffusion models (DDPM, Stable Diffusion)",
          "Reinforcement learning: Q-Learning, DQN, PPO",
          "Graph Neural Networks: GCN, GraphSAGE, GAT",
          "Bayesian ML: Gaussian Processes, MCMC, variational inference",
        ],
        project: "Train a conditional image generation model (small diffusion model or fine-tuned Stable Diffusion via DreamBooth) on a custom domain.",
        tools: ["PyTorch", "Diffusers", "Stable Baselines3", "PyG"],
      },
    ],
    milestone: "🏆 Milestone: You can build, train, evaluate, and explain ML/DL models. You understand classical ML, CNNs, RNNs, Transformers, and generative models. Ready for LLMs and full-stack.",
  },
  {
    id: "llm-ai",
    phase: "Phase 3",
    name: "LLMs, RAG, Agents & GenAI",
    icon: "🧠",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    accent: "#4facfe",
    duration: "8–12 weeks",
    tagline: "The frontier — master LLMs, build RAG systems, create AI agents, and work with vector databases.",
    tracks: [
      {
        name: "Large Language Models Deep Dive",
        modules: ["Module 81 (LLMs Deep Dive)"],
        skills: [
          "LLM architecture: decoder-only (GPT), encoder-only (BERT), encoder-decoder (T5)",
          "Scaling laws, training infrastructure, MoE (Mixtral)",
          "Major models: GPT-4, Claude, Gemini, Llama 3, Mistral, DeepSeek",
          "Prompt engineering: zero/few-shot, CoT, ToT, ReAct, structured output",
          "Fine-tuning: SFT, LoRA, QLoRA, PEFT, DPO, RLHF",
          "Serving: vLLM, TGI, Ollama, quantization (GPTQ, AWQ, GGUF)",
          "Guardrails, content filtering, prompt injection defense",
        ],
        project: "Fine-tune Llama 3 with QLoRA on a domain-specific instruction dataset, evaluate with multiple metrics, and serve via vLLM with streaming API.",
        tools: ["Hugging Face", "Unsloth", "vLLM", "Ollama", "LangSmith"],
      },
      {
        name: "RAG Systems",
        modules: ["Module 82 (RAG)"],
        skills: [
          "RAG pipeline: ingest → chunk → embed → index → retrieve → generate",
          "Chunking: fixed-size, semantic, recursive, parent-child, agentic",
          "Embedding models: OpenAI, Cohere, BGE, E5, Sentence-BERT",
          "Retrieval: dense, sparse (BM25), hybrid, reranking (Cohere, ColBERT)",
          "Advanced RAG: multi-query, self-RAG, corrective RAG, graph RAG",
          "Evaluation: RAGAS (faithfulness, relevance, context precision/recall)",
        ],
        project: "Build a production RAG system over company docs — multi-format ingestion, hybrid retrieval with reranking, citation display, evaluation pipeline, and conversational memory.",
        tools: ["LangChain", "LlamaIndex", "Unstructured.io", "RAGAS", "Haystack"],
      },
      {
        name: "Vector Databases",
        modules: ["Module 83 (Vector DBs)"],
        skills: [
          "ANN algorithms: HNSW, IVF, PQ, ScaNN — recall vs speed tradeoffs",
          "Vector DBs: Pinecone, Weaviate, Qdrant, ChromaDB, Milvus, pgvector",
          "Embedding pipelines: batch processing, versioning, refresh strategies",
          "Metadata filtering, hybrid queries, multi-tenant architectures",
          "Multimodal embeddings: CLIP, ImageBind",
          "Production: monitoring, index health, embedding drift detection",
        ],
        project: "Set up 3 vector databases (Qdrant self-hosted, pgvector, Pinecone managed), benchmark them on the same dataset for recall, latency, and throughput. Build a unified abstraction layer.",
        tools: ["Qdrant", "pgvector", "Pinecone", "FAISS", "ChromaDB"],
      },
      {
        name: "AI Agents & Agentic Systems",
        modules: ["Module 84 (AI Agents)"],
        skills: [
          "Agent loop: Observe → Think → Plan → Act → Reflect",
          "Tool use: function calling, API integration, code execution",
          "Frameworks: LangGraph, CrewAI, AutoGen, Semantic Kernel",
          "Multi-agent systems: role specialization, debate, supervisor patterns",
          "MCP (Model Context Protocol) for standardized tool interface",
          "Safety: guardrails, human-in-the-loop, budget limits, sandboxing",
        ],
        project: "Build a multi-agent research system: Planner agent decomposes questions, Researcher agent searches web/docs (RAG), Analyst agent synthesizes findings, Writer agent produces reports — all orchestrated via LangGraph.",
        tools: ["LangGraph", "CrewAI", "OpenAI Function Calling", "Claude Tool Use", "MCP"],
      },
      {
        name: "GenAI Media & No-Code AI",
        modules: ["Module 99 (GenAI Media)", "Module 100 (No-Code AI)"],
        skills: [
          "Image generation: Stable Diffusion, DALL-E 3, Midjourney, ControlNet",
          "Video/audio AI: Sora, ElevenLabs, Whisper, Suno",
          "3D generation: text-to-3D, NeRF, Gaussian Splatting",
          "No-code platforms: Langflow, Flowise, Dify, Zapier AI, Gradio, Streamlit",
        ],
        project: "Build a multimodal AI content pipeline: text prompt → image generation (SDXL) → voiceover (ElevenLabs) → video compilation, orchestrated via a Langflow/n8n workflow.",
        tools: ["ComfyUI", "Langflow", "Gradio", "ElevenLabs", "Streamlit"],
      },
    ],
    milestone: "🏆 Milestone: You can build production LLM apps, RAG pipelines, vector search systems, and autonomous AI agents. You're an AI engineer.",
  },
  {
    id: "fullstack",
    phase: "Phase 4",
    name: "Full-Stack Development",
    icon: "⚡",
    gradient: "linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 50%, #2BFF88 100%)",
    accent: "#2BD2FF",
    duration: "10–14 weeks",
    tagline: "Build production web apps — Python backend APIs, React frontend, authentication, real-time features, and microservices.",
    tracks: [
      {
        name: "Backend — FastAPI & Django",
        modules: ["Module 32 (Django)", "Module 33 (FastAPI)", "Module 34 (Flask)", "Module 36 (API Design)", "Module 37 (Auth & Security)"],
        skills: [
          "FastAPI: path operations, Pydantic V2, dependency injection, async endpoints",
          "Django: ORM, DRF serializers/viewsets, migrations, admin",
          "API design: REST principles, versioning, pagination, error handling (RFC 7807)",
          "Auth: OAuth2, JWT (access/refresh), RBAC, API keys, social auth",
          "Security: OWASP Top 10, input validation, bcrypt/argon2, CORS, rate limiting",
          "WebSocket, SSE for real-time, GraphQL basics",
        ],
        project: "Build a complete REST API with FastAPI: user auth (JWT), CRUD operations, file uploads, WebSocket chat endpoint, background tasks (Celery), and OpenAPI documentation.",
        tools: ["FastAPI", "Django", "SQLAlchemy", "Alembic", "Celery", "Redis"],
      },
      {
        name: "Frontend — React & Next.js",
        modules: ["Module 41–50 (React Full Track)"],
        skills: [
          "React hooks deep dive: useState, useEffect, useContext, useReducer, custom hooks",
          "State management: Redux Toolkit, Zustand, TanStack Query",
          "Routing: React Router v6, Next.js App Router, SSR/SSG/ISR",
          "Styling: Tailwind CSS, shadcn/ui, Framer Motion animations",
          "Forms: React Hook Form + Zod validation",
          "Testing: Vitest, RTL, Cypress/Playwright",
          "AI frontend: chat UI, streaming LLM responses (SSE), RAG citation display",
        ],
        project: "Build an AI-powered chat application (React + Next.js): streaming responses, markdown rendering, file upload, conversation history, dark mode, and mobile responsive.",
        tools: ["Next.js", "React", "Tailwind", "shadcn/ui", "TanStack Query", "Framer Motion"],
      },
      {
        name: "Message Queues & Background Jobs",
        modules: ["Module 38 (Message Queues)", "Module 40 (Microservices)"],
        skills: [
          "RabbitMQ/Kafka: exchanges, topics, partitions, consumer groups",
          "Celery: task queues, periodic tasks, retry policies, chaining",
          "Microservices: service boundaries, DDD, API gateway, circuit breaker",
          "Event-driven architecture: saga pattern, CQRS, event sourcing",
        ],
        project: "Decompose a monolith into 3 microservices (User, Order, Notification) with Kafka event bus, Celery background tasks, API gateway, and distributed tracing.",
        tools: ["Kafka", "RabbitMQ", "Celery", "Docker Compose", "Jaeger"],
      },
      {
        name: "Testing & Code Quality",
        modules: ["Module 39 (Testing)", "Module 48 (React Testing)", "Module 96 (API Testing)"],
        skills: [
          "pytest: fixtures, parametrize, mocking, coverage",
          "API testing: Postman collections, contract testing (Pact), load testing (k6/Locust)",
          "React testing: Vitest, RTL, MSW, Cypress E2E",
          "TDD workflow, BDD with behave, mutation testing",
          "Code quality: Ruff, Black, mypy, pre-commit hooks",
        ],
        project: "Add comprehensive test suite to your full-stack app: 80%+ backend coverage, component tests, E2E flows, load tests (1000 concurrent users), and CI pipeline with quality gates.",
        tools: ["pytest", "Vitest", "Cypress", "Postman", "k6", "Locust"],
      },
      {
        name: "Mobile Development",
        modules: ["Module 95 (React Native)"],
        skills: [
          "React Native / Expo: core components, navigation, styling",
          "Native APIs: camera, geolocation, push notifications, biometrics",
          "Performance: Hermes, FlatList optimization, Reanimated",
          "Deployment: EAS Build, TestFlight, Google Play Console",
        ],
        project: "Build a mobile companion app for your web project using React Native (Expo) — shared auth, push notifications, offline support, and camera integration.",
        tools: ["Expo", "React Native", "React Navigation", "EAS"],
      },
    ],
    milestone: "🏆 Milestone: You can build complete full-stack applications — Python APIs, React frontends, real-time features, microservices, mobile apps, with production-grade testing.",
  },
  {
    id: "data",
    phase: "Phase 5",
    name: "Data Engineering & Platforms",
    icon: "🔧",
    gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    accent: "#fda085",
    duration: "6–10 weeks",
    tagline: "Build data infrastructure — ETL pipelines, data warehouses, lakehouse architecture, BI dashboards, and feature stores.",
    tracks: [
      {
        name: "Data Engineering & Pipelines",
        modules: ["Module 59 (Data Engineering)"],
        skills: [
          "ETL vs ELT, batch vs streaming architectures",
          "Apache Spark (PySpark): DataFrames, Spark SQL, Spark Streaming",
          "Apache Kafka: event streaming, Kafka Connect, Kafka Streams",
          "Apache Airflow: DAGs, operators, sensors, task dependencies",
          "dbt: SQL transformations, testing, documentation, incremental models",
          "Data lake: Delta Lake, Apache Iceberg, Apache Hudi",
          "Data quality: Great Expectations, Pandera, data contracts",
        ],
        project: "Build an end-to-end data pipeline: Kafka ingestion → Spark processing → Delta Lake storage → dbt transformations → Airflow orchestration → data quality checks.",
        tools: ["Airflow", "Spark/PySpark", "Kafka", "dbt", "Great Expectations"],
      },
      {
        name: "Databricks & Lakehouse",
        modules: ["Module 85 (Databricks)"],
        skills: [
          "Databricks workspace: notebooks, clusters, Unity Catalog",
          "Delta Lake: ACID transactions, time travel, schema evolution",
          "Medallion architecture: Bronze → Silver → Gold layers",
          "Delta Live Tables, Structured Streaming, Auto Loader",
          "Databricks SQL warehouse, dashboards, query optimization",
          "Databricks ML: MLflow, Feature Store, AutoML, model serving",
          "Mosaic AI, Vector Search, RAG on Databricks",
        ],
        project: "Build a complete Databricks lakehouse: ingest raw data (Auto Loader) → Bronze/Silver/Gold Delta tables → ML model (MLflow) → SQL dashboard → vector search for RAG.",
        tools: ["Databricks", "Delta Lake", "MLflow", "Unity Catalog", "Spark"],
      },
      {
        name: "Snowflake & Data Warehousing",
        modules: ["Module 92 (Snowflake)"],
        skills: [
          "Snowflake architecture: storage, compute (virtual warehouses), cloud services",
          "Snowflake SQL: FLATTEN, VARIANT, QUALIFY, TIME TRAVEL, UNDROP",
          "Data sharing, Snowflake Marketplace, Snowpark (Python)",
          "Snowflake Cortex: LLM functions, vector search",
          "Performance: clustering keys, micro-partitions, caching, warehouse sizing",
        ],
        project: "Build a Snowflake analytics platform: load semi-structured JSON data, transform with Snowpark, create dashboards, and use Cortex LLM functions for text analysis.",
        tools: ["Snowflake", "Snowpark", "dbt", "SnowSQL"],
      },
      {
        name: "Hadoop Ecosystem & BI Tools",
        modules: ["Module 93 (Hadoop)", "Module 94 (BI Tools)"],
        skills: [
          "Hadoop: HDFS, MapReduce, YARN, Hive, HBase",
          "Open table formats: Iceberg, Hudi — ACID on data lakes",
          "Tableau: calculated fields, LOD expressions, dashboards",
          "Power BI: DAX, data modeling, row-level security",
          "Looker/Superset/Metabase for self-service analytics",
          "Python viz: Matplotlib, Seaborn, Plotly, Altair, Streamlit",
        ],
        project: "Build a BI reporting suite: connect Tableau/Power BI to your data warehouse, create executive dashboards with KPIs, drill-downs, and automated alerts.",
        tools: ["Tableau", "Power BI", "Superset", "Streamlit", "Plotly"],
      },
    ],
    milestone: "🏆 Milestone: You can build production data pipelines, lakehouse architectures, warehouses, and BI dashboards. You're a data engineer + analyst.",
  },
  {
    id: "cloud",
    phase: "Phase 6",
    name: "Cloud, DevOps & MLOps",
    icon: "☁️",
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    accent: "#a18cd1",
    duration: "8–12 weeks",
    tagline: "Deploy everything — cloud infrastructure, containers, Kubernetes, CI/CD, monitoring, and ML production systems.",
    tracks: [
      {
        name: "Cloud Platforms (AWS / GCP / Azure)",
        modules: ["Module 51–54 (Cloud)"],
        skills: [
          "Cloud fundamentals: IaaS/PaaS/SaaS/FaaS, regions, VPC, IAM",
          "AWS: EC2, S3, RDS, Lambda, ECS/EKS, SageMaker, Bedrock",
          "GCP: Compute Engine, Cloud Run, GKE, BigQuery, Vertex AI",
          "Azure: VMs, AKS, Azure ML, Azure OpenAI, Cosmos DB",
          "Cost optimization: reserved instances, spot, auto-scaling, FinOps",
        ],
        project: "Deploy the same application on all 3 clouds: EC2/Cloud Run/App Service + managed DB + object storage + CDN. Compare cost, latency, and developer experience.",
        tools: ["AWS Console/CLI", "GCP Console", "Azure Portal", "Terraform"],
      },
      {
        name: "Docker & Kubernetes",
        modules: ["Module 55 (Docker)", "Module 56 (Kubernetes)"],
        skills: [
          "Dockerfile: multi-stage builds, optimization, security scanning",
          "Docker Compose: multi-service local development",
          "K8s: Pods, Deployments, Services, Ingress, ConfigMaps, Secrets",
          "Helm charts, Kustomize, HPA/VPA auto-scaling",
          "GPU scheduling for ML, KServe/Seldon for model serving",
          "Service mesh (Istio), resource quotas, pod disruption budgets",
        ],
        project: "Containerize your full-stack AI app (API + frontend + LLM service + vector DB + Postgres) and deploy on a K8s cluster with Helm charts, auto-scaling, and ingress.",
        tools: ["Docker", "Kubernetes", "Helm", "k9s", "Lens"],
      },
      {
        name: "CI/CD & Infrastructure as Code",
        modules: ["Module 57 (CI/CD & IaC)"],
        skills: [
          "GitHub Actions: workflows, matrix builds, secrets, caching",
          "Terraform: providers, modules, state management, workspaces",
          "AWS CDK / Pulumi for programmatic IaC",
          "GitOps: ArgoCD/Flux for declarative K8s deployments",
          "Blue-green, canary, rolling deployments",
          "CI/CD for ML: model validation gates, automated retraining",
        ],
        project: "Build a complete CI/CD pipeline: lint → test → build → Docker push → Terraform infra → ArgoCD deploy → smoke test → Slack notification. Include ML model validation gate.",
        tools: ["GitHub Actions", "Terraform", "ArgoCD", "Docker Hub/ECR"],
      },
      {
        name: "MLOps & Production ML",
        modules: ["Module 27 (MLOps)", "Module 58 (ML Deployment)", "Module 60 (LLMOps)"],
        skills: [
          "ML pipelines: Airflow, Kubeflow Pipelines, Prefect",
          "Experiment tracking: MLflow, Weights & Biases",
          "Model registry, versioning, A/B testing, shadow deployment",
          "Model serving: TorchServe, Triton, BentoML, vLLM for LLMs",
          "Model compression: quantization, pruning, distillation",
          "Monitoring: data drift, concept drift, model performance degradation",
          "LLMOps: prompt management, LLM evaluation, cost tracking, guardrails",
        ],
        project: "Build an MLOps platform: experiment tracking (MLflow) → model registry → automated training pipeline → A/B model serving → drift detection → auto-retraining trigger.",
        tools: ["MLflow", "W&B", "BentoML", "vLLM", "Seldon", "Prometheus"],
      },
      {
        name: "Observability & SRE",
        modules: ["Module 63 (Observability & SRE)", "Module 101 (Cybersecurity)"],
        skills: [
          "Metrics: Prometheus, custom metrics for ML services",
          "Logging: structured logging, ELK Stack, Loki",
          "Tracing: OpenTelemetry, Jaeger, distributed tracing",
          "Dashboards: Grafana for infra + ML metrics",
          "SRE: SLOs/SLIs/SLAs, error budgets, incident management",
          "Security: penetration testing, SAST/DAST, SOC 2/ISO 27001 compliance",
        ],
        project: "Set up full observability: Prometheus + Grafana dashboards for API latency, LLM token costs, vector DB performance, model accuracy. Configure PagerDuty alerts and runbooks.",
        tools: ["Prometheus", "Grafana", "Loki", "Jaeger", "PagerDuty", "OWASP ZAP"],
      },
    ],
    milestone: "🏆 Milestone: You can deploy, scale, monitor, and secure any AI/ML application on any cloud. You're a DevOps + MLOps engineer.",
  },
  {
    id: "product",
    phase: "Phase 7",
    name: "Product, Management & Leadership",
    icon: "🎯",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    accent: "#ff6b6b",
    duration: "6–8 weeks",
    tagline: "Think beyond code — product strategy, agile project management, team leadership, and AI product management.",
    tracks: [
      {
        name: "Project Management & Agile",
        modules: ["Module 64–71 (Project Management Full Track)"],
        skills: [
          "PM fundamentals: project lifecycle, PMBOK, triple constraint",
          "Agile/Scrum: sprints, ceremonies, backlog grooming, velocity",
          "Kanban: WIP limits, lead/cycle time, flow efficiency",
          "Planning: WBS, CPM, Gantt charts, PERT, EVM",
          "Risk management: probability-impact matrix, Monte Carlo, mitigation",
          "ML project management: CRISP-DM, experiment-driven development",
        ],
        project: "Run a simulated 4-sprint agile project: write user stories, plan sprints, track velocity, manage risks, deliver sprint reviews, and conduct retrospectives.",
        tools: ["Jira", "Linear", "Confluence", "Miro", "MS Project"],
      },
      {
        name: "Product Management & Strategy",
        modules: ["Module 72–79 (Product Engineering Full Track)"],
        skills: [
          "Product strategy: vision, market sizing (TAM/SAM/SOM), competitive analysis",
          "Product discovery: user interviews, personas, JTBD, design sprints",
          "UX: design thinking, wireframing, usability testing, AI-specific UX",
          "Roadmapping: outcome-based, RICE/ICE prioritization, Kano model",
          "Analytics: AARRR, cohort analysis, A/B testing, experimentation",
          "AI PM: LLM product management, RAG product architecture, AI ethics",
          "Go-to-market: launch strategy, PLG, pricing, sales enablement",
        ],
        project: "Write a complete Product Requirements Document (PRD) for an AI product: problem statement, personas, user stories, AI architecture decisions, success metrics, go-to-market plan.",
        tools: ["Notion", "Figma", "Amplitude", "Mixpanel", "ProductPlan"],
      },
      {
        name: "Technical Writing & Web Scraping",
        modules: ["Module 98 (Technical Writing)", "Module 97 (Web Scraping)"],
        skills: [
          "Documentation: Diataxis framework, API docs, ADRs, runbooks",
          "Tools: MkDocs, Docusaurus, Mermaid diagrams, docs-as-code",
          "Web scraping: BeautifulSoup, Scrapy, Playwright, anti-scraping countermeasures",
          "Data collection at scale: distributed scraping, storage, scheduling",
        ],
        project: "Create comprehensive documentation for your capstone project: README, API reference (auto-generated), architecture docs (C4 + Mermaid), deployment runbook, and ADRs.",
        tools: ["MkDocs", "Mermaid", "Scrapy", "Playwright", "Docusaurus"],
      },
      {
        name: "Blockchain & Emerging Tech",
        modules: ["Module 86 (AGI/Frontier AI)", "Module 102 (Blockchain/Web3)"],
        skills: [
          "Blockchain: Ethereum, smart contracts, DeFi, NFTs",
          "Decentralized AI: federated learning, tokenized AI services",
          "AGI research: reasoning models, alignment, safety, governance",
          "AI ethics: EU AI Act, responsible AI frameworks, bias audits",
          "Future-proofing: staying current, continuous learning strategies",
        ],
        project: "Write a research report on the intersection of AI and your chosen emerging technology — covering current state, opportunities, risks, and a 3-year prediction.",
        tools: ["arXiv", "Hardhat", "Web3.py", "Research tools"],
      },
    ],
    milestone: "🏆 Milestone: You can lead AI projects, manage teams, define product strategy, and think about the business side. You're a complete AI/ML full-stack professional.",
  },
  {
    id: "capstone",
    phase: "Phase 8",
    name: "Capstone & Career Launch",
    icon: "🚀",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    accent: "#43e97b",
    duration: "6–8 weeks",
    tagline: "Bring it all together — build a production-grade AI application, launch your portfolio, and prepare for your career.",
    tracks: [
      {
        name: "Capstone Project — Full-Stack AI Application",
        modules: ["All 102 modules converge here"],
        skills: [
          "End-to-end architecture: React frontend + FastAPI backend + PostgreSQL + Redis",
          "AI layer: LLM integration, RAG pipeline, vector DB, AI agents",
          "Data layer: ETL pipeline, Databricks/Snowflake, feature store",
          "DevOps: Docker, Kubernetes, Terraform, CI/CD, monitoring",
          "Product: user research, PRD, analytics, A/B testing",
        ],
        project: "Build & deploy a production AI SaaS application that combines: React + Next.js frontend → FastAPI backend → PostgreSQL + pgvector → RAG pipeline with LLM → AI agents → Airflow data pipeline → Kubernetes deployment → Grafana monitoring → full documentation.",
        tools: ["All tools from previous phases"],
      },
      {
        name: "Portfolio & Career Preparation",
        modules: ["Module 30 (Capstone)", "Module 62 (Git & Career)"],
        skills: [
          "GitHub portfolio: 5+ projects showcasing different skills",
          "Technical blog: write 3+ deep-dive articles",
          "System design interview prep: ML system design, infra design",
          "Coding interviews: LeetCode patterns, time/space complexity",
          "Behavioral interviews: STAR method, leadership stories",
          "Open-source contributions: find projects, make meaningful PRs",
        ],
        project: "Launch your professional presence: polished GitHub profile with pinned repos, personal website, 3 blog posts, updated LinkedIn, and prepare for 5 mock interviews.",
        tools: ["GitHub", "Vercel", "dev.to/Medium", "LeetCode", "Pramp"],
      },
    ],
    milestone: "🚀 GRADUATION: You are a complete AI/ML Full-Stack Engineer — 102 modules mastered, production projects deployed, portfolio launched. Go build the future.",
  },
];

const totalWeeks = "56–90 weeks (~14–22 months)";
const totalModules = 102;

export default function StudyGuide() {
  const [activePhase, setActivePhase] = useState(0);
  const [expandedTrack, setExpandedTrack] = useState(0);
  const [completedTracks, setCompletedTracks] = useState({});
  const [showRoadmap, setShowRoadmap] = useState(false);

  const path = learningPaths[activePhase];

  const toggleComplete = (phaseId, trackIdx) => {
    const key = `${phaseId}-${trackIdx}`;
    setCompletedTracks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getPhaseProgress = (phaseId, trackCount) => {
    let done = 0;
    for (let i = 0; i < trackCount; i++) {
      if (completedTracks[`${phaseId}-${i}`]) done++;
    }
    return Math.round((done / trackCount) * 100);
  };

  const totalCompleted = Object.values(completedTracks).filter(Boolean).length;
  const totalTracks = learningPaths.reduce((sum, p) => sum + p.tracks.length, 0);
  const overallProgress = Math.round((totalCompleted / totalTracks) * 100);

  return (
    <div className="min-h-screen text-gray-100 p-3 md:p-6" style={{ fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif", background: "linear-gradient(180deg, #0a0a1a 0%, #0d1117 50%, #0a0a1a 100%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .glass { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .glow-border { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.03); }
        .track-card:hover { transform: translateY(-1px); }
        .phase-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .phase-btn:hover { transform: scale(1.05); }
        .progress-ring { transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .shimmer { background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%); background-size: 200% 100%; animation: shimmer 3s infinite; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>

      {/* Header */}
      <div className="text-center mb-6 md:mb-8 relative">
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)" }} />
        <div className="relative">
          <p className="text-xs font-mono tracking-widest text-gray-500 mb-2 uppercase">Complete Learning Roadmap</p>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight" style={{ background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 30%, #f472b6 60%, #fb923c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            AI/ML Full-Stack Study Guide
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">102 Modules → 8 Learning Phases → Production-Ready AI Engineer</p>
          <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
            <span className="text-xs font-mono px-3 py-1.5 rounded-full border border-gray-700/50 text-gray-400 bg-gray-900/50">{totalModules} Modules</span>
            <span className="text-xs font-mono px-3 py-1.5 rounded-full border border-gray-700/50 text-gray-400 bg-gray-900/50">{totalWeeks}</span>
            <span className="text-xs font-mono px-3 py-1.5 rounded-full border border-gray-700/50 text-gray-400 bg-gray-900/50">13 Parts</span>
            <span className="text-xs font-mono px-3 py-1.5 rounded-full border border-gray-700/50 text-gray-400 bg-gray-900/50">{overallProgress}% Complete</span>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="rounded-2xl glass glow-border p-4" style={{ background: "rgba(15,15,30,0.7)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overall Progress</span>
            <span className="text-sm font-bold" style={{ color: path.accent }}>{totalCompleted}/{totalTracks} tracks completed</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-800 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${overallProgress}%`, background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #f97316, #43e97b)" }} />
          </div>
        </div>
      </div>

      {/* Roadmap Toggle */}
      <div className="text-center mb-5">
        <button onClick={() => setShowRoadmap(!showRoadmap)} className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-700/50 text-gray-300 hover:bg-white/5 transition-all">
          {showRoadmap ? "Hide" : "Show"} Full Roadmap Overview ✦
        </button>
      </div>

      {/* Roadmap Overview */}
      {showRoadmap && (
        <div className="max-w-5xl mx-auto mb-8 rounded-2xl glass glow-border p-5" style={{ background: "rgba(15,15,30,0.7)" }}>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">📍 Your Learning Journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {learningPaths.map((lp, i) => {
              const prog = getPhaseProgress(lp.id, lp.tracks.length);
              return (
                <button key={lp.id} onClick={() => { setActivePhase(i); setExpandedTrack(0); setShowRoadmap(false); }}
                  className="text-left p-3 rounded-xl border transition-all hover:scale-[1.02]"
                  style={{ borderColor: i === activePhase ? `${lp.accent}66` : "rgba(255,255,255,0.06)", background: i === activePhase ? `${lp.accent}11` : "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{lp.icon}</span>
                    <div>
                      <p className="text-[10px] font-mono text-gray-500">{lp.phase}</p>
                      <p className="text-xs font-bold text-white">{lp.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${prog}%`, background: lp.gradient }} />
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">{prog}%</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">{lp.duration} • {lp.tracks.length} tracks</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Phase Selector */}
      <div className="relative mb-6 overflow-x-auto pb-2">
        <div className="flex items-center justify-center gap-2 min-w-max md:min-w-0 px-2">
          {learningPaths.map((lp, i) => {
            const prog = getPhaseProgress(lp.id, lp.tracks.length);
            return (
              <button key={lp.id} onClick={() => { setActivePhase(i); setExpandedTrack(0); }}
                className="phase-btn flex flex-col items-center gap-1 px-2 py-1 focus:outline-none relative">
                <div className="relative">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl md:text-2xl border-2 transition-all"
                    style={{
                      background: i === activePhase ? lp.gradient : "rgba(30,30,50,0.8)",
                      borderColor: i === activePhase ? "transparent" : prog === 100 ? "#43e97b44" : "rgba(255,255,255,0.06)",
                      boxShadow: i === activePhase ? `0 4px 20px ${lp.accent}33` : "none",
                    }}>
                    {lp.icon}
                  </div>
                  {prog === 100 && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px]">✓</div>}
                </div>
                <span className={`text-[10px] text-center max-w-16 leading-tight ${i === activePhase ? "text-white font-bold" : "text-gray-500"}`}>
                  {lp.name.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase Header */}
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl p-5 md:p-6 mb-6 glass glow-border relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${path.accent}11 0%, rgba(15,15,30,0.8) 100%)` }}>
          <div className="absolute top-0 right-0 w-64 h-64 opacity-5" style={{ background: path.gradient, borderRadius: "50%", filter: "blur(60px)", transform: "translate(30%, -30%)" }} />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-mono text-gray-500 mb-1">{path.phase} of 8</p>
                <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3" style={{ color: path.accent }}>
                  <span className="text-3xl">{path.icon}</span>{path.name}
                </h2>
                <p className="text-gray-300 text-sm mt-2 max-w-2xl">{path.tagline}</p>
              </div>
              <div className="flex items-center gap-4 self-start">
                <div className="text-center px-4 py-2 rounded-xl border border-gray-700/50 bg-gray-900/50">
                  <p className="text-[10px] text-gray-500 uppercase">Duration</p>
                  <p className="text-sm font-bold text-white">{path.duration}</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl border border-gray-700/50 bg-gray-900/50">
                  <p className="text-[10px] text-gray-500 uppercase">Tracks</p>
                  <p className="text-sm font-bold text-white">{path.tracks.length}</p>
                </div>
              </div>
            </div>
            {/* Phase progress bar */}
            <div className="mt-4">
              <div className="h-1.5 rounded-full bg-gray-800/60 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${getPhaseProgress(path.id, path.tracks.length)}%`, background: path.gradient }} />
              </div>
            </div>
          </div>
        </div>

        {/* Learning Tracks */}
        <div className="space-y-3 mb-6">
          {path.tracks.map((track, tIdx) => {
            const isExpanded = expandedTrack === tIdx;
            const isCompleted = completedTracks[`${path.id}-${tIdx}`];
            return (
              <div key={tIdx} className="rounded-2xl glass glow-border track-card transition-all" style={{ background: isExpanded ? "rgba(20,20,40,0.9)" : "rgba(15,15,30,0.6)" }}>
                {/* Track Header */}
                <button onClick={() => setExpandedTrack(isExpanded ? -1 : tIdx)} className="w-full text-left p-4 md:p-5 focus:outline-none">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: isCompleted ? "#22c55e22" : `${path.accent}15`, color: isCompleted ? "#22c55e" : path.accent }}>
                      {isCompleted ? "✓" : `${tIdx + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">{track.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{track.modules.join(", ")}</span>
                      </div>
                    </div>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 md:px-5 pb-5 space-y-5">
                    <div className="w-full h-px bg-gray-800/60" />

                    {/* Skills Grid */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">📚 What You'll Learn</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {track.skills.map((skill, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: path.accent }} />
                            <span className="text-gray-300">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Project */}
                    <div className="rounded-xl p-4 border" style={{ background: `${path.accent}08`, borderColor: `${path.accent}22` }}>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: path.accent }}>🛠️ Hands-On Project</h4>
                      <p className="text-sm text-gray-200 leading-relaxed">{track.project}</p>
                    </div>

                    {/* Tools */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">⚙️ Tools & Technologies</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {track.tools.map((tool, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium border"
                            style={{ borderColor: `${path.accent}33`, color: `${path.accent}cc`, background: `${path.accent}0a` }}>
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Mark Complete */}
                    <button onClick={(e) => { e.stopPropagation(); toggleComplete(path.id, tIdx); }}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all border"
                      style={{
                        background: isCompleted ? "#22c55e15" : "transparent",
                        borderColor: isCompleted ? "#22c55e44" : "rgba(255,255,255,0.08)",
                        color: isCompleted ? "#22c55e" : "#9ca3af"
                      }}>
                      {isCompleted ? "✓ Completed — Great job!" : "Mark as Completed"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Phase Milestone */}
        <div className="rounded-2xl p-5 glass glow-border mb-6 shimmer" style={{ background: "rgba(15,15,30,0.6)" }}>
          <p className="text-sm text-gray-200 leading-relaxed">{path.milestone}</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mb-10">
          <button
            onClick={() => { if (activePhase > 0) { setActivePhase(activePhase - 1); setExpandedTrack(0); } }}
            disabled={activePhase === 0}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-700/50 text-gray-300 hover:bg-white/5 transition-all disabled:opacity-20 disabled:cursor-not-allowed">
            ← Previous Phase
          </button>
          <button
            onClick={() => { if (activePhase < learningPaths.length - 1) { setActivePhase(activePhase + 1); setExpandedTrack(0); } }}
            disabled={activePhase === learningPaths.length - 1}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            style={{ background: path.gradient }}>
            Next Phase →
          </button>
        </div>
      </div>
    </div>
  );
}
