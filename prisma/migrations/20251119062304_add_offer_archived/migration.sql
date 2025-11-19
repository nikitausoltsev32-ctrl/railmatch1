-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Offer" (
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
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Offer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Offer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Offer" ("arrivalRegion", "arrivalStation", "availableFrom", "availableUntil", "cargoType", "companyId", "createdAt", "createdById", "departureRegion", "departureStation", "description", "id", "pricePerWagon", "updatedAt", "wagonCount", "wagonType") SELECT "arrivalRegion", "arrivalStation", "availableFrom", "availableUntil", "cargoType", "companyId", "createdAt", "createdById", "departureRegion", "departureStation", "description", "id", "pricePerWagon", "updatedAt", "wagonCount", "wagonType" FROM "Offer";
DROP TABLE "Offer";
ALTER TABLE "new_Offer" RENAME TO "Offer";
CREATE INDEX "Offer_wagonType_cargoType_idx" ON "Offer"("wagonType", "cargoType");
CREATE INDEX "Offer_departureRegion_arrivalRegion_idx" ON "Offer"("departureRegion", "arrivalRegion");
CREATE INDEX "Offer_availableFrom_availableUntil_idx" ON "Offer"("availableFrom", "availableUntil");
CREATE INDEX "Offer_companyId_idx" ON "Offer"("companyId");
CREATE INDEX "Offer_isArchived_idx" ON "Offer"("isArchived");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
