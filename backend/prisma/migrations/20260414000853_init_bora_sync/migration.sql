-- CreateEnum
CREATE TYPE "Status" AS ENUM ('watching', 'completed', 'plan_to_watch', 'dropped');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('happy', 'sad', 'romantic', 'chill', 'excited', 'nerdy', 'mad', 'stressed', 'bored', 'lonely', 'energetic', 'tragic', 'tense');

-- CreateEnum
CREATE TYPE "Time_Commit" AS ENUM ('around_30_min', 'between_1_and_3_hours', 'binge');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Show" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mediaType" TEXT NOT NULL,
    "imageUrl" TEXT,
    "duration" INTEGER,
    "totalEpisodes" INTEGER,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserShow" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "show_id" TEXT NOT NULL,
    "time_commit" "Time_Commit",
    "status" "Status",
    "rating" INTEGER,
    "mood" "Mood"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserShow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Show_external_id_key" ON "Show"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "Show_external_id_mediaType_key" ON "Show"("external_id", "mediaType");

-- CreateIndex
CREATE UNIQUE INDEX "UserShow_user_id_show_id_key" ON "UserShow"("user_id", "show_id");

-- AddForeignKey
ALTER TABLE "UserShow" ADD CONSTRAINT "UserShow_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShow" ADD CONSTRAINT "UserShow_show_id_fkey" FOREIGN KEY ("show_id") REFERENCES "Show"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
