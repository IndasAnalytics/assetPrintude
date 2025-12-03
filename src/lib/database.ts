import sql from "mssql";


// Log environment variables (without passwords)
console.log("🔧 Database Configuration:");
console.log("  DB_USER:", process.env.DB_USER || "(not set)");
console.log("  DB_SERVER:", process.env.DB_SERVER || "(not set)");
console.log("  DB_NAME:", process.env.DB_NAME || "(not set)");
console.log("  DB_ENCRYPT:", process.env.DB_ENCRYPT || "(not set)");
console.log("  DB_PASSWORD:", process.env.DB_PASSWORD ? "***SET***" : "(not set)");

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || "",
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

/**
 * Get database connection pool
 * Reuses existing connection or creates new one
 */
export async function getConnection(): Promise<sql.ConnectionPool> {
  try {
    console.log("📡 Attempting database connection...");
    console.log("  Server:", config.server);
    console.log("  Database:", config.database);
    console.log("  User:", config.user);
    console.log("  Encrypt:", config.options?.encrypt);

    if (pool && pool.connected) {
      console.log("♻️  Reusing existing connection pool");
      return pool;
    }

    if (!config.server || !config.database || !config.user) {
      console.error("❌ Missing required database configuration!");
      console.error("  Required: DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD");
      throw new Error("Missing required database configuration");
    }

    console.log("🔌 Creating new connection pool...");
    pool = await sql.connect(config);
    console.log("✅ Database connected successfully!");
    return pool;
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error("  Error:", error);
    if (error instanceof Error) {
      console.error("  Message:", error.message);
      console.error("  Stack:", error.stack);
    }
    throw new Error("Database connection failed");
  }
}

/**
 * Execute a SQL query with parameters
 */
export async function executeQuery<T = unknown>(
  query: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  try {
    console.log("📝 Executing query:");
    console.log("  Query:", query.substring(0, 100) + (query.length > 100 ? "..." : ""));
    console.log("  Params:", params ? Object.keys(params).join(", ") : "none");

    const connection = await getConnection();
    const request = connection.request();

    // Add parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        console.log(`  @${key}:`, typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + "..." : value);
        request.input(key, value);
      });
    }

    const result = await request.query(query);

    // Some queries (UPDATE, DELETE without OUTPUT) don't return recordsets
    if (result.recordset) {
      console.log(`✅ Query executed successfully, returned ${result.recordset.length} rows`);
      return result.recordset as T[];
    } else {
      console.log(`✅ Query executed successfully, affected ${result.rowsAffected[0]} rows`);
      return [] as T[];
    }
  } catch (error) {
    console.error("❌ Query execution error:");
    console.error("  Query:", query);
    console.error("  Params:", params);
    console.error("  Error:", error);
    if (error instanceof Error) {
      console.error("  Error Message:", error.message);
      console.error("  Error Name:", error.name);
      console.error("  Error Stack:", error.stack);
    }
    // Log SQL-specific error details if available
    if (error && typeof error === 'object' && 'number' in error) {
      const sqlError = error as any;
      console.error("  SQL Error Details:");
      console.error("    Number:", sqlError.number);
      console.error("    State:", sqlError.state);
      console.error("    Class:", sqlError.class);
      console.error("    LineNumber:", sqlError.lineNumber);
      console.error("    ServerName:", sqlError.serverName);
      console.error("    ProcName:", sqlError.procName);
    }
    throw error;
  }
}

/**
 * Execute a SQL query and return a single record
 */
export async function executeQuerySingle<T = unknown>(
  query: string,
  params?: Record<string, unknown>
): Promise<T | null> {
  console.log("🔍 Executing single-record query");
  const results = await executeQuery<T>(query, params);
  const result = results.length > 0 ? results[0] : null;
  console.log("  Result:", result ? "Found 1 record" : "No records found");
  return result;
}

/**
 * Execute a stored procedure
 */
export async function executeProcedure<T = unknown>(
  procedureName: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  try {
    const connection = await getConnection();
    const request = connection.request();

    // Add parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        request.input(key, value);
      });
    }

    const result = await request.execute(procedureName);
    return result.recordset as T[];
  } catch (error) {
    console.error("Stored procedure execution error:", error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeConnection(): Promise<void> {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log("Database connection closed");
    }
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getConnection();
    await connection.request().query("SELECT 1 AS test");
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}

// Handle process termination
if (typeof process !== "undefined") {
  process.on("SIGINT", async () => {
    await closeConnection();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await closeConnection();
    process.exit(0);
  });
}
