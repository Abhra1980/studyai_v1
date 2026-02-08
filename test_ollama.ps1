#!/usr/bin/env pwsh
<#
  Complete API test with Ollama support
#>

$BASE_URL = "http://127.0.0.1:8000"
$results = @()

Write-Host "`n$('=' * 70)" -ForegroundColor Cyan
Write-Host "  STUDYAI API - OLLAMA INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "$('=' * 70)`n" -ForegroundColor Cyan

# Quick tests (no LLM)
try {
    $health = Invoke-RestMethod -Uri "$BASE_URL/api/v1/health"
    Write-Host "✅ Health Check - LLM Provider: $($health.llm_provider) / $($health.llm_model)" -ForegroundColor Green
    $results += "✅ Health Check"
} catch {
    Write-Host "❌ Health Check Failed" -ForegroundColor Red
    $results += "❌ Health Check"
}

try {
    $syllabus = Invoke-RestMethod -Uri "$BASE_URL/api/v1/syllabus"
    Write-Host "✅ List Syllabus - $($syllabus.Count) main topics" -ForegroundColor Green
    $results += "✅ List Syllabus"
} catch {
    Write-Host "❌ List Syllabus Failed" -ForegroundColor Red
    $results += "❌ List Syllabus"
}

try {
    $topic = Invoke-RestMethod -Uri "$BASE_URL/api/v1/syllabus/topics/1"
    Write-Host "✅ Topic Detail - $($topic.title) with $($topic.sub_topics.Count) sub-topics" -ForegroundColor Green
    $results += "✅ Topic Detail"
} catch {
    Write-Host "❌ Topic Detail Failed" -ForegroundColor Red
    $results += "❌ Topic Detail"
}

try {
    $search = Invoke-RestMethod -Uri "$BASE_URL/api/v1/syllabus/search/?q=machine"
    Write-Host "✅ Search - Found $($search.Count) results" -ForegroundColor Green
    $results += "✅ Search"
} catch {
    Write-Host "❌ Search Failed" -ForegroundColor Red
    $results += "❌ Search"
}

# LLM Tests (with Ollama)
Write-Host "`n⏳ Testing LLM with Ollama (this will take 30-60 seconds)..." -ForegroundColor Yellow

try {
    Write-Host "   Generating lesson..." -NoNewline
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
        -TimeoutSec 180

    Write-Host " ✅" -ForegroundColor Green
    Write-Host "✅ LLM Lesson Generation - Model: $($lesson.model_used)" -ForegroundColor Green
    Write-Host "   Keys: $($lesson.PSObject.Properties.Name -join ', ')" -ForegroundColor Green
    if ($lesson.explanation) {
        Write-Host "   Explanation length: $($lesson.explanation.Length) chars" -ForegroundColor Green
    }
    $results += "✅ LLM Lesson Generation"
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "❌ LLM Lesson Generation - $($_.Exception.Message)" -ForegroundColor Red
    $results += "❌ LLM Lesson Generation"
}

try {
    Write-Host "   Generating quiz..." -NoNewline
    $quiz = Invoke-RestMethod -Uri "$BASE_URL/api/v1/quiz/1?num_questions=3&difficulty=beginner" `
        -Method POST `
        -TimeoutSec 180
    
    Write-Host " ✅" -ForegroundColor Green
    Write-Host "✅ LLM Quiz Generation - Questions: $($quiz.questions.Count)" -ForegroundColor Green
    $results += "✅ LLM Quiz Generation"
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "❌ LLM Quiz Generation - $($_.Exception.Message)" -ForegroundColor Red
    $results += "❌ LLM Quiz Generation"
}

# Summary
Write-Host "`n$('=' * 70)" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "$('=' * 70)" -ForegroundColor Cyan
foreach ($result in $results) {
    Write-Host "  $result" -ForegroundColor $(if ($result.StartsWith("✅")) { "Green" } else { "Red" })
}

$passing = ($results | Where-Object { $_.StartsWith("✅") }).Count
$total = $results.Count
Write-Host "`n  PASSED: $passing / $total ✅" -ForegroundColor Green
Write-Host "$('=' * 70)`n" -ForegroundColor Cyan
