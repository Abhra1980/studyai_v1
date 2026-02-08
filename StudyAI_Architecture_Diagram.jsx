import { useState } from "react";

const LAYERS = [
  {
    id: "client",
    label: "CLIENT LAYER",
    color: "#0EA5E9",
    bg: "#0C4A6E",
    y: 0,
    items: [
      { id: "web", label: "Web App (SPA)", sub: "React 18 + TypeScript + Vite + TailwindCSS", icon: "🌐", w: 320 },
      { id: "pwa", label: "PWA / Offline", sub: "Service Worker + Cache API + Background Sync", icon: "📶", w: 310 },
    ],
  },
  {
    id: "edge",
    label: "EDGE / CDN",
    color: "#8B5CF6",
    bg: "#3B0764",
    y: 1,
    items: [
      { id: "cdn", label: "CloudFront CDN", sub: "Static assets + cached responses", icon: "⚡", w: 240 },
      { id: "waf", label: "WAF / DDoS", sub: "AWS Shield + rate limiting", icon: "🛡️", w: 200 },
      { id: "edge-fn", label: "Edge Functions", sub: "Vercel Edge Runtime", icon: "λ", w: 200 },
    ],
  },
  {
    id: "gateway",
    label: "API GATEWAY",
    color: "#F59E0B",
    bg: "#78350F",
    y: 2,
    items: [
      { id: "gw", label: "Kong API Gateway", sub: "Routing • Auth validation • Rate limiting • Load balancing", icon: "🚪", w: 660 },
    ],
  },
  {
    id: "services",
    label: "APPLICATION SERVICES",
    color: "#10B981",
    bg: "#064E3B",
    y: 3,
    items: [
      { id: "auth", label: "Auth Service", sub: "Node.js + Auth0", icon: "🔐", w: 150 },
      { id: "syllabus", label: "Syllabus Svc", sub: "FastAPI", icon: "📚", w: 140 },
      { id: "llm-orch", label: "LLM Orchestrator", sub: "FastAPI + LangChain", icon: "🧠", w: 175, highlight: true },
      { id: "content", label: "Content Svc", sub: "FastAPI", icon: "📝", w: 140 },
      { id: "quiz", label: "Quiz Engine", sub: "FastAPI", icon: "❓", w: 130 },
      { id: "progress", label: "Progress Svc", sub: "Node.js", icon: "📊", w: 140 },
      { id: "search", label: "Search Svc", sub: "Node + ES", icon: "🔍", w: 130 },
      { id: "notif", label: "Notifications", sub: "Node + BullMQ", icon: "🔔", w: 140 },
    ],
  },
  {
    id: "data",
    label: "DATA & AI LAYER",
    color: "#EF4444",
    bg: "#7F1D1D",
    y: 4,
    items: [
      { id: "pg", label: "Neon DB", sub: "Serverless Postgres • Users • Syllabus • Progress", icon: "⚡", w: 240 },
      { id: "mongo", label: "MongoDB Atlas", sub: "Generated Content", icon: "🍃", w: 180 },
      { id: "redis", label: "Redis 7", sub: "Cache • Queue • Sessions", icon: "⚡", w: 190 },
      { id: "pinecone", label: "Pinecone", sub: "Vector Embeddings", icon: "🌲", w: 160 },
      { id: "elastic", label: "Elasticsearch", sub: "Full-text Search", icon: "🔎", w: 170 },
    ],
  },
];

const LLM_PROVIDERS = [
  { id: "claude", label: "Claude API", sub: "Sonnet / Opus", icon: "🟠", color: "#D97706" },
  { id: "gpt", label: "GPT-4o", sub: "Fallback", icon: "🟢", color: "#059669" },
  { id: "llama", label: "Llama 3.1", sub: "Open-source", icon: "🦙", color: "#7C3AED" },
];

const FLOW_STEPS = [
  { from: "web", to: "cdn", label: "1. User clicks topic", color: "#0EA5E9" },
  { from: "cdn", to: "gw", label: "2. Route request", color: "#8B5CF6" },
  { from: "gw", to: "llm-orch", label: "3. Auth + rate limit", color: "#F59E0B" },
  { from: "llm-orch", to: "redis", label: "4. Check cache", color: "#EF4444" },
  { from: "llm-orch", to: "syllabus", label: "5. Fetch topic", color: "#10B981" },
  { from: "llm-orch", to: "claude", label: "6. Stream to LLM", color: "#D97706" },
  { from: "claude", to: "llm-orch", label: "7. Token stream", color: "#D97706" },
  { from: "llm-orch", to: "web", label: "8. SSE to client", color: "#0EA5E9" },
  { from: "llm-orch", to: "mongo", label: "9. Persist content", color: "#EF4444" },
  { from: "llm-orch", to: "progress", label: "10. Update progress", color: "#10B981" },
];

const RENDERING = [
  { icon: "📝", label: "Markdown", tech: "react-markdown" },
  { icon: "📐", label: "LaTeX Math", tech: "KaTeX" },
  { icon: "💻", label: "Code + Run", tech: "Monaco + Pyodide" },
  { icon: "📊", label: "Charts", tech: "Chart.js / Recharts" },
  { icon: "🔀", label: "Diagrams", tech: "Mermaid.js" },
  { icon: "❓", label: "Quizzes", tech: "Interactive MCQ" },
];

export default function ArchitectureDiagram() {
  const [activeLayer, setActiveLayer] = useState(null);
  const [activeFlow, setActiveFlow] = useState(null);
  const [showFlow, setShowFlow] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0E1A",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
      color: "#E2E8F0",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32, position: "relative" }}>
        <div style={{
          display: "inline-block", padding: "6px 20px", borderRadius: 20,
          background: "linear-gradient(135deg, #0EA5E910, #8B5CF610)",
          border: "1px solid #334155", marginBottom: 12, fontSize: 11,
          letterSpacing: 3, color: "#94A3B8", textTransform: "uppercase",
        }}>
          System Architecture
        </div>
        <h1 style={{
          fontSize: 36, fontWeight: 800, margin: "8px 0 4px",
          background: "linear-gradient(135deg, #0EA5E9, #8B5CF6, #EC4899)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: -1,
        }}>
          StudyAI — End-to-End Architecture
        </h1>
        <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>
          LLM-Powered Adaptive Learning Platform • 118 Modules • 2,000+ Topics
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
          <button onClick={() => setShowFlow(!showFlow)} style={{
            padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", letterSpacing: 0.5, transition: "all 0.2s",
            background: showFlow ? "linear-gradient(135deg, #0EA5E9, #8B5CF6)" : "transparent",
            color: showFlow ? "#fff" : "#94A3B8",
            border: showFlow ? "none" : "1px solid #334155",
          }}>
            {showFlow ? "✦ DATA FLOW ACTIVE" : "▶ SHOW DATA FLOW"}
          </button>
        </div>
      </div>

      {/* Main Architecture */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ─── ARCHITECTURE LAYERS ─── */}
        {LAYERS.map((layer, li) => (
          <div key={layer.id} style={{ marginBottom: li === LAYERS.length - 1 ? 0 : 8 }}>
            {/* Layer container */}
            <div
              onMouseEnter={() => setActiveLayer(layer.id)}
              onMouseLeave={() => setActiveLayer(null)}
              style={{
                position: "relative",
                background: activeLayer === layer.id
                  ? `linear-gradient(135deg, ${layer.bg}CC, ${layer.bg}99)`
                  : `linear-gradient(135deg, ${layer.bg}88, ${layer.bg}55)`,
                border: `1px solid ${layer.color}${activeLayer === layer.id ? "60" : "25"}`,
                borderRadius: 16,
                padding: "16px 20px",
                transition: "all 0.3s ease",
                transform: activeLayer === layer.id ? "scale(1.005)" : "scale(1)",
              }}
            >
              {/* Layer label */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: layer.color,
                  boxShadow: `0 0 12px ${layer.color}80`,
                }} />
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
                  color: layer.color, textTransform: "uppercase",
                }}>
                  {layer.label}
                </span>
                <div style={{
                  flex: 1, height: 1,
                  background: `linear-gradient(90deg, ${layer.color}30, transparent)`,
                }} />
              </div>

              {/* Items */}
              <div style={{
                display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap",
              }}>
                {layer.items.map((item) => (
                  <div key={item.id} style={{
                    width: item.w || 160,
                    padding: "12px 14px",
                    background: item.highlight
                      ? `linear-gradient(135deg, ${layer.color}25, ${layer.color}15)`
                      : "rgba(15, 23, 42, 0.7)",
                    border: `1px solid ${item.highlight ? layer.color + "50" : "#1E293B"}`,
                    borderRadius: 10,
                    transition: "all 0.2s",
                    cursor: "default",
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    {item.highlight && (
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 2,
                        background: `linear-gradient(90deg, transparent, ${layer.color}, transparent)`,
                      }} />
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span style={{
                        fontSize: 12, fontWeight: 700, color: "#E2E8F0",
                        lineHeight: 1.2,
                      }}>
                        {item.label}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 9.5, color: "#64748B", lineHeight: 1.4,
                      letterSpacing: 0.2,
                    }}>
                      {item.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connector arrows between layers */}
            {li < LAYERS.length - 1 && (
              <div style={{
                display: "flex", justifyContent: "center", padding: "4px 0",
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 1, height: 8, background: "#334155" }} />
                  <div style={{
                    width: 0, height: 0,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: "6px solid #475569",
                  }} />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* ─── LLM PROVIDERS (Side panel) ─── */}
        <div style={{
          position: "absolute", right: 24, top: 340,
          width: 180,
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1E1207CC, #1E120788)",
            border: "1px solid #D9770625",
            borderRadius: 16, padding: "14px 16px",
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 2,
              color: "#D97706", marginBottom: 12, textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#D97706", boxShadow: "0 0 12px #D9770680" }} />
              LLM PROVIDERS
            </div>
            {LLM_PROVIDERS.map((llm, i) => (
              <div key={llm.id} style={{
                padding: "10px 12px", marginBottom: i < 2 ? 6 : 0,
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid #1E293B",
                borderRadius: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 14 }}>{llm.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: llm.color }}>{llm.label}</span>
                </div>
                <div style={{ fontSize: 9, color: "#64748B" }}>{llm.sub}</div>
              </div>
            ))}
            {/* Arrow to orchestrator */}
            <div style={{
              position: "absolute", left: -40, top: "50%",
              display: "flex", alignItems: "center",
            }}>
              <div style={{
                width: 30, height: 1, background: "#D9770640",
              }} />
              <div style={{
                width: 0, height: 0,
                borderTop: "4px solid transparent",
                borderBottom: "4px solid transparent",
                borderRight: "6px solid #D97706",
                transform: "rotate(180deg)",
              }} />
            </div>
          </div>
        </div>

        {/* ─── DATA FLOW PANEL ─── */}
        {showFlow && (
          <div style={{
            marginTop: 24,
            background: "linear-gradient(135deg, #0F172ACC, #0F172A99)",
            border: "1px solid #1E293B",
            borderRadius: 16, padding: "20px 24px",
            animation: "fadeIn 0.3s ease",
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 2.5,
              color: "#0EA5E9", marginBottom: 16, textTransform: "uppercase",
            }}>
              ⚡ Data Flow: User Selects a Topic for Learning
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8,
            }}>
              {FLOW_STEPS.map((step, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setActiveFlow(i)}
                  onMouseLeave={() => setActiveFlow(null)}
                  style={{
                    padding: "12px",
                    background: activeFlow === i
                      ? `linear-gradient(135deg, ${step.color}20, ${step.color}10)`
                      : "rgba(15, 23, 42, 0.5)",
                    border: `1px solid ${activeFlow === i ? step.color + "50" : "#1E293B"}`,
                    borderRadius: 10,
                    transition: "all 0.2s",
                    cursor: "default",
                    position: "relative",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 8, right: 10,
                    fontSize: 18, fontWeight: 800, color: step.color + "20",
                    fontFamily: "inherit",
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{
                    fontSize: 9, fontWeight: 600, color: step.color,
                    letterSpacing: 1, textTransform: "uppercase", marginBottom: 6,
                  }}>
                    Step {i + 1}
                  </div>
                  <div style={{
                    fontSize: 11, color: "#CBD5E1", fontWeight: 600, lineHeight: 1.3,
                  }}>
                    {step.label.replace(/^\d+\.\s*/, "")}
                  </div>
                  <div style={{
                    fontSize: 9, color: "#475569", marginTop: 4,
                  }}>
                    {step.from} → {step.to}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── CLIENT-SIDE RENDERING PIPELINE ─── */}
        <div style={{
          marginTop: 24,
          background: "linear-gradient(135deg, #0E2A0FCC, #0E2A0F88)",
          border: "1px solid #10B98125",
          borderRadius: 16, padding: "20px 24px",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 12px #10B98180" }} />
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
              color: "#10B981", textTransform: "uppercase",
            }}>
              Content Rendering Pipeline (Client-Side)
            </span>
          </div>

          <div style={{
            display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap",
          }}>
            {RENDERING.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  padding: "10px 14px",
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid #1E293B",
                  borderRadius: 10, textAlign: "center",
                  minWidth: 110,
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{r.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#E2E8F0" }}>{r.label}</div>
                  <div style={{ fontSize: 9, color: "#10B981", marginTop: 2 }}>{r.tech}</div>
                </div>
                {i < RENDERING.length - 1 && (
                  <div style={{ color: "#334155", fontSize: 14 }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── CROSS-CUTTING CONCERNS ─── */}
        <div style={{
          marginTop: 24,
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
        }}>
          {[
            {
              title: "OBSERVABILITY",
              color: "#F59E0B",
              bg: "#78350F",
              items: ["Datadog APM — all services", "Sentry — error tracking", "LangSmith — LLM tracing", "PagerDuty — on-call alerts"],
            },
            {
              title: "CI/CD PIPELINE",
              color: "#8B5CF6",
              bg: "#3B0764",
              items: ["GitHub Actions — test/build", "Docker → ECR — container registry", "ArgoCD — GitOps K8s deploy", "Canary: 10% → 50% → 100%"],
            },
            {
              title: "SECURITY",
              color: "#EF4444",
              bg: "#7F1D1D",
              items: ["OAuth 2.0 + JWT rotation", "PromptGuard — injection detection", "TLS 1.3 + AES-256 at rest", "RBAC: free/pro/premium/admin"],
            },
          ].map((section) => (
            <div key={section.title} style={{
              background: `linear-gradient(135deg, ${section.bg}CC, ${section.bg}88)`,
              border: `1px solid ${section.color}25`,
              borderRadius: 14, padding: "14px 16px",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: section.color,
                  boxShadow: `0 0 8px ${section.color}80`,
                }} />
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: 2,
                  color: section.color, textTransform: "uppercase",
                }}>
                  {section.title}
                </span>
              </div>
              {section.items.map((item, i) => (
                <div key={i} style={{
                  fontSize: 10, color: "#94A3B8", padding: "4px 0",
                  borderBottom: i < section.items.length - 1 ? "1px solid #1E293B40" : "none",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <div style={{
                    width: 3, height: 3, borderRadius: "50%",
                    background: section.color + "60",
                  }} />
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ─── CACHING LAYERS ─── */}
        <div style={{
          marginTop: 24,
          background: "linear-gradient(135deg, #0F172ACC, #0F172A88)",
          border: "1px solid #334155",
          borderRadius: 14, padding: "16px 20px",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
            color: "#EC4899", marginBottom: 14, textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EC4899", boxShadow: "0 0 10px #EC489980" }} />
            6-LAYER CACHING STRATEGY
          </div>
          <div style={{
            display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap",
          }}>
            {[
              { l: "L1", n: "Browser", t: "TanStack Query", ttl: "5min", hit: "40%" },
              { l: "L2", n: "ServiceWorker", t: "Cache API", ttl: "24h", hit: "30%" },
              { l: "L3", n: "CDN", t: "CloudFront", ttl: "1h", hit: "50%" },
              { l: "L4", n: "API Cache", t: "Redis", ttl: "24h", hit: "60%" },
              { l: "L5", n: "Warm Cache", t: "Pre-generated", ttl: "7d", hit: "80%" },
              { l: "L6", n: "Database", t: "MongoDB", ttl: "∞", hit: "100%" },
            ].map((cache, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 140, padding: "10px 12px",
                  background: `rgba(236, 72, 153, ${0.03 + i * 0.02})`,
                  border: "1px solid #EC489915",
                  borderRadius: 8, textAlign: "center",
                }}>
                  <div style={{
                    fontSize: 9, fontWeight: 800, color: "#EC4899",
                    letterSpacing: 1, marginBottom: 2,
                  }}>
                    {cache.l}: {cache.n}
                  </div>
                  <div style={{ fontSize: 9, color: "#64748B" }}>{cache.t}</div>
                  <div style={{
                    display: "flex", justifyContent: "center", gap: 8, marginTop: 4,
                    fontSize: 9,
                  }}>
                    <span style={{ color: "#475569" }}>TTL: <span style={{ color: "#94A3B8" }}>{cache.ttl}</span></span>
                    <span style={{ color: "#475569" }}>Hit: <span style={{ color: "#10B981" }}>{cache.hit}</span></span>
                  </div>
                </div>
                {i < 5 && <span style={{ color: "#334155", fontSize: 12 }}>→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ─── PROMPT ARCHITECTURE ─── */}
        <div style={{
          marginTop: 24,
          background: "linear-gradient(135deg, #1A0F2ECC, #1A0F2E88)",
          border: "1px solid #8B5CF625",
          borderRadius: 14, padding: "16px 20px",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
            color: "#A78BFA", marginBottom: 14, textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#A78BFA", boxShadow: "0 0 10px #A78BFA80" }} />
            LLM PROMPT ARCHITECTURE — What Gets Sent to the Model
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { label: "System Message", tokens: "~500 tok", desc: "Expert teacher persona + output format" },
              { label: "Syllabus Context", tokens: "~300 tok", desc: "Part → Module → Topic + all sub-bullets" },
              { label: "User Context", tokens: "~150 tok", desc: "Level + prereqs + weak areas" },
              { label: "Output Schema", tokens: "~300 tok", desc: "JSON: explanation, code, math, quiz" },
              { label: "Few-Shot Example", tokens: "~700 tok", desc: "1–2 golden output examples" },
              { label: "User Query", tokens: "~30 tok", desc: "\"Teach me: {Topic Title}\"" },
            ].map((s, i) => (
              <div key={i} style={{
                flex: "1 1 155px", maxWidth: 175,
                padding: "10px 12px",
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid #1E293B",
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#C4B5FD", marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 9, color: "#64748B", marginBottom: 4 }}>{s.tokens}</div>
                <div style={{ fontSize: 9, color: "#94A3B8", lineHeight: 1.3 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── INFRA SUMMARY ─── */}
        <div style={{
          marginTop: 24, marginBottom: 16,
          display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap",
        }}>
          {[
            { label: "AWS EKS", value: "3 AZs, 6–50 nodes" },
            { label: "Environments", value: "Dev → Staging → Prod" },
            { label: "Deploy", value: "Blue-green + canary" },
            { label: "Target", value: "50K concurrent users" },
            { label: "SLA", value: "99.9% uptime" },
            { label: "LLM Cost", value: "< $0.05/user/day" },
          ].map((stat) => (
            <div key={stat.label} style={{
              padding: "8px 16px",
              background: "rgba(15, 23, 42, 0.5)",
              border: "1px solid #1E293B",
              borderRadius: 8, textAlign: "center",
            }}>
              <div style={{ fontSize: 9, color: "#64748B", letterSpacing: 1, textTransform: "uppercase" }}>{stat.label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#CBD5E1", marginTop: 2 }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center", padding: "16px 0", marginTop: 8,
          borderTop: "1px solid #1E293B",
          fontSize: 10, color: "#475569",
        }}>
          StudyAI Architecture v1.0 • February 2026 • 5 Layers • 8 Microservices • 3 LLM Providers • 6 Cache Layers
        </div>
      </div>
    </div>
  );
}
