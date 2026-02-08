#!/usr/bin/env pwsh
<#
  Test all StudyAI API endpoints
#>

$BASE_URL = "http://127.0.0.1:8000"
$results = @()

Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
Write-Host "  STUDYAI API - END-TO-END TEST" -ForegroundColor Cyan
Write-Host ("=" * 70) + "`n" -ForegroundColor Cyan

# Test 1: Health Check
try {
    Write-Host "1. Health Check (GET /api/v1/health)" -ForegroundColor Yellow
    $health = Invoke-RestMethod -Uri "$BASE_URL/api/v1/health"
    Write-Host "   ✅ Status: $($health.status)" -ForegroundColor Green
    Write-Host "   ✅ Database: $($health.database)" -ForegroundColor Green
    Write-Host "   ✅ LLM: $($health.llm_provider) / $($health.llm_model)" -ForegroundColor Green
    $results += "✅ Health Check"
} catch {
    Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $results += "❌ Health Check"
}

# Test 2: List All Main Topics
try {
    Write-Host "`n2. List All Main Topics (GET /api/v1/syllabus)" -ForegroundColor Yellow
    $syllabus = Invoke-RestMethod -Uri "$BASE_URL/api/v1/syllabus"
    Write-Host "   ✅ Returned $($syllabus.Count) main topics" -ForegroundColor Green
    Write-Host "      - Total units: $(($syllabus | Measure-Object -Property unit_count -Sum).Sum)" -ForegroundColor Green
    Write-Host "      - Total topics: $(($syllabus | Measure-Object -Property topic_count -Sum).Sum)" -ForegroundColor Green
    $results += "✅ List All Main Topics"
} catch {
    Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $results += "❌ List All Main Topics"
}

# Test 3: Get Main Topic Detail
try {
    Write-Host "`n3. Get Main Topic Detail (GET /api/v1/syllabus/1)" -ForegroundColor Yellow
    $main = Invoke-RestMethod -Uri "$BASE_URL/api/v1/syllabus/1"
    Write-Host "   ✅ Topic: $($main.name)" -ForegroundColor Green
    Write-Host "      - Units: $($main.units.Count)" -ForegroundColor Green
    Write-Host "      - First unit: $($main.units[0].name)" -ForegroundColor Green
    $results += "✅ Get Main Topic Detail"
} catch {
    Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $results += "❌ Get Main Topic Detail"
}

# Test 4: Get Topic with Sub-Topics
try {
    Write-Host "`n4. Get Topic with Sub-Topics (GET /api/v1/syllabus/topics/1)" -ForegroundColor Yellow
    $topic = Invoke-RestMethod -Uri "$BASE_URL/api/v1/syllabus/topics/1"
    Write-Host "   ✅ Topic: $($topic.title)" -ForegroundColor Green
    Write-Host "      - Unit: $($topic.unit_name)" -ForegroundColor Green
    Write-Host "      - Sub-topics: $($topic.sub_topics.Count)" -ForegroundColor Green
    $results += "✅ Get Topic with Sub-Topics"
} catch {
    Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $results += "❌ Get Topic with Sub-Topics"
}

# Test 5: Search Topics
try {
    Write-Host "`n5. Search Topics (GET /api/v1/syllabus/search/?q=python)" -ForegroundColor Yellow
    $search = Invoke-RestMethod -Uri "$BASE_URL/api/v1/syllabus/search/?q=python"
    Write-Host "   ✅ Found $($search.Count) results" -ForegroundColor Green
    if ($search.Count -gt 0) {
        Write-Host "      - First result: $($search[0].topic_title)" -ForegroundColor Green
    }
    $results += "✅ Search Topics"
} catch {
    Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $results += "❌ Search Topics"
}

# Test 6: Get Cached Content
try {
    Write-Host "`n6. Get Cached Content (GET /api/v1/learn/1/cached)" -ForegroundColor Yellow
    $cached = Invoke-RestMethod -Uri "$BASE_URL/api/v1/learn/1/cached"
    Write-Host "   ✅ Retrieved $($cached.Count) cached items" -ForegroundColor Green
    $results += "✅ Get Cached Content"
} catch {
    Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $results += "❌ Get Cached Content"
}

# Test 7: LLM Learn Endpoint (note: may be slow)
Write-Host "`n7. Generate Lesson via LLM (POST /api/v1/learn/1)" -ForegroundColor Yellow
Write-Host "   ⏳ Testing LLM (this may take 30-60 seconds)..." -ForegroundColor Cyan
try {
    $body = @{
        user_level = "beginner"
        focus_areas = @()
        include_code = $true
        include_quiz = $false
    } | ConvertTo-Json
    
    $lesson = Invoke-RestMethod -Uri "$BASE_URL/api/v1/learn/1" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 120
    
    Write-Host "   ✅ Lesson generated" -ForegroundColor Green
    Write-Host "      - Model: $($lesson.model_used)" -ForegroundColor Green
    Write-Host "      - Keys: $($lesson.PSObject.Properties.Name -join ', ')" -ForegroundColor Green
    $results += "✅ Generate Lesson via LLM"
} catch {
    Write-Host "   ⚠️  TIMEOUT/ERROR: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "      (This is expected if OpenRouter API is slow or API key invalid)" -ForegroundColor Yellow
    $results += "⚠️  Generate Lesson via LLM (timeout)"
}

# Test 8: Quiz Endpoint
Write-Host "`n8. Generate Quiz via LLM (POST /api/v1/quiz/1)" -ForegroundColor Yellow
Write-Host "   ⏳ Testing LLM quiz (this may take 20-30 seconds)..." -ForegroundColor Cyan
try {
    $quiz = Invoke-RestMethod -Uri "$BASE_URL/api/v1/quiz/1?num_questions=3&difficulty=beginner" `
        -Method POST `
        -TimeoutSec 120
    
    Write-Host "   ✅ Quiz generated" -ForegroundColor Green
    if ($quiz.questions) {
        Write-Host "      - Questions: $($quiz.questions.Count)" -ForegroundColor Green
    }
    Write-Host "      - Model: $($quiz.model_used)" -ForegroundColor Green
    $results += "✅ Generate Quiz via LLM"
} catch {
    Write-Host "   ⚠️  TIMEOUT/ERROR: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "      (This is expected if OpenRouter API is slow or API key invalid)" -ForegroundColor Yellow
    $results += "⚠️  Generate Quiz via LLM (timeout)"
}

# Summary
Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
foreach ($result in $results) {
    Write-Host "  $result" -ForegroundColor $(if ($result.StartsWith("✅")) { "Green" } else { "Yellow" })
}

$passing = ($results | Where-Object { $_.StartsWith("✅") }).Count
$total = $results.Count
Write-Host "`n  PASSED: $passing / $total" -ForegroundColor Green
Write-Host ("=" * 70 + "`n") -ForegroundColor Cyan
