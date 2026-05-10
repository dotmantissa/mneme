-- CreateEnum
CREATE TYPE "MemoryType" AS ENUM ('episodic', 'semantic', 'procedural', 'outcome');

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "type" "MemoryType" NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "embedding" vector(1536),
    "parentId" TEXT,
    "storageHash" TEXT,
    "txHash" TEXT,
    "signature" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_apiKey_key" ON "Agent"("apiKey");

-- CreateIndex
CREATE INDEX "Memory_agentId_idx" ON "Memory"("agentId");

-- CreateIndex
CREATE INDEX "Memory_parentId_idx" ON "Memory"("parentId");

-- CreateIndex
CREATE INDEX "Memory_createdAt_idx" ON "Memory"("createdAt");

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Memory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
