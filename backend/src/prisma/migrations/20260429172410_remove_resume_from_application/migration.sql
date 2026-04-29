/*
  Warnings:

  - You are about to drop the column `resumeId` on the `Application` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_resumeId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "resumeId";
