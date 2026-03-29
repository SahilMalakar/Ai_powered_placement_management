/*
  Warnings:

  - You are about to drop the column `jobDesc` on the `ATSResult` table. All the data in the column will be lost.
  - The `description` column on the `Experience` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `techStack` on the `Project` table. All the data in the column will be lost.
  - The `description` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `name` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the `Achievement` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `category` on table `Skill` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "Branch" ADD VALUE 'MCA';

-- DropForeignKey
ALTER TABLE "Achievement" DROP CONSTRAINT "Achievement_profileId_fkey";

-- AlterTable
ALTER TABLE "ATSResult" DROP COLUMN "jobDesc",
ADD COLUMN     "jobDescription" TEXT;

-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "description",
ADD COLUMN     "description" TEXT[];

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "techStack",
DROP COLUMN "description",
ADD COLUMN     "description" TEXT[];

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "name",
ADD COLUMN     "skills" TEXT[],
ALTER COLUMN "category" SET NOT NULL;

-- DropTable
DROP TABLE "Achievement";

-- CreateTable
CREATE TABLE "AdditionalDetail" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT[],
    "date" TIMESTAMP(3),

    CONSTRAINT "AdditionalDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdditionalDetail" ADD CONSTRAINT "AdditionalDetail_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
