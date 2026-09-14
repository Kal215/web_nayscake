-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "orderType" TEXT,
ADD COLUMN     "pickupAt" TIMESTAMP(3),
ADD COLUMN     "pickupRaw" TEXT;
