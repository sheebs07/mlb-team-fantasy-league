-- CreateTable
CREATE TABLE "Owner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MlbTeam" (
    "id" SERIAL NOT NULL,
    "mlbId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "division" TEXT NOT NULL,

    CONSTRAINT "MlbTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraftPick" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "mlbTeamId" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "pickNumber" INTEGER NOT NULL,

    CONSTRAINT "DraftPick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MlbStanding" (
    "id" SERIAL NOT NULL,
    "mlbTeamId" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "pct" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MlbStanding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Owner_name_key" ON "Owner"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MlbTeam_mlbId_key" ON "MlbTeam"("mlbId");

-- CreateIndex
CREATE UNIQUE INDEX "MlbStanding_mlbTeamId_key" ON "MlbStanding"("mlbTeamId");

-- AddForeignKey
ALTER TABLE "DraftPick" ADD CONSTRAINT "DraftPick_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftPick" ADD CONSTRAINT "DraftPick_mlbTeamId_fkey" FOREIGN KEY ("mlbTeamId") REFERENCES "MlbTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MlbStanding" ADD CONSTRAINT "MlbStanding_mlbTeamId_fkey" FOREIGN KEY ("mlbTeamId") REFERENCES "MlbTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
