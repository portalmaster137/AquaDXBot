import mysql, { PoolConnection, Pool, QueryOptions, FieldInfo, MysqlError, OkPacket } from 'mysql';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection configuration - optimized for MariaDB
const dbConfig = {
  host: process.env.DB_HOST, // Changed default to 'db' to match docker service name
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4' // Ensure proper UTF-8 support for emojis
};

// Whitelist of valid table names - critical security measure
const VALID_TABLES = ['reactionRoles', 'users', 'guilds'];

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Initialize database tables immediately on module import
export async function initDatabase() {
  try {
    await initializeDatabase();
  } catch (err) {
    console.error('Failed to initialize database tables:', err);
    throw err;
  }
}

// Helper function to execute queries
export async function query(sql: string, params?: any[]) {
  try {
    const results = await new Promise<any[]>((resolve, reject) => {
      pool.query(sql, params, (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Secure database wrapper with table name validation
export const db = {
  collection: (tableName: string) => {
    // Security check: Only allow whitelisted table names
    if (!VALID_TABLES.includes(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`);
    }
    
    // MySQL identifiers should be escaped to prevent injection
    // Even with a whitelist, this is a good practice
    const table = pool.escapeId(tableName);
    
    return {
      find: async (filter: Record<string, any> = {}) => {
        let whereClause = '';
        const params: any[] = [];
        
        if (Object.keys(filter).length > 0) {
          const conditions = Object.entries(filter).map(([key, value]) => {
            // Escape column names too
            const escapedKey = pool.escapeId(key);
            params.push(value);
            return `${escapedKey} = ?`;
          });
          whereClause = `WHERE ${conditions.join(' AND ')}`;
        }
        
        // Table name is now properly escaped
        const sql = `SELECT * FROM ${table} ${whereClause}`;
        return {
          toArray: async () => await query(sql, params)
        };
      },
      
      findOne: async (filter: Record<string, any> = {}) => {
        let whereClause = '';
        const params: any[] = [];
        
        if (Object.keys(filter).length > 0) {
          const conditions = Object.entries(filter).map(([key, value]) => {
            const escapedKey = pool.escapeId(key);
            params.push(value);
            return `${escapedKey} = ?`;
          });
          whereClause = `WHERE ${conditions.join(' AND ')}`;
        }
        
        const sql = `SELECT * FROM ${table} ${whereClause} LIMIT 1`;
        const results = await query(sql, params);
        return Array.isArray(results) && results.length > 0 ? results[0] : null;
      },
      
      insertOne: async (document: Record<string, any>) => {
        const keys = Object.keys(document);
        const escapedKeys = keys.map(key => pool.escapeId(key));
        const placeholders = keys.map(() => '?').join(', ');
        const values = Object.values(document);
        
        const sql = `INSERT INTO ${table} (${escapedKeys.join(', ')}) VALUES (${placeholders})`;
        const result = await query(sql, values) as any;
        
        return {
          insertedId: result.insertId,
          acknowledged: true,
          insertedCount: result.affectedRows
        };
      },
      
      updateOne: async (filter: Record<string, any>, update: Record<string, any>) => {
        const whereConditions = Object.entries(filter).map(([key]) => `${pool.escapeId(key)} = ?`);
        const whereParams = Object.values(filter);
        
        const setEntries = Object.entries(update.$set || update);
        const setClauses = setEntries.map(([key]) => `${pool.escapeId(key)} = ?`);
        const setParams = setEntries.map(([, value]) => value);
        
        const sql = `UPDATE ${table} SET ${setClauses.join(', ')} WHERE ${whereConditions.join(' AND ')}`;
        const result = await query(sql, [...setParams, ...whereParams]) as unknown as OkPacket;
        
        return {
          acknowledged: true,
          modifiedCount: result.affectedRows,
          matchedCount: result.affectedRows
        };
      },
      
      deleteOne: async (filter: Record<string, any>) => {
        const whereConditions = Object.entries(filter).map(([key]) => `${pool.escapeId(key)} = ?`);
        const whereParams = Object.values(filter);
        
        const sql = `DELETE FROM ${table} WHERE ${whereConditions.join(' AND ')} LIMIT 1`;
        const result = await query(sql, whereParams) as unknown as OkPacket;
        
        return {
          acknowledged: true,
          deletedCount: result.affectedRows
        };
      }
    };
  }
};

// Initialize database by creating tables if they don't exist
export async function initializeDatabase() {
  console.log('Initializing database...');
  
  // Create reaction roles table with proper character set for emoji support
  await query(`
    CREATE TABLE IF NOT EXISTS reactionRoles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      messageId VARCHAR(255) NOT NULL,
      roleId VARCHAR(255) NOT NULL,
      reaction VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_reaction_role (messageId, roleId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  
  console.log('Database initialized successfully');
}

// Function to test database connection
export async function testConnection() {
  return new Promise<boolean>((resolve) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Database connection failed:', err);
        resolve(false);
        return;
      }
      console.log('Database connection successful');
      connection.release();
      resolve(true);
    });
  });
}

// Function to close database connections
export async function closeDatabase() {
  return new Promise<void>((resolve, reject) => {
    pool.end((err) => {
      if (err) {
        console.error('Error closing database connections:', err);
        reject(err);
        return;
      }
      console.log('Database connections closed');
      resolve();
    });
  });
}