-- DropIndex
DROP INDEX "Owner_name_key";

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "draftSlot" INTEGER NOT NULL DEFAULT 1;
