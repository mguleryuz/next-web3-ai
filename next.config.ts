import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize packages that have version conflicts with mongodb-memory-server
  // This prevents Next.js from bundling these and resolves version mismatch warnings
  serverExternalPackages: [
    "mongodb-memory-server",
    "mongodb-memory-server-core",
    "mongodb",
    "bson",
    "mongodb-connection-string-url",
    "mongoose",
  ],
};

export default nextConfig;
