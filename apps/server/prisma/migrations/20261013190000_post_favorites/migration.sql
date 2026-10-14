-- CreateTable
CREATE TABLE "PostFavorite" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "PostFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostFavorite_userId_idx" ON "PostFavorite"("userId");

-- CreateIndex
CREATE INDEX "PostFavorite_postId_idx" ON "PostFavorite"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PostFavorite_userId_postId_key" ON "PostFavorite"("userId", "postId");

-- AddForeignKey
ALTER TABLE "PostFavorite" ADD CONSTRAINT "PostFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostFavorite" ADD CONSTRAINT "PostFavorite_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
