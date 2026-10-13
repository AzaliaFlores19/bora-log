-- CreateTable
CREATE TABLE "Password_Reset_Tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Password_Reset_Tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Password_Reset_Tokens_token_hash_key" ON "Password_Reset_Tokens"("token_hash");

-- CreateIndex
CREATE INDEX "Password_Reset_Tokens_user_id_idx" ON "Password_Reset_Tokens"("user_id");

-- CreateIndex
CREATE INDEX "Password_Reset_Tokens_expires_at_idx" ON "Password_Reset_Tokens"("expires_at");

-- AddForeignKey
ALTER TABLE "Password_Reset_Tokens" ADD CONSTRAINT "Password_Reset_Tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
