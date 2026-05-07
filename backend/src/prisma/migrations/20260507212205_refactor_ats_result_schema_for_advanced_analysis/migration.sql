/*
  Warnings:

  - You are about to drop the column `jobDescription` on the `ATSResult` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ATSAnalysisType" AS ENUM ('GENERIC', 'JD_MATCHED');

-- CreateEnum
CREATE TYPE "ATSStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "ATSResult" DROP COLUMN "jobDescription",
ADD COLUMN     "additionalDetailsScore" DOUBLE PRECISION,
ADD COLUMN     "analysisMode" "ATSAnalysisType" NOT NULL DEFAULT 'GENERIC',
ADD COLUMN     "detectedRole" TEXT,
ADD COLUMN     "experienceScore" DOUBLE PRECISION,
ADD COLUMN     "formatScore" DOUBLE PRECISION,
ADD COLUMN     "jobDescriptionText" TEXT,
ADD COLUMN     "keywordScore" DOUBLE PRECISION,
ADD COLUMN     "matchedKeywords" TEXT[],
ADD COLUMN     "missingKeywords" TEXT[],
ADD COLUMN     "projectScore" DOUBLE PRECISION,
ADD COLUMN     "skillsScore" DOUBLE PRECISION,
ADD COLUMN     "status" "ATSStatus" NOT NULL DEFAULT 'PENDING';
