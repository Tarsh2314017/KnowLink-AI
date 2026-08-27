$baseUrl = "http://localhost:5000"

Write-Host "`n========== ROOT ==========" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Method GET -Uri "$baseUrl/"
    $response | ConvertTo-Json
}
catch {
    Write-Host "Root route failed" -ForegroundColor Red
}

Write-Host "`n========== HEALTH ==========" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Method GET -Uri "$baseUrl/api/health"
    $response | ConvertTo-Json
}
catch {
    Write-Host "Health route failed" -ForegroundColor Red
}

$email = "test$(Get-Random)@example.com"
$password = "Password@123"

Write-Host "`n========== REGISTER ==========" -ForegroundColor Cyan

$registerBody = @{
    name = "Test User"
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod `
        -Method POST `
        -Uri "$baseUrl/api/auth/register" `
        -ContentType "application/json" `
        -Body $registerBody

    $registerResponse | ConvertTo-Json -Depth 10
}
catch {
    Write-Host $_.ErrorDetails.Message -ForegroundColor Red
}

Write-Host "`n========== LOGIN ==========" -ForegroundColor Cyan

$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod `
        -Method POST `
        -Uri "$baseUrl/api/auth/login" `
        -ContentType "application/json" `
        -Body $loginBody

    $loginResponse | ConvertTo-Json -Depth 10

    $token = $loginResponse.token

    Write-Host "`nJWT received successfully!" -ForegroundColor Green
}
catch {
    Write-Host $_.ErrorDetails.Message -ForegroundColor Red
}

Write-Host "`n========== INVALID LOGIN ==========" -ForegroundColor Cyan

$badLoginBody = @{
    email = $email
    password = "WrongPassword"
} | ConvertTo-Json

try {
    Invoke-RestMethod `
        -Method POST `
        -Uri "$baseUrl/api/auth/login" `
        -ContentType "application/json" `
        -Body $badLoginBody
}
catch {
    Write-Host $_.ErrorDetails.Message -ForegroundColor Yellow
}

Write-Host "`n========== TEST COMPLETE ==========" -ForegroundColor Green