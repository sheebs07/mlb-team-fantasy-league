/*
  Warnings:

  - You are about to drop the `LeagueSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "LeagueSettings";

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "draftType" TEXT NOT NULL DEFAULT 'Snake',
    "rounds" INTEGER NOT NULL DEFAULT 5,
    "commissionerPassword" TEXT NOT NULL,
    "pickClockSeconds" INTEGER NOT NULL DEFAULT 60,
    "warningSeconds" INTEGER NOT NULL DEFAULT 15,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
