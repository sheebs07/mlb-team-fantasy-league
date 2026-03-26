-- CreateTable
CREATE TABLE "LeagueSettings" (
    "id" SERIAL NOT NULL,
    "draftType" TEXT NOT NULL DEFAULT 'Snake',
    "rounds" INTEGER NOT NULL DEFAULT 5,
    "commissionerPassword" TEXT NOT NULL,

    CONSTRAINT "LeagueSettings_pkey" PRIMARY KEY ("id")
);
