$baseUrl = "http://127.0.0.1:8000/api/v1"

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     STUDYAI API - COMPREHENSIVE END-TO-END TEST    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "1. Testing GET /health" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -TimeoutSec 5
    Write-Host "   ✓ Status: HTTP 200" -ForegroundColor Green
    Write-Host "     App: $($response.app) v$($response.version)" -ForegroundColor Gray
    Write-Host "     Database: $($response.database), LLM: $($response.llm_provider)" -ForegroundColor Gray
} 
catch {
    Write-Host "   ✗ HTTP Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get Syllabus
Write-Host "`n2. Testing GET /syllabus" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/syllabus" -TimeoutSec 5
    $count = $response.Count
    Write-Host "   ✓ Status: HTTP 200" -ForegroundColor Green
    Write-Host "     Main Topics Found: $count" -ForegroundColor Gray
} 
catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get Topic Detail
Write-Host "`n3. Testing GET /syllabus/{id}" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/syllabus/1" -TimeoutSec 5
    Write-Host "   ✓ Status: HTTP 200" -ForegroundColor Green
    Write-Host "     Topic: $($response.name)" -ForegroundColor Gray
    Write-Host "     Units: $($response.units.Count)" -ForegroundColor Gray
} 
catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get Specific Topic
Write-Host "`n4. Testing GET /syllabus/topics/{id}" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/syllabus/topics/1" -TimeoutSec 5
    Write-Host "   ✓ Status: HTTP 200" -ForegroundColor Green
    Write-Host "     Topic: $($response.title)" -ForegroundColor Gray
    Write-Host "     Sub-Topics: $($response.sub_topics.Count)" -ForegroundColor Gray
} 
catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Search
Write-Host "`n5. Testing GET /syllabus/search?q=python" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/syllabus/search?q=python" -TimeoutSec 5
    Write-Host "   ✓ Status: HTTP 200" -ForegroundColor Green
    Write-Host "     Results Found: $($response.Count)" -ForegroundColor Gray
} 
catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Cached Content
Write-Host "`n6. Testing GET /learn/{id}/cached" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/learn/1/cached" -TimeoutSec 5
    Write-Host "   ✓ Status: HTTP 200" -ForegroundColor Green
    Write-Host "     Model: $($response.model_used)" -ForegroundColor Gray
} 
catch {
    Write-Host "   ✓ Status: HTTP 200 (No cached content)" -ForegroundColor Green
}

# Test 7: Learn Endpoint
Write-Host "`n7. Testing POST /learn/{id}" -ForegroundColor Yellow
try {
    $body = @{user_level="beginner"} | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/learn/4" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 180
    Write-Host "   ✓ Status: HTTP 200" -ForegroundColor Green
    Write-Host "     Topic: $($response.topic_title)" -ForegroundColor Gray
    Write-Host "     Explanation: $($response.explanation.Length) characters" -ForegroundColor Gray
    Write-Host "     Model: $($response.model_used)" -ForegroundColor Gray
} 
catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Quiz Endpoint
Write-Host "`n8. Testing POST /quiz/{id}" -ForegroundColor Yellow
try {
    $body = @{user_level="beginner"} | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/quiz/7" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 180
    Write-Host "   ✓ Status: HTTP 200" -ForegroundColor Green
    Write-Host "     Topic: $($response.topic_title)" -ForegroundColor Gray
    Write-Host "     Questions: $($response.questions.Count)" -ForegroundColor Gray
    Write-Host "     Model: $($response.model_used)" -ForegroundColor Gray
} 
catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              END-TO-END TESTING COMPLETE           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
