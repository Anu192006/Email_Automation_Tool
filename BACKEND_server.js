import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './BACKEND_authRoutes.js';
import dashboardRoutes from './BACKEND_dashboardRoutes.js';
import organizationRoutes from './BACKEND_organizationRoutes.js';
import recipientsRoutes from './BACKEND_recipientsRoutes.js';
import automationRoutes from './BACKEND_automationRoutes.js';
import templateRoutes from './BACKEND_templateRoutes.js';
import logsRoutes from './BACKEND_logsRoutes.js';
import { errorHandler } from './BACKEND_errorHandler.js';
import { config } from './BACKEND_env.js';

dotenv.config();

const app = express();
const PORT = config.port || 3001;

// ==================== MIDDLEWARE ====================

// CORS - Allow development ports (5173, 5174, 5175, 5176, 5177, etc.)
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else if (config.corsOrigin && origin === config.corsOrigin) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// ==================== DB TEST ROUTE ====================

app.get('/test-db', async (req, res) => {
  const { data, error } = await supabase
    .from('recipient_batches')
    .select('*');

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    data
  });
});

// Request logging (minimal, no sensitive data)
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ==================== ROUTES ====================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env
  });
});

// Test login endpoint
app.post('/test-login', (req, res) => {
  console.log('🟢 [TEST-LOGIN] Received request');
  console.log('🟢 [TEST-LOGIN] Body:', req.body);
  
  const { email, password } = req.body;
  
  if (email === 'admin@demo.com' && password === '12345678') {
    return res.json({ success: true, message: 'Test login works!' });
  }
  
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// API Routes (all prefixed with /api)
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/recipients', recipientsRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/logs', logsRoutes);

// ==================== ERROR HANDLERS ====================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler (must be last)
app.use((err, req, res, next) => {
  console.error('🔴 [ERROR]', err.message);
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== START SERVER ====================
import { sendMail } from './BACKEND_mailer.js';

// Catch all unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [UNHANDLED REJECTION]:', reason);
  console.error(reason.stack);
});

// Catch all uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ [UNCAUGHT EXCEPTION]:', error.message);
  console.error(error.stack);
});

app.get('/test-mail', async (req, res) => {
  try {
    await sendMail({
      to: process.env.EMAIL_USER, // same gmail for demo
      subject: 'Automated Email Test',
      html: `
        <h2>Hello 👋</h2>
        <p>This email was sent automatically using Gmail SMTP.</p>
        <p><b>Demo Successful ✅</b></p>
      `,
    });

    res.json({ success: true, message: 'Mail sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, config.host, () => {
  console.log('\n' + '='.repeat(70));
  console.log('✅ Automail Backend Server Started');
  console.log('='.repeat(70));
  console.log(`📡 Server:        http://${config.host}:${PORT}`);
  console.log(`🌐 CORS Origin:   All localhost ports (5173-5177+)`);
  console.log(`🔐 JWT Secret:    ${config.jwtSecret ? '✓ Configured' : '✗ MISSING'}`);
  console.log(`📦 Environment:   ${config.env}`);
  console.log(`📚 Database:      ${config.supabaseUrl ? '✓ Real Configured' : '✓ Mock Ready'}`);
  console.log('='.repeat(70));
  console.log('Available endpoints:');
  console.log('  POST   /api/auth/register       (public)');
  console.log('  POST   /api/auth/login          (public)');
  console.log('  POST   /api/auth/logout         (protected)');
  console.log('  GET    /api/auth/validate       (protected)');
  console.log('  GET    /api/dashboard/stats     (protected)');
  console.log('  GET    /api/logs/audit          (protected)');
  console.log('='.repeat(70));
  console.log('🧪 Health check: curl http://localhost:' + PORT + '/health\n');
});

export default app;
