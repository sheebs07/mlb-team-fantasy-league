-- CreateTable
CREATE TABLE "MlbSyncMeta" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MlbSyncMeta_pkey" PRIMARY KEY ("id")
);
