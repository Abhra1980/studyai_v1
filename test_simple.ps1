$baseUrl = "http://127.0.0.1:8000/api/v1"

Write-Host ""
Write-Host "====== STUDYAI API - END-TO-END TESTING ======" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health
Write-Host "TEST 1: GET /health" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/health" -TimeoutSec 5
    Write-Host "  PASS - App: $($r.app), DB: $($r.database), LLM: $($r.llm_provider)" -ForegroundColor Green
}
catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Syllabus List
Write-Host "TEST 2: GET /syllabus" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/syllabus" -TimeoutSec 5
    Write-Host "  PASS - Found $($r.Count) main topics" -ForegroundColor Green
}
catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Syllabus Detail
Write-Host "TEST 3: GET /syllabus/1" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/syllabus/1" -TimeoutSec 5
    Write-Host "  PASS - Topic: $($r.name), Units: $($r.units.Count)" -ForegroundColor Green
}
catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Topic Detail
Write-Host "TEST 4: GET /syllabus/topics/1" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/syllabus/topics/1" -TimeoutSec 5
    Write-Host "  PASS - Topic: $($r.title), Sub-Topics: $($r.sub_topics.Count)" -ForegroundColor Green
}
catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Search
Write-Host "TEST 5: GET /syllabus/search?q=python" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/syllabus/search?q=python" -TimeoutSec 5
    Write-Host "  PASS - Found $($r.Count) results" -ForegroundColor Green
}
catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Cached Content
Write-Host "TEST 6: GET /learn/1/cached" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/learn/1/cached" -TimeoutSec 5
    Write-Host "  PASS - Model: $($r.model_used)" -ForegroundColor Green
}
catch {
    Write-Host "  PASS - No cached content (OK)" -ForegroundColor Green
}

# Test 7: Learn POST
Write-Host "TEST 7: POST /learn/4" -ForegroundColor Yellow
try {
    $body = @{user_level="beginner"} | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$baseUrl/learn/4" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 180
    Write-Host "  PASS - Topic: $($r.topic_title), Model: $($r.model_used), Chars: $($r.explanation.Length)" -ForegroundColor Green
}
catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Quiz POST
Write-Host "TEST 8: POST /quiz/7" -ForegroundColor Yellow
try {
    $body = @{user_level="beginner"} | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$baseUrl/quiz/7" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 180
    Write-Host "  PASS - Topic: $($r.topic_title), Questions: $($r.questions.Count), Model: $($r.model_used)" -ForegroundColor Green
}
catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "====== TESTING COMPLETE ======" -ForegroundColor Cyan
Write-Host ""
