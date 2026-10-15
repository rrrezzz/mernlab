const fs = require("fs");
const path = require("path");
const { MongoMemoryServer } = require("mongodb-memory-server");

// The Windows app sandbox can prevent WiredTiger from renaming files in the
// system temp folder. Keep temporary database files inside this writable project
// directory instead, and ignore the directory in Git.
const memoryRoot = path.resolve(__dirname, "..", ".mongo-memory");

const createMemoryMongoServer = async () => {
  fs.mkdirSync(memoryRoot, { recursive: true });
  const dbPath = fs.mkdtempSync(path.join(memoryRoot, "db-"));

  return MongoMemoryServer.create({
    instance: {
      dbPath,
      storageEngine: "wiredTiger",
      launchTimeout: 60_000,
    },
  });
};

const stopMemoryMongoServer = async (server) => {
  const dbPath = server.instanceInfo?.dbPath;
  await server.stop();

  if (dbPath && dbPath.startsWith(memoryRoot)) {
    fs.rmSync(dbPath, { recursive: true, force: true });
  }
};

module.exports = { createMemoryMongoServer, stopMemoryMongoServer };
