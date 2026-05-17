-- CreateTable
CREATE TABLE "NotificationMessage" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "branches" "Branch"[],
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotificationMessage" ADD CONSTRAINT "NotificationMessage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
