-- CreateEnum
CREATE TYPE "ResumeStatus" AS ENUM ('GENERATING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "status" "ResumeStatus" NOT NULL DEFAULT 'GENERATING';
