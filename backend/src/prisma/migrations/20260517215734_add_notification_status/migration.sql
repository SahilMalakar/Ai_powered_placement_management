-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'PROCESSING', 'FAILED');

-- AlterTable
ALTER TABLE "NotificationMessage" ADD COLUMN     "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED';
