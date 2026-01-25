#!/bin/bash
# Quick setup script for automail-backend
# Run from C:\Users\sanu2\Desktop

mkdir -p automail-backend/src/{config,routes,controllers,middleware,utils,db}
cd automail-backend

# Create package.json
cat > package.json << 'EOF'
{
  "name": "automail-backend",
  "version": "1.0.0",
  "description": "Secure Email Automation Platform - Backend API",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "dev": "node src/server.js",
    "start": "NODE_ENV=production node src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "jsonwebtoken": "^9.1.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "uuid": "^9.0.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Create .env
cat > .env << 'EOF'
NODE_ENV=development
PORT=3000
JWT_SECRET=your_super_secret_key_min_32_chars_long_here_12345
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
EOF

echo "✅ Backend directory structure created!"
echo "📦 Run: npm install"
echo "🚀 Then: npm run dev"
