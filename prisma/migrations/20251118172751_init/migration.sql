-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "companyId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Company" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "inn" TEXT NOT NULL,
    "description" TEXT,
    "isOperator" BOOLEAN NOT NULL DEFAULT false,
    "isSeeker" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "wagonType" TEXT NOT NULL,
    "cargoType" TEXT NOT NULL,
    "wagonCount" INTEGER NOT NULL,
    "departureStation" TEXT NOT NULL,
    "departureRegion" TEXT NOT NULL,
    "arrivalStation" TEXT NOT NULL,
    "arrivalRegion" TEXT NOT NULL,
    "availableFrom" DATETIME NOT NULL,
    "availableUntil" DATETIME NOT NULL,
    "pricePerWagon" REAL NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Offer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Offer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Request" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "cargoType" TEXT NOT NULL,
    "wagonType" TEXT,
    "cargoWeight" REAL NOT NULL,
    "departureStation" TEXT NOT NULL,
    "departureRegion" TEXT NOT NULL,
    "arrivalStation" TEXT NOT NULL,
    "arrivalRegion" TEXT NOT NULL,
    "loadingDate" DATETIME NOT NULL,
    "requiredByDate" DATETIME NOT NULL,
    "maxPricePerWagon" REAL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Request_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Request_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "offerId" INTEGER NOT NULL,
    "requestId" INTEGER NOT NULL,
    "score" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Match_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Match_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Thread" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER,
    "requestId" INTEGER,
    "subject" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Thread_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Thread_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "threadId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DealStatusHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER,
    "requestId" INTEGER,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DealStatusHistory_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DealStatusHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalyticsSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "activeOffers" INTEGER NOT NULL DEFAULT 0,
    "activeRequests" INTEGER NOT NULL DEFAULT 0,
    "matchesCount" INTEGER NOT NULL DEFAULT 0,
    "dealsCompleted" INTEGER NOT NULL DEFAULT 0,
    "revenue" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_inn_key" ON "Company"("inn");

-- CreateIndex
CREATE INDEX "Company_isOperator_isSeeker_idx" ON "Company"("isOperator", "isSeeker");

-- CreateIndex
CREATE INDEX "Offer_wagonType_cargoType_idx" ON "Offer"("wagonType", "cargoType");

-- CreateIndex
CREATE INDEX "Offer_departureRegion_arrivalRegion_idx" ON "Offer"("departureRegion", "arrivalRegion");

-- CreateIndex
CREATE INDEX "Offer_availableFrom_availableUntil_idx" ON "Offer"("availableFrom", "availableUntil");

-- CreateIndex
CREATE INDEX "Offer_companyId_idx" ON "Offer"("companyId");

-- CreateIndex
CREATE INDEX "Request_cargoType_wagonType_idx" ON "Request"("cargoType", "wagonType");

-- CreateIndex
CREATE INDEX "Request_departureRegion_arrivalRegion_idx" ON "Request"("departureRegion", "arrivalRegion");

-- CreateIndex
CREATE INDEX "Request_loadingDate_requiredByDate_idx" ON "Request"("loadingDate", "requiredByDate");

-- CreateIndex
CREATE INDEX "Request_companyId_idx" ON "Request"("companyId");

-- CreateIndex
CREATE INDEX "Match_status_score_idx" ON "Match"("status", "score");

-- CreateIndex
CREATE UNIQUE INDEX "Match_offerId_requestId_key" ON "Match"("offerId", "requestId");

-- CreateIndex
CREATE INDEX "Thread_matchId_idx" ON "Thread"("matchId");

-- CreateIndex
CREATE INDEX "Thread_requestId_idx" ON "Thread"("requestId");

-- CreateIndex
CREATE INDEX "Message_threadId_createdAt_idx" ON "Message"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "DealStatusHistory_matchId_createdAt_idx" ON "DealStatusHistory"("matchId", "createdAt");

-- CreateIndex
CREATE INDEX "DealStatusHistory_requestId_createdAt_idx" ON "DealStatusHistory"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsSnapshot_companyId_date_idx" ON "AnalyticsSnapshot"("companyId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsSnapshot_companyId_date_key" ON "AnalyticsSnapshot"("companyId", "date");
