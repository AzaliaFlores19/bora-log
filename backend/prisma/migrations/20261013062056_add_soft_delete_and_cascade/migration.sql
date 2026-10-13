-- DropForeignKey
ALTER TABLE "Password_Reset_Tokens" DROP CONSTRAINT "Password_Reset_Tokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserShow" DROP CONSTRAINT "UserShow_show_id_fkey";

-- DropForeignKey
ALTER TABLE "UserShow" DROP CONSTRAINT "UserShow_user_id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserShow" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "UserShow_deletedAt_idx" ON "UserShow"("deletedAt");

-- AddForeignKey
ALTER TABLE "Password_Reset_Tokens" ADD CONSTRAINT "Password_Reset_Tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShow" ADD CONSTRAINT "UserShow_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShow" ADD CONSTRAINT "UserShow_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
