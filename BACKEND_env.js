export const config = {
  // Basic Configuration
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  host: process.env.HOST || '0.0.0.0',
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'change-this-in-production-key-min-32-chars',
  jwtExpiry: process.env.JWT_EXPIRY || '24h',
  
  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Supabase Configuration
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Supabase Database (PostgreSQL)
  supabaseDbUrl: process.env.SUPABASE_DB_URL,
  supabaseDbUser: process.env.SUPABASE_DB_USER || 'postgres',
  supabaseDbPassword: process.env.SUPABASE_DB_PASSWORD,
  
  // Email Service (SendGrid)
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL,
  
  // AWS S3 Configuration
  awsRegion: process.env.AWS_REGION,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsS3Bucket: process.env.AWS_S3_BUCKET,
  
  // Logging Configuration
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'logs/backend.log',
  
  // Security Settings
  rateLimitWindow: process.env.RATE_LIMIT_WINDOW || 15,
  rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  sessionSecret: process.env.SESSION_SECRET,
  
  // Admin Configuration
  adminEmail: process.env.ADMIN_EMAIL,
  supportEmail: process.env.SUPPORT_EMAIL,
  
  // Application Settings
  appName: process.env.APP_NAME || 'AutoMail',
  appVersion: process.env.APP_VERSION || '1.0.0',
  
  // Feature Flags
  enableBlockchain: process.env.ENABLE_BLOCKCHAIN === 'true',
  enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false',
  enableAuditLogging: process.env.ENABLE_AUDIT_LOGGING !== 'false',
  
  // Blockchain Configuration
  blockchainNetwork: process.env.BLOCKCHAIN_NETWORK,
  blockchainRpcUrl: process.env.BLOCKCHAIN_RPC_URL,

  // Environment Flags
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Validation Methods
  validateSupabase: function() {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error('Supabase configuration missing: SUPABASE_URL and SUPABASE_ANON_KEY required');
    }
    return true;
  },
  
  validateDatabase: function() {
    if (!this.supabaseDbUrl) {
      throw new Error('Database configuration missing: SUPABASE_DB_URL required');
    }
    return true;
  },
  
  validateEmailService: function() {
    if (!this.sendgridApiKey || !this.sendgridFromEmail) {
      console.warn('SendGrid configuration incomplete - email notifications disabled');
      return false;
    }
    return true;
  },
  
  getSupabaseConfig: function() {
    return {
      url: this.supabaseUrl,
      anonKey: this.supabaseAnonKey,
      serviceRoleKey: this.supabaseServiceRoleKey
    };
  },
  
  getDatabaseConfig: function() {
    return {
      url: this.supabaseDbUrl,
      user: this.supabaseDbUser,
      password: this.supabaseDbPassword
    };
  }
};

export default config;
