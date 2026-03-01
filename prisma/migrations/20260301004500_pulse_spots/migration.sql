-- Add columns missing from initial migration but present in schema
ALTER TABLE "User" ADD COLUMN "avatar" TEXT;
ALTER TABLE "Assessment" ADD COLUMN "dueDate" DATETIME;

-- CreateTable
CREATE TABLE "StudySpot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "floor" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "activeGroups" INTEGER NOT NULL,
    "topSkills" TEXT NOT NULL,
    "noiseLevel" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SpotCheckIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spotId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedOutAt" DATETIME,
    CONSTRAINT "SpotCheckIn_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "StudySpot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PulseCheckIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleCode" TEXT NOT NULL,
    "moduleName" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "SpotCheckIn_spotId_checkedOutAt_idx" ON "SpotCheckIn"("spotId", "checkedOutAt");

-- CreateIndex
CREATE INDEX "SpotCheckIn_clientId_checkedOutAt_idx" ON "SpotCheckIn"("clientId", "checkedOutAt");

-- CreateIndex
CREATE UNIQUE INDEX "PulseCheckIn_moduleCode_clientId_key" ON "PulseCheckIn"("moduleCode", "clientId");

-- CreateIndex
CREATE INDEX "PulseCheckIn_moduleCode_idx" ON "PulseCheckIn"("moduleCode");

-- CreateIndex
CREATE INDEX "PulseCheckIn_createdAt_idx" ON "PulseCheckIn"("createdAt");
