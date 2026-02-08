import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════
// STUDYAI — Professional Light Theme Frontend Prototype
// Aesthetic: Editorial / Refined Minimal — warm whites,
// ink-dark text, accent azure, generous whitespace
// ═══════════════════════════════════════════════════════

const SYLLABUS = [
  { id:1, title:"Statistics for AI & ML", icon:"📊", modules:14, color:"#2563EB", topics:[
    { id:"1.1", title:"Statistical Foundations", subs:["Meaning & Scope","Types of Data","Population & Sample","Scales of Measurement"] },
    { id:"1.2", title:"Descriptive Statistics", subs:["Central Tendency","Dispersion","Moments & Shape","Outliers & EDA"] },
    { id:"1.3", title:"Probability Theory", subs:["Foundations","Event Types","Bayes' Theorem"] },
    { id:"1.4", title:"Distributions", subs:["Random Variables","Key Distributions for AI/ML"] },
  ]},
  { id:2, title:"Machine Learning", icon:"🧠", modules:30, color:"#7C3AED", topics:[
    { id:"2.1", title:"Introduction to ML", subs:["What is ML?","Types of ML","The ML Pipeline","Tools & Ecosystem"] },
    { id:"2.2", title:"Math Foundations", subs:["Linear Algebra","Calculus","Probability","Optimization"] },
    { id:"2.3", title:"Data Preprocessing", subs:["Data Quality","Feature Scaling","Encoding","Feature Selection"] },
    { id:"2.4", title:"Regression", subs:["Linear Regression","Polynomial","Regularized","Advanced"] },
    { id:"2.5", title:"Classification", subs:["Logistic Regression","KNN","SVM","Naive Bayes","Evaluation"] },
    { id:"2.6", title:"Ensemble Methods", subs:["Bagging","Boosting","Stacking"] },
  ]},
  { id:3, title:"Python Backend", icon:"🐍", modules:10, color:"#059669" },
  { id:4, title:"React Frontend", icon:"⚛️", modules:10, color:"#0EA5E9" },
  { id:5, title:"Cloud & DevOps", icon:"☁️", modules:8, color:"#D97706" },
  { id:6, title:"Data Engineering", icon:"🔧", modules:5, color:"#DC2626" },
  { id:7, title:"Project Management", icon:"📋", modules:8, color:"#4F46E5" },
  { id:8, title:"Product Management", icon:"🎯", modules:8, color:"#BE185D" },
  { id:9, title:"Advanced AI & LLMs", icon:"🤖", modules:7, color:"#7C3AED" },
  { id:10, title:"CS Fundamentals", icon:"💻", modules:5, color:"#0D9488" },
  { id:11, title:"Data Platforms", icon:"🗄️", modules:3, color:"#B45309" },
  { id:12, title:"Dev Tools", icon:"🛠️", modules:4, color:"#6D28D9" },
  { id:13, title:"Emerging Tech", icon:"🚀", modules:4, color:"#E11D48" },
  { id:14, title:"GenAI & Agents", icon:"✨", modules:16, color:"#2563EB" },
];

const SAMPLE_CONTENT = {
  title: "Support Vector Machines (SVM)",
  module: "Module 5: Classification",
  part: "Part 2: Machine Learning",
  sections: [
    { type:"explanation", content:`A Support Vector Machine finds the optimal hyperplane that separates data points of different classes with the **maximum margin**. The key insight is that only the points closest to the decision boundary (called **support vectors**) determine the position of the hyperplane — all other points are irrelevant to the solution.\n\nThis makes SVMs remarkably robust to outliers and effective in high-dimensional spaces, even when the number of dimensions exceeds the number of samples.` },
    { type:"analogy", content:`Imagine you're a city planner drawing a boundary between two neighborhoods. You want the widest possible street between them — that's the margin. The buildings closest to the street on each side are your support vectors. Moving any other building doesn't affect where the street goes, but moving a support vector changes everything.` },
    { type:"math", content:`The optimization objective:\n\nminimize  ½||w||²\nsubject to  yᵢ(w·xᵢ + b) ≥ 1  for all i\n\nwhere w is the weight vector, b is the bias, and the margin width = 2/||w||` },
    { type:"code", lang:"python", content:`from sklearn.svm import SVC
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Generate sample data
X, y = make_classification(
    n_samples=200, n_features=2,
    n_redundant=0, random_state=42
)

# Split and train
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# Train SVM with RBF kernel
svm = SVC(kernel='rbf', C=1.0, gamma='scale')
svm.fit(X_train, y_train)

# Evaluate
y_pred = svm.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.2%}")
print(f"Support vectors: {svm.n_support_}")` },
    { type:"pitfalls", items:[
      "Not scaling features before training — SVMs are sensitive to feature magnitude",
      "Using linear kernel on non-linearly separable data",
      "Setting C too high causes overfitting; too low causes underfitting",
      "Ignoring class imbalance — use class_weight='balanced'",
    ]},
  ],
  quiz: [
    { q:"What determines the position of an SVM's decision boundary?", opts:["All training points","Only misclassified points","Support vectors only","Random subset of points"], correct:2 },
    { q:"What happens when you increase the C parameter?", opts:["Margin becomes wider","Model becomes more tolerant of errors","Model fits training data more tightly","Training becomes faster"], correct:2 },
    { q:"Which kernel maps data to infinite-dimensional space?", opts:["Linear","Polynomial","RBF (Gaussian)","Sigmoid"], correct:2 },
  ]
};

// ─── Streaming text animation hook ───
function useStreamText(text, speed = 12, active = false) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) { setDisplayed(""); setDone(false); return; }
    let i = 0; setDisplayed(""); setDone(false);
    const iv = setInterval(() => {
      i += Math.floor(Math.random() * 3) + 1;
      if (i >= text.length) { setDisplayed(text); setDone(true); clearInterval(iv); }
      else setDisplayed(text.slice(0, i));
    }, speed);
    return () => clearInterval(iv);
  }, [text, active, speed]);
  return [displayed, done];
}

// ═══════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════
export default function StudyAIApp() {
  const [view, setView] = useState("syllabus"); // syllabus | learn | dashboard
  const [expandedPart, setExpandedPart] = useState(2);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [streamSection, setStreamSection] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLevel, setUserLevel] = useState("intermediate");

  const startLearning = (topicId) => {
    setSelectedTopic(topicId);
    setView("learn");
    setStreaming(true);
    setStreamSection(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const progress = { completed: 23, inProgress: 8, total: 132, streak: 7, hours: 42 };

  return (
    <div style={{ display:"flex", height:"100vh", background:"#FAFBFC", fontFamily:"'Source Serif 4', 'Newsreader', Georgia, serif", color:"#1A1D23", overflow:"hidden" }}>

      {/* ═══════ SIDEBAR ═══════ */}
      <aside style={{
        width: sidebarOpen ? 290 : 0, minWidth: sidebarOpen ? 290 : 0,
        background:"#FFFFFF", borderRight:"1px solid #E8ECF1",
        display:"flex", flexDirection:"column", transition:"all 0.3s ease",
        overflow:"hidden", flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding:"20px 22px 16px", borderBottom:"1px solid #E8ECF1" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:34, height:34, borderRadius:10,
              background:"linear-gradient(135deg, #2563EB, #7C3AED)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontSize:16, fontWeight:800,
              fontFamily:"'DM Sans', 'Helvetica Neue', sans-serif",
              boxShadow:"0 2px 8px rgba(37,99,235,0.25)",
            }}>S</div>
            <div>
              <div style={{ fontSize:16, fontWeight:700, letterSpacing:-0.5, fontFamily:"'DM Sans', sans-serif", color:"#1A1D23" }}>StudyAI</div>
              <div style={{ fontSize:10, color:"#8B93A1", fontFamily:"'DM Sans', sans-serif", letterSpacing:0.5 }}>INTELLIGENT LEARNING</div>
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{ display:"flex", padding:"12px 16px 0", gap:4 }}>
          {[
            { id:"syllabus", label:"Syllabus", icon:"📚" },
            { id:"dashboard", label:"Dashboard", icon:"📊" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)} style={{
              flex:1, padding:"8px 0", borderRadius:8, border:"none", cursor:"pointer",
              fontFamily:"'DM Sans', sans-serif", fontSize:12, fontWeight:600, letterSpacing:0.2,
              background: view === tab.id || (view === "learn" && tab.id === "syllabus") ? "#F0F4FF" : "transparent",
              color: view === tab.id || (view === "learn" && tab.id === "syllabus") ? "#2563EB" : "#8B93A1",
              transition:"all 0.2s",
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding:"12px 16px 8px" }}>
          <div style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"8px 12px", background:"#F5F7FA", borderRadius:8,
            border:"1px solid #E8ECF1",
          }}>
            <span style={{ fontSize:13, color:"#A0A7B5" }}>🔍</span>
            <input
              placeholder="Search 2,000+ topics..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{
                border:"none", background:"transparent", outline:"none", flex:1,
                fontSize:12.5, fontFamily:"'DM Sans', sans-serif", color:"#1A1D23",
              }}
            />
          </div>
        </div>

        {/* Syllabus tree */}
        <div style={{ flex:1, overflowY:"auto", padding:"4px 10px 20px" }}>
          {SYLLABUS.filter(p =>
            !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase())
          ).map(part => {
            const isExpanded = expandedPart === part.id;
            return (
              <div key={part.id} style={{ marginBottom:2 }}>
                <button onClick={() => setExpandedPart(isExpanded ? null : part.id)} style={{
                  width:"100%", display:"flex", alignItems:"center", gap:10,
                  padding:"10px 12px", border:"none", borderRadius:10, cursor:"pointer",
                  background: isExpanded ? "#F0F4FF" : "transparent",
                  transition:"all 0.15s",
                }}>
                  <span style={{ fontSize:18 }}>{part.icon}</span>
                  <div style={{ flex:1, textAlign:"left" }}>
                    <div style={{ fontSize:12.5, fontWeight:600, color:"#1A1D23", fontFamily:"'DM Sans', sans-serif", lineHeight:1.3 }}>
                      {part.title}
                    </div>
                    <div style={{ fontSize:10, color:"#A0A7B5", fontFamily:"'DM Sans', sans-serif", marginTop:1 }}>
                      {part.modules} modules
                    </div>
                  </div>
                  <span style={{ fontSize:10, color:"#A0A7B5", transition:"transform 0.2s", transform: isExpanded ? "rotate(90deg)" : "rotate(0)" }}>▶</span>
                </button>

                {/* Expanded topics */}
                {isExpanded && part.topics && (
                  <div style={{ paddingLeft:20, paddingTop:4 }}>
                    {part.topics.map(topic => (
                      <button key={topic.id} onClick={() => startLearning(topic.id)} style={{
                        width:"100%", display:"flex", alignItems:"flex-start", gap:8,
                        padding:"9px 12px", border:"none", borderRadius:8, cursor:"pointer",
                        background: selectedTopic === topic.id ? `${part.color}10` : "transparent",
                        borderLeft: selectedTopic === topic.id ? `3px solid ${part.color}` : "3px solid transparent",
                        transition:"all 0.15s", textAlign:"left",
                      }}>
                        <div style={{
                          width:20, height:20, borderRadius:6, flexShrink:0, marginTop:1,
                          background: selectedTopic === topic.id ? part.color : "#E8ECF1",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:9, color: selectedTopic === topic.id ? "#fff" : "#A0A7B5",
                          fontFamily:"'DM Sans', sans-serif", fontWeight:700,
                        }}>{topic.id}</div>
                        <div>
                          <div style={{ fontSize:12, fontWeight:500, color:"#1A1D23", fontFamily:"'DM Sans', sans-serif", lineHeight:1.3 }}>
                            {topic.title}
                          </div>
                          <div style={{ fontSize:10, color:"#B0B7C3", fontFamily:"'DM Sans', sans-serif", marginTop:2 }}>
                            {topic.subs.length} sub-topics
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User card */}
        <div style={{ padding:"14px 16px", borderTop:"1px solid #E8ECF1", background:"#FAFBFC" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:32, height:32, borderRadius:10, background:"linear-gradient(135deg, #F97316, #EF4444)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontSize:13, fontWeight:700, fontFamily:"'DM Sans', sans-serif",
            }}>P</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:600, fontFamily:"'DM Sans', sans-serif" }}>Priya Sharma</div>
              <div style={{ fontSize:10, color:"#A0A7B5", fontFamily:"'DM Sans', sans-serif" }}>Pro Plan • {progress.streak}🔥 streak</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Top bar */}
        <header style={{
          height:54, display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 28px", background:"#FFFFFF", borderBottom:"1px solid #E8ECF1", flexShrink:0,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
              border:"none", background:"none", cursor:"pointer", fontSize:18, color:"#8B93A1",
              padding:"4px", borderRadius:6,
            }}>☰</button>
            {view === "learn" && (
              <div style={{ display:"flex", alignItems:"center", gap:6, fontFamily:"'DM Sans', sans-serif" }}>
                <span style={{ fontSize:11, color:"#A0A7B5", cursor:"pointer" }} onClick={() => setView("syllabus")}>Part 2</span>
                <span style={{ fontSize:10, color:"#D0D5DD" }}>/</span>
                <span style={{ fontSize:11, color:"#A0A7B5" }}>Module 5</span>
                <span style={{ fontSize:10, color:"#D0D5DD" }}>/</span>
                <span style={{ fontSize:11, color:"#1A1D23", fontWeight:600 }}>SVM</span>
              </div>
            )}
            {view === "dashboard" && <span style={{ fontSize:14, fontWeight:600, fontFamily:"'DM Sans', sans-serif" }}>Learning Dashboard</span>}
            {view === "syllabus" && <span style={{ fontSize:14, fontWeight:600, fontFamily:"'DM Sans', sans-serif" }}>Curriculum Overview</span>}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {view === "learn" && (
              <select value={userLevel} onChange={e => setUserLevel(e.target.value)} style={{
                padding:"6px 12px", borderRadius:8, border:"1px solid #E8ECF1",
                fontSize:11, fontFamily:"'DM Sans', sans-serif", color:"#5A6170",
                background:"#FAFBFC", cursor:"pointer", outline:"none",
              }}>
                <option value="beginner">🌱 Beginner</option>
                <option value="intermediate">📘 Intermediate</option>
                <option value="advanced">🔬 Advanced</option>
              </select>
            )}
            <div style={{
              padding:"6px 14px", borderRadius:8, background:"#F0F4FF",
              fontSize:11, fontWeight:600, color:"#2563EB", fontFamily:"'DM Sans', sans-serif",
            }}>
              {progress.completed}/{progress.total} completed
            </div>
          </div>
        </header>

        {/* Content area */}
        <div style={{ flex:1, overflowY:"auto", background:"#FAFBFC" }}>

          {/* ═══════ DASHBOARD VIEW ═══════ */}
          {view === "dashboard" && (
            <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 28px" }}>
              {/* Stats row */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:32 }}>
                {[
                  { label:"Topics Completed", value:progress.completed, sub:`of ${progress.total}`, color:"#2563EB", pct:Math.round(progress.completed/progress.total*100) },
                  { label:"Current Streak", value:`${progress.streak} days`, sub:"Personal best: 12", color:"#F97316", icon:"🔥" },
                  { label:"Study Hours", value:progress.hours, sub:"This month", color:"#059669" },
                  { label:"Avg Quiz Score", value:"78%", sub:"Last 30 days", color:"#7C3AED" },
                ].map((s,i) => (
                  <div key={i} style={{
                    padding:"22px 20px", background:"#FFFFFF", borderRadius:14,
                    border:"1px solid #E8ECF1",
                    boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
                  }}>
                    <div style={{ fontSize:11, color:"#8B93A1", fontFamily:"'DM Sans', sans-serif", fontWeight:500, marginBottom:8 }}>{s.label}</div>
                    <div style={{ fontSize:28, fontWeight:800, color:s.color, fontFamily:"'DM Sans', sans-serif", letterSpacing:-1 }}>
                      {s.value} {s.icon || ""}
                    </div>
                    <div style={{ fontSize:10, color:"#B0B7C3", fontFamily:"'DM Sans', sans-serif", marginTop:4 }}>{s.sub}</div>
                    {s.pct !== undefined && (
                      <div style={{ marginTop:10, height:4, background:"#F0F2F5", borderRadius:2, overflow:"hidden" }}>
                        <div style={{ width:`${s.pct}%`, height:"100%", background:s.color, borderRadius:2, transition:"width 1s ease" }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Due for review */}
              <div style={{ background:"#FFFFFF", borderRadius:14, border:"1px solid #E8ECF1", padding:"20px 24px", marginBottom:24, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <div style={{ fontSize:15, fontWeight:700, fontFamily:"'DM Sans', sans-serif" }}>📅 Due for Review</div>
                  <span style={{ fontSize:11, color:"#2563EB", fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer" }}>See all →</span>
                </div>
                {["Probability Theory — Bayes' Theorem", "Linear Regression — Assumptions", "Gradient Descent — Learning Rate", "CNN — Pooling Layers"].map((t,i) => (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"12px 0", borderBottom: i < 3 ? "1px solid #F0F2F5" : "none",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{
                        width:8, height:8, borderRadius:"50%",
                        background: i === 0 ? "#EF4444" : i === 1 ? "#F97316" : "#F59E0B",
                      }} />
                      <span style={{ fontSize:13, fontFamily:"'DM Sans', sans-serif" }}>{t}</span>
                    </div>
                    <button onClick={() => startLearning("1.3")} style={{
                      padding:"5px 14px", borderRadius:6, border:"1px solid #E8ECF1",
                      background:"#FAFBFC", fontSize:11, fontFamily:"'DM Sans', sans-serif",
                      color:"#5A6170", cursor:"pointer", fontWeight:500,
                    }}>Review</button>
                  </div>
                ))}
              </div>

              {/* Weekly progress chart (simple bars) */}
              <div style={{ background:"#FFFFFF", borderRadius:14, border:"1px solid #E8ECF1", padding:"20px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize:15, fontWeight:700, fontFamily:"'DM Sans', sans-serif", marginBottom:20 }}>📈 This Week</div>
                <div style={{ display:"flex", gap:12, alignItems:"flex-end", height:120 }}>
                  {[
                    { day:"Mon", topics:4, mins:45 }, { day:"Tue", topics:6, mins:72 },
                    { day:"Wed", topics:3, mins:35 }, { day:"Thu", topics:7, mins:85 },
                    { day:"Fri", topics:5, mins:60 }, { day:"Sat", topics:2, mins:25 },
                    { day:"Sun", topics:0, mins:0 },
                  ].map((d,i) => (
                    <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                      <div style={{ fontSize:9, color:"#8B93A1", fontFamily:"'DM Sans', sans-serif" }}>{d.topics}t</div>
                      <div style={{
                        width:"100%", height: Math.max(4, d.mins * 1.1), borderRadius:6,
                        background: i === 6 ? "#F0F2F5" : "linear-gradient(180deg, #2563EB, #7C3AED)",
                        opacity: i === 6 ? 0.5 : 0.85,
                        transition:"height 0.6s ease",
                      }} />
                      <div style={{ fontSize:10, color: i === 6 ? "#D0D5DD" : "#5A6170", fontFamily:"'DM Sans', sans-serif", fontWeight:500 }}>{d.day}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════ SYLLABUS OVERVIEW ═══════ */}
          {view === "syllabus" && !selectedTopic && (
            <div style={{ maxWidth:960, margin:"0 auto", padding:"36px 28px" }}>
              <div style={{ marginBottom:32 }}>
                <h2 style={{ fontSize:26, fontWeight:800, fontFamily:"'DM Sans', sans-serif", letterSpacing:-0.8, marginBottom:8 }}>
                  Complete AI & Full-Stack Curriculum
                </h2>
                <p style={{ fontSize:14, color:"#6B7280", fontFamily:"'DM Sans', sans-serif", lineHeight:1.6 }}>
                  14 parts • 132 modules • 2,000+ topics — from statistics fundamentals to cutting-edge AI agents
                </p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
                {SYLLABUS.map(part => (
                  <button key={part.id} onClick={() => { setExpandedPart(part.id); }} style={{
                    padding:"22px 20px", background:"#FFFFFF", borderRadius:14,
                    border:"1px solid #E8ECF1", cursor:"pointer", textAlign:"left",
                    boxShadow:"0 1px 3px rgba(0,0,0,0.03)", transition:"all 0.2s",
                    position:"relative", overflow:"hidden",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.03)"; }}
                  >
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:part.color, opacity:0.7 }} />
                    <div style={{ fontSize:28, marginBottom:10 }}>{part.icon}</div>
                    <div style={{ fontSize:13, fontWeight:700, fontFamily:"'DM Sans', sans-serif", color:"#1A1D23", marginBottom:4, lineHeight:1.3 }}>
                      Part {part.id}: {part.title}
                    </div>
                    <div style={{ fontSize:11, color:"#8B93A1", fontFamily:"'DM Sans', sans-serif" }}>{part.modules} modules</div>
                    {/* Progress mini bar */}
                    <div style={{ marginTop:12, height:3, background:"#F0F2F5", borderRadius:2 }}>
                      <div style={{ width:`${Math.max(0, Math.floor(Math.random()*30 + (part.id < 3 ? 40 : 0)))}%`, height:"100%", background:part.color, borderRadius:2, opacity:0.6 }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ LEARNING VIEW ═══════ */}
          {view === "learn" && (
            <LearningView
              content={SAMPLE_CONTENT}
              streaming={streaming}
              setStreaming={setStreaming}
              streamSection={streamSection}
              setStreamSection={setStreamSection}
              quizAnswers={quizAnswers}
              setQuizAnswers={setQuizAnswers}
              quizSubmitted={quizSubmitted}
              setQuizSubmitted={setQuizSubmitted}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════
// LEARNING VIEW COMPONENT
// ═══════════════════════════════════════════════
function LearningView({ content, streaming, setStreaming, streamSection, setStreamSection, quizAnswers, setQuizAnswers, quizSubmitted, setQuizSubmitted }) {
  const [visibleSections, setVisibleSections] = useState(0);

  useEffect(() => {
    if (!streaming) { setVisibleSections(content.sections.length); return; }
    setVisibleSections(0);
    let idx = 0;
    const iv = setInterval(() => {
      idx++;
      setVisibleSections(idx);
      if (idx >= content.sections.length) { clearInterval(iv); setStreaming(false); }
    }, 1200);
    return () => clearInterval(iv);
  }, [streaming]);

  return (
    <div style={{ maxWidth:780, margin:"0 auto", padding:"36px 28px 60px" }}>

      {/* Topic header */}
      <div style={{ marginBottom:32 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <span style={{
            padding:"4px 10px", borderRadius:6, background:"#F0F4FF",
            fontSize:10, fontWeight:600, color:"#2563EB", fontFamily:"'DM Sans', sans-serif",
          }}>{content.part}</span>
          <span style={{
            padding:"4px 10px", borderRadius:6, background:"#FAF5FF",
            fontSize:10, fontWeight:600, color:"#7C3AED", fontFamily:"'DM Sans', sans-serif",
          }}>{content.module}</span>
        </div>
        <h1 style={{ fontSize:30, fontWeight:800, fontFamily:"'DM Sans', sans-serif", letterSpacing:-1, color:"#1A1D23", marginBottom:8 }}>
          {content.title}
        </h1>
        <div style={{ display:"flex", alignItems:"center", gap:16, fontSize:12, color:"#8B93A1", fontFamily:"'DM Sans', sans-serif" }}>
          <span>⏱️ ~25 min</span>
          <span>📖 Intermediate</span>
          <span>5 sub-topics</span>
        </div>
      </div>

      {/* Streaming indicator */}
      {streaming && (
        <div style={{
          display:"flex", alignItems:"center", gap:10, padding:"12px 18px",
          background:"linear-gradient(135deg, #F0F4FF, #FAF5FF)", borderRadius:10,
          marginBottom:24, border:"1px solid #E0E7FF",
        }}>
          <div style={{ display:"flex", gap:3 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width:6, height:6, borderRadius:"50%", background:"#2563EB",
                animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`,
              }} />
            ))}
          </div>
          <span style={{ fontSize:12, color:"#4B5EAA", fontFamily:"'DM Sans', sans-serif", fontWeight:500 }}>
            AI Teacher is generating your lesson...
          </span>
          <style>{`@keyframes pulse { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1.2); } }`}</style>
        </div>
      )}

      {/* Content sections */}
      {content.sections.slice(0, visibleSections).map((section, i) => (
        <div key={i} style={{
          marginBottom:24, animation:"fadeUp 0.4s ease",
        }}>
          <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>

          {section.type === "explanation" && (
            <div style={{
              padding:"24px 28px", background:"#FFFFFF", borderRadius:14,
              border:"1px solid #E8ECF1", boxShadow:"0 1px 3px rgba(0,0,0,0.03)",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <span style={{ fontSize:16 }}>📖</span>
                <span style={{ fontSize:13, fontWeight:700, fontFamily:"'DM Sans', sans-serif", color:"#2563EB" }}>Concept Explanation</span>
              </div>
              {section.content.split("\n\n").map((para, pi) => (
                <p key={pi} style={{
                  fontSize:15, lineHeight:1.75, color:"#374151", marginBottom:14,
                  fontFamily:"'Source Serif 4', Georgia, serif",
                }}>
                  {para.split(/(\*\*.*?\*\*)/).map((chunk, ci) =>
                    chunk.startsWith("**") && chunk.endsWith("**")
                      ? <strong key={ci} style={{ color:"#1A1D23", fontWeight:700 }}>{chunk.slice(2,-2)}</strong>
                      : chunk
                  )}
                </p>
              ))}
            </div>
          )}

          {section.type === "analogy" && (
            <div style={{
              padding:"22px 26px", background:"linear-gradient(135deg, #FFFBEB, #FEF3C7)",
              borderRadius:14, border:"1px solid #FDE68A", position:"relative",
            }}>
              <div style={{ position:"absolute", top:16, right:20, fontSize:36, opacity:0.15 }}>💡</div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <span style={{ fontSize:16 }}>💡</span>
                <span style={{ fontSize:13, fontWeight:700, fontFamily:"'DM Sans', sans-serif", color:"#B45309" }}>Real-World Analogy</span>
              </div>
              <p style={{ fontSize:14.5, lineHeight:1.7, color:"#78350F", fontStyle:"italic", fontFamily:"'Source Serif 4', Georgia, serif" }}>
                "{section.content}"
              </p>
            </div>
          )}

          {section.type === "math" && (
            <div style={{
              padding:"22px 26px", background:"#FFFFFF", borderRadius:14,
              border:"1px solid #E8ECF1", boxShadow:"0 1px 3px rgba(0,0,0,0.03)",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <span style={{ fontSize:16 }}>📐</span>
                <span style={{ fontSize:13, fontWeight:700, fontFamily:"'DM Sans', sans-serif", color:"#7C3AED" }}>Mathematical Foundation</span>
              </div>
              <pre style={{
                background:"#F8F7FF", padding:"18px 22px", borderRadius:10,
                border:"1px solid #EDE9FE", fontFamily:"'JetBrains Mono', monospace",
                fontSize:13.5, lineHeight:1.8, color:"#4C1D95", overflowX:"auto",
                whiteSpace:"pre-wrap",
              }}>
                {section.content}
              </pre>
            </div>
          )}

          {section.type === "code" && (
            <div style={{
              background:"#FFFFFF", borderRadius:14, border:"1px solid #E8ECF1",
              overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.03)",
            }}>
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"12px 20px", background:"#F8FAFC", borderBottom:"1px solid #E8ECF1",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:14 }}>💻</span>
                  <span style={{ fontSize:12, fontWeight:700, fontFamily:"'DM Sans', sans-serif", color:"#059669" }}>Code Example</span>
                  <span style={{
                    padding:"2px 8px", borderRadius:4, background:"#ECFDF5",
                    fontSize:10, color:"#059669", fontFamily:"'DM Sans', sans-serif", fontWeight:600,
                  }}>{section.lang}</span>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  <button style={{
                    padding:"5px 14px", borderRadius:6, border:"none", cursor:"pointer",
                    background:"linear-gradient(135deg, #059669, #10B981)", color:"#fff",
                    fontSize:11, fontFamily:"'DM Sans', sans-serif", fontWeight:600,
                    boxShadow:"0 1px 4px rgba(5,150,105,0.3)",
                  }}>▶ Run</button>
                  <button style={{
                    padding:"5px 12px", borderRadius:6, border:"1px solid #E8ECF1",
                    background:"#fff", fontSize:11, fontFamily:"'DM Sans', sans-serif",
                    color:"#6B7280", cursor:"pointer",
                  }}>📋 Copy</button>
                </div>
              </div>
              <pre style={{
                margin:0, padding:"20px 24px", background:"#1E293B",
                fontFamily:"'JetBrains Mono', 'Fira Code', monospace",
                fontSize:12.5, lineHeight:1.7, color:"#E2E8F0",
                overflowX:"auto",
              }}>
                <code>{section.content}</code>
              </pre>
              {/* Simulated output */}
              <div style={{
                padding:"14px 24px", background:"#0F172A", borderTop:"1px solid #334155",
              }}>
                <div style={{ fontSize:10, color:"#64748B", fontFamily:"'DM Sans', sans-serif", marginBottom:6 }}>OUTPUT</div>
                <pre style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:12, color:"#4ADE80", margin:0 }}>
{`Accuracy: 91.67%
Support vectors: [24, 21]`}
                </pre>
              </div>
            </div>
          )}

          {section.type === "pitfalls" && (
            <div style={{
              padding:"22px 26px", background:"linear-gradient(135deg, #FFF5F5, #FEF2F2)",
              borderRadius:14, border:"1px solid #FECACA",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <span style={{ fontSize:16 }}>⚠️</span>
                <span style={{ fontSize:13, fontWeight:700, fontFamily:"'DM Sans', sans-serif", color:"#DC2626" }}>Common Pitfalls</span>
              </div>
              {section.items.map((item, ii) => (
                <div key={ii} style={{
                  display:"flex", gap:10, padding:"8px 0",
                  borderBottom: ii < section.items.length - 1 ? "1px solid #FEE2E2" : "none",
                }}>
                  <span style={{ color:"#EF4444", fontSize:12, flexShrink:0, marginTop:2 }}>✕</span>
                  <span style={{ fontSize:13, color:"#7F1D1D", lineHeight:1.5, fontFamily:"'DM Sans', sans-serif" }}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* ═══════ QUIZ SECTION ═══════ */}
      {!streaming && visibleSections >= content.sections.length && (
        <div style={{
          padding:"28px 30px", background:"#FFFFFF", borderRadius:14,
          border:"1px solid #E8ECF1", boxShadow:"0 1px 3px rgba(0,0,0,0.03)",
          animation:"fadeUp 0.4s ease",
        }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:18 }}>🧪</span>
              <span style={{ fontSize:15, fontWeight:700, fontFamily:"'DM Sans', sans-serif" }}>Knowledge Check</span>
            </div>
            <span style={{ fontSize:11, color:"#8B93A1", fontFamily:"'DM Sans', sans-serif" }}>{content.quiz.length} questions</span>
          </div>

          {content.quiz.map((q, qi) => (
            <div key={qi} style={{
              marginBottom:24, paddingBottom: qi < content.quiz.length - 1 ? 24 : 0,
              borderBottom: qi < content.quiz.length - 1 ? "1px solid #F0F2F5" : "none",
            }}>
              <div style={{ fontSize:14, fontWeight:600, color:"#1A1D23", marginBottom:14, fontFamily:"'DM Sans', sans-serif", lineHeight:1.5 }}>
                <span style={{ color:"#2563EB", marginRight:8 }}>Q{qi+1}.</span>{q.q}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {q.opts.map((opt, oi) => {
                  const selected = quizAnswers[qi] === oi;
                  const isCorrect = oi === q.correct;
                  const showResult = quizSubmitted;
                  return (
                    <button key={oi} onClick={() => !quizSubmitted && setQuizAnswers({...quizAnswers, [qi]: oi})} style={{
                      padding:"12px 16px", borderRadius:10, cursor: quizSubmitted ? "default" : "pointer",
                      textAlign:"left", fontSize:13, fontFamily:"'DM Sans', sans-serif",
                      lineHeight:1.4, transition:"all 0.15s",
                      border: showResult
                        ? isCorrect ? "2px solid #059669" : selected ? "2px solid #EF4444" : "1px solid #E8ECF1"
                        : selected ? "2px solid #2563EB" : "1px solid #E8ECF1",
                      background: showResult
                        ? isCorrect ? "#ECFDF5" : selected ? "#FEF2F2" : "#FAFBFC"
                        : selected ? "#F0F4FF" : "#FAFBFC",
                      color: "#374151",
                      fontWeight: selected ? 600 : 400,
                    }}>
                      <span style={{
                        display:"inline-flex", alignItems:"center", justifyContent:"center",
                        width:22, height:22, borderRadius:6, marginRight:10, fontSize:11, fontWeight:700,
                        background: showResult
                          ? isCorrect ? "#059669" : selected ? "#EF4444" : "#E8ECF1"
                          : selected ? "#2563EB" : "#E8ECF1",
                        color: (showResult && (isCorrect || selected)) || selected ? "#fff" : "#8B93A1",
                      }}>
                        {showResult ? (isCorrect ? "✓" : selected ? "✕" : String.fromCharCode(65+oi)) : String.fromCharCode(65+oi)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!quizSubmitted ? (
            <button onClick={() => setQuizSubmitted(true)} disabled={Object.keys(quizAnswers).length < content.quiz.length} style={{
              width:"100%", padding:"14px", borderRadius:10, border:"none", cursor:"pointer",
              background: Object.keys(quizAnswers).length < content.quiz.length
                ? "#E8ECF1" : "linear-gradient(135deg, #2563EB, #7C3AED)",
              color: Object.keys(quizAnswers).length < content.quiz.length ? "#A0A7B5" : "#fff",
              fontSize:14, fontWeight:700, fontFamily:"'DM Sans', sans-serif",
              boxShadow: Object.keys(quizAnswers).length >= content.quiz.length ? "0 2px 8px rgba(37,99,235,0.3)" : "none",
              transition:"all 0.2s",
            }}>
              Submit Answers
            </button>
          ) : (
            <div style={{
              padding:"18px 22px", background:"linear-gradient(135deg, #F0F4FF, #FAF5FF)",
              borderRadius:12, border:"1px solid #E0E7FF", textAlign:"center",
            }}>
              <div style={{ fontSize:28, fontWeight:800, fontFamily:"'DM Sans', sans-serif", color:"#2563EB", marginBottom:4 }}>
                {Object.entries(quizAnswers).filter(([qi, ai]) => ai === content.quiz[qi].correct).length}/{content.quiz.length}
              </div>
              <div style={{ fontSize:13, color:"#6B7280", fontFamily:"'DM Sans', sans-serif" }}>
                {Object.entries(quizAnswers).filter(([qi, ai]) => ai === content.quiz[qi].correct).length === content.quiz.length
                  ? "🎉 Perfect score! Great understanding of SVMs."
                  : "Review the highlighted answers above and try again."}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Follow-up input */}
      {!streaming && visibleSections >= content.sections.length && (
        <div style={{
          marginTop:24, padding:"16px 20px", background:"#FFFFFF",
          borderRadius:14, border:"1px solid #E8ECF1",
          display:"flex", alignItems:"center", gap:12,
          boxShadow:"0 1px 3px rgba(0,0,0,0.03)",
        }}>
          <span style={{ fontSize:18 }}>💬</span>
          <input placeholder="Ask a follow-up question about SVMs..." style={{
            flex:1, border:"none", outline:"none", fontSize:13.5,
            fontFamily:"'DM Sans', sans-serif", color:"#1A1D23", background:"transparent",
          }} />
          <button style={{
            padding:"8px 18px", borderRadius:8, border:"none",
            background:"linear-gradient(135deg, #2563EB, #7C3AED)",
            color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer",
            fontFamily:"'DM Sans', sans-serif",
            boxShadow:"0 2px 6px rgba(37,99,235,0.25)",
          }}>Send</button>
        </div>
      )}
    </div>
  );
}
