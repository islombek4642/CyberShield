# CyberShield Bir Martalik Ishga Tushirish Skripti (Windows PowerShell)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🛡️  CyberShield SOC Platformasi Ishga Tushirilmoqda... 🛡️" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Backendni yangi PowerShell oynasida ishga tushirish
Write-Host "[1/3] FastAPI Backend ishga tushirilmoqda (Port: 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

Start-Sleep -Seconds 2

# 2. Frontendni yangi PowerShell oynasida ishga tushirish
Write-Host "[2/3] React SOC Dashboard ishga tushirilmoqda (Port: 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev"

Start-Sleep -Seconds 3

# 3. Brauzerda ochish
Write-Host "[3/3] Brauzerda ochilmoqda: http://localhost:5173" -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "`n✅ Barcha xizmatlar muvaffaqiyatli ishga tushirildi!" -ForegroundColor Green
Write-Host "• Frontend Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host "• Swagger API Hujjatlari: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "• Sinov foydalanuvchisi: soc_admin / Password123!" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
