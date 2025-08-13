import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.NODE_ENV === 'test' 
    ? (process.env.DB_NAME + '_test') 
    : process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false
};

export const pool = new Pool(dbConfig);

// Test database connection
pool.on('connect', () => {
  console.log(`Connected to PostgreSQL database: ${dbConfig.database}`);
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
  process.exit(-1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down database connections...');
  await pool.end();
  process.exit(0);
});

export default pool;