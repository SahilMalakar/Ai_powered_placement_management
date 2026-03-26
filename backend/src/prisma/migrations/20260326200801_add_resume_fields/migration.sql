-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "toolsUsed" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "keyTools" TEXT,
ADD COLUMN     "secondaryLink" TEXT;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "degree" TEXT,
ADD COLUMN     "graduationYear" INTEGER,
ADD COLUMN     "university" TEXT;

-- CreateTable
CREATE TABLE "Achievement" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3),

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
