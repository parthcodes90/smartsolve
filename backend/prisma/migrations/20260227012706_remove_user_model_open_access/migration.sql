/*
  Warnings:

  - You are about to drop the column `userId` on the `complaints` table. All the data in the column will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "complaints" DROP CONSTRAINT "complaints_userId_fkey";

-- AlterTable
ALTER TABLE "complaints" DROP COLUMN "userId",
ADD COLUMN     "citizenEmail" TEXT,
ADD COLUMN     "citizenName" TEXT,
ADD COLUMN     "citizenPhone" TEXT;

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "Role";
