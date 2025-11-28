import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const MONGODB_URI = process.env.MONGODB_URI;
const isDevelopment = process.env.NODE_ENV === "development";

// Fixed port for development MongoDB Memory Server
const DEV_MONGODB_PORT = 27018;
const DEV_MONGODB_URI = `mongodb://127.0.0.1:${DEV_MONGODB_PORT}/`;

// Cache path relative to project root
const CACHE_PATH = path.join(process.cwd(), ".cache", "db");
const LOCK_FILE_PATH = path.join(CACHE_PATH, "mongod.lock");

// Store memory server instance for reuse
let mongoMemoryServer: import("mongodb-memory-server").MongoMemoryServer | null =
  null;

/**
 * Ensures the cache directory exists, creating it if necessary
 */
function ensureCacheDirectory(): void {
  if (!fs.existsSync(CACHE_PATH)) {
    fs.mkdirSync(CACHE_PATH, { recursive: true });
    console.log(`Created MongoDB cache directory: ${CACHE_PATH}`);
  }
}

/**
 * Cleans up stale MongoDB lock file if it exists
 * This can happen if the server wasn't properly shut down
 */
function cleanupStaleLockFile(): void {
  if (fs.existsSync(LOCK_FILE_PATH)) {
    try {
      // Read the lock file to check if it contains a PID
      const lockContent = fs.readFileSync(LOCK_FILE_PATH, "utf-8").trim();
      
      if (lockContent) {
        // Check if the process is still running
        try {
          // Sending signal 0 doesn't kill the process, just checks if it exists
          process.kill(parseInt(lockContent, 10), 0);
          // Process exists - don't remove the lock file
          console.log(`MongoDB process ${lockContent} is still running`);
          return;
        } catch {
          // Process doesn't exist - safe to remove lock file
          console.log(`Removing stale MongoDB lock file (PID ${lockContent} not running)`);
        }
      }
      
      fs.unlinkSync(LOCK_FILE_PATH);
      console.log("Cleaned up stale MongoDB lock file");
    } catch (err) {
      console.warn("Could not clean up lock file:", err);
    }
  }
}

/**
 * Gets or creates a MongoDB Memory Server instance for development
 */
async function getMemoryServer(): Promise<
  import("mongodb-memory-server").MongoMemoryServer
> {
  if (mongoMemoryServer) {
    return mongoMemoryServer;
  }

  // Dynamically import to avoid bundling in production
  const { MongoMemoryServer } = await import("mongodb-memory-server");

  ensureCacheDirectory();
  cleanupStaleLockFile();

  mongoMemoryServer = await MongoMemoryServer.create({
    instance: {
      port: DEV_MONGODB_PORT,
      ip: "127.0.0.1",
      dbPath: CACHE_PATH,
      storageEngine: "wiredTiger",
    },
    binary: {
      // Cache the MongoDB binary in the same .cache folder
      downloadDir: path.join(process.cwd(), ".cache", "mongodb-binaries"),
    },
  });

  console.log(`MongoDB Memory Server started at: ${DEV_MONGODB_URI}`);
  console.log(`Data persisted at: ${CACHE_PATH}`);

  return mongoMemoryServer;
}

/**
 * Connects to MongoDB
 * - Development: Uses in-memory server with local file cache at mongodb://127.0.0.1:27018/
 * - Production: Uses MONGODB_URI environment variable
 */
async function dbConnect(): Promise<typeof mongoose> {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  let uri: string;

  if (isDevelopment) {
    await getMemoryServer();
    uri = DEV_MONGODB_URI;
  } else {
    if (!MONGODB_URI) {
      throw new Error("Please define the MONGODB_URI environment variable");
    }
    uri = MONGODB_URI;
  }

  await mongoose.connect(uri);
  return mongoose;
}

/**
 * Disconnects from MongoDB and stops the memory server if in development
 */
async function dbDisconnect(): Promise<void> {
  await mongoose.disconnect();

  if (isDevelopment && mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
    console.log("MongoDB Memory Server stopped");
  }
}

export default dbConnect;
export { dbConnect, dbDisconnect, ensureCacheDirectory, DEV_MONGODB_URI };
