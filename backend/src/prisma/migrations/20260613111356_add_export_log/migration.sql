-- CreateTable
CREATE TABLE "ExportLog" (
    "id" SERIAL NOT NULL,
    "exportedBy" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "selectedIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExportLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExportLog_exportedBy_idx" ON "ExportLog"("exportedBy");

-- AddForeignKey
ALTER TABLE "ExportLog" ADD CONSTRAINT "ExportLog_exportedBy_fkey" FOREIGN KEY ("exportedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
