-- AlterTable
ALTER TABLE "StudentProfile" ALTER COLUMN "astuRollNo" DROP NOT NULL,
ALTER COLUMN "backlog" DROP NOT NULL,
ALTER COLUMN "backlog" SET DEFAULT false,
ALTER COLUMN "backlogSubjects" SET DEFAULT ARRAY[]::TEXT[];
