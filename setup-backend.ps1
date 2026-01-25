# PowerShell script to set up automail-backend
# Run from: C:\Users\sanu2\Desktop

# Navigate to Desktop
cd "C:\Users\sanu2\Desktop"

# Create directory structure
Write-Host "📁 Creating backend directory structure..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "automail-backend/src/config" > $null
New-Item -ItemType Directory -Force -Path "automail-backend/src/routes" > $null
New-Item -ItemType Directory -Force -Path "automail-backend/src/controllers" > $null
New-Item -ItemType Directory -Force -Path "automail-backend/src/middleware" > $null
New-Item -ItemType Directory -Force -Path "automail-backend/src/utils" > $null
New-Item -ItemType Directory -Force -Path "automail-backend/src/db" > $null

cd "automail-backend"

# package.json
Write-Host "📝 Creating package.json..." -ForegroundColor Cyan
$packageJson = @{
    name = "automail-backend"
    version = "1.0.0"
    description = "Secure Email Automation Platform - Backend API"
    type = "module"
    main = "src/server.js"
    scripts = @{
        dev = "node src/server.js"
        start = "NODE_ENV=production node src/server.js"
    }
    dependencies = @{
        "express" = "^4.18.2"
        "jsonwebtoken" = "^9.1.2"
        "bcryptjs" = "^2.4.3"
        "cors" = "^2.8.5"
        "dotenv" = "^16.3.1"
        "uuid" = "^9.0.1"
    }
    engines = @{
        node = ">=18.0.0"
    }
} | ConvertTo-Json | Out-File -FilePath "package.json" -Encoding utf8

# .env
Write-Host "🔐 Creating .env file..." -ForegroundColor Cyan
@'
NODE_ENV=development
PORT=3000
JWT_SECRET=your_super_secret_key_min_32_chars_long_here_12345
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
'@ | Out-File -FilePath ".env" -Encoding utf8

# .gitignore
Write-Host "🚫 Creating .gitignore..." -ForegroundColor Cyan
@'
node_modules/
.env
.env.local
.DS_Store
*.log
dist/
build/
'@ | Out-File -FilePath ".gitignore" -Encoding utf8

Write-Host "`n✅ Backend structure created!" -ForegroundColor Green
Write-Host "📦 Next: npm install" -ForegroundColor Cyan
Write-Host "🚀 Then: npm run dev`n" -ForegroundColor Cyan
