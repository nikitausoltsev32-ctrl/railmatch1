-- AlterTable
ALTER TABLE "Message" ADD COLUMN "attachments" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Thread" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER,
    "requestId" INTEGER,
    "operatorId" INTEGER,
    "seekerId" INTEGER,
    "subject" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastReadAt" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Thread_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Thread_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Thread_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Thread_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Thread" ("createdAt", "id", "isActive", "matchId", "requestId", "subject", "updatedAt") SELECT "createdAt", "id", "isActive", "matchId", "requestId", "subject", "updatedAt" FROM "Thread";
DROP TABLE "Thread";
ALTER TABLE "new_Thread" RENAME TO "Thread";
CREATE INDEX "Thread_matchId_idx" ON "Thread"("matchId");
CREATE INDEX "Thread_requestId_idx" ON "Thread"("requestId");
CREATE INDEX "Thread_operatorId_idx" ON "Thread"("operatorId");
CREATE INDEX "Thread_seekerId_idx" ON "Thread"("seekerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
