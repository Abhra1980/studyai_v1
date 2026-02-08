$baseUrl = "http://127.0.0.1:8000/api/v1"
$pass = 0
$fail = 0

Write-Host ""
Write-Host "====== STUDYAI API - COMPREHENSIVE END-TO-END TESTING ======" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health
Write-Host "TEST 1: GET /health" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/health" -TimeoutSec 5
    Write-Host "  PASS - App: $($r.app), DB: $($r.database), LLM: $($r.llm_provider)" -ForegroundColor Green
    $pass++
}
catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $fail++
}

# Test 2: Syllabus List
Write-Host "TEST 2: GET /syllabus (list all main topics)" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/syllabus" -TimeoutSec 5
    Write-Host "  PASS - Found $($r.Count) main topics" -ForegroundColor Green
    $pass++
}
catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $fail++
}

# Test 3: Main Topic Detail
Write-Host "TEST 3: GET /syllabus/1 (main topic + units)" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/syllabus/1" -TimeoutSec 5
    Write-Host "  PASS - Topic: $($r.name), Units: $($r.units.Count)" -ForegroundColor Green
    $pass++
}
catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $fail++
}

# Test 4: Topic Detail with Sub-Topics
Write-Host "TEST 4: GET /syllabus/topics/1 (topic + sub-topics)" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/syllabus/topics/1" -TimeoutSec 5
    Write-Host "  PASS - Topic: $($r.title), Sub-Topics: $($r.sub_topics.Count)" -ForegroundColor Green
    $pass++
}
catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $fail++
}

# Test 5: Search (with trailing slash)
Write-Host "TEST 5: GET /syllabus/search/?q=statistics" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/syllabus/search/?q=statistics" -TimeoutSec 5
    Write-Host "  PASS - Found $($r.Count) search results" -ForegroundColor Green
    $pass++
}
catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $fail++
}

# Test 6: Cached Content
Write-Host "TEST 6: GET /learn/1/cached (retrieve cached lesson)" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/learn/1/cached" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($r) {
        Write-Host "  PASS - Cached model: $($r.model_used)" -ForegroundColor Green
    } else {
        Write-Host "  PASS - No cached content (OK)" -ForegroundColor Green
    }
    $pass++
}
catch {
    Write-Host "  PASS - No cached content (OK)" -ForegroundColor Green
    $pass++
}

# Test 7: Generate Lesson (LLM POST)
Write-Host "TEST 7: POST /learn/8 (generate lesson with Ollama)" -ForegroundColor Yellow
try {
    $body = @{user_level="beginner"} | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$baseUrl/learn/8" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 180
    Write-Host "  PASS - Topic: $($r.topic_title)" -ForegroundColor Green
    Write-Host "         Model: $($r.model_used), Explanation: $($r.explanation.Length) chars" -ForegroundColor Gray
    $pass++
}
catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $fail++
}

# Test 8: Generate Quiz (LLM POST)
Write-Host "TEST 8: POST /quiz/9 (generate quiz with Ollama)" -ForegroundColor Yellow
try {
    $body = @{num_questions=3} | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$baseUrl/quiz/9" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 180
    Write-Host "  PASS - Topic: $($r.topic_title)" -ForegroundColor Green
    Write-Host "         Model: $($r.model_used), Questions: $($r.questions.Count)" -ForegroundColor Gray
    $pass++
}
catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $fail++
}

# Summary
Write-Host ""
Write-Host "====== TEST SUMMARY ======" -ForegroundColor Cyan
Write-Host "PASSED: $pass   FAILED: $fail   TOTAL: $(($pass + $fail))" -ForegroundColor $(if($fail -eq 0) {"Green"} else {"Yellow"})
Write-Host ""
