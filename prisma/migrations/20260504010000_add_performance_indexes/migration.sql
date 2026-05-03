-- Add indexes for the production read paths used by lists, profiles, bookmarks, and comments.
CREATE INDEX "Post_updatedAt_id_idx" ON "Post"("updatedAt", "id");
CREATE INDEX "Post_userId_updatedAt_id_idx" ON "Post"("userId", "updatedAt", "id");
CREATE INDEX "Post_textbookId_idx" ON "Post"("textbookId");
CREATE INDEX "Post_level_idx" ON "Post"("level");
CREATE INDEX "Post_downloadCount_updatedAt_id_idx" ON "Post"("downloadCount", "updatedAt", "id");
CREATE INDEX "Bookmark_postId_idx" ON "Bookmark"("postId");
CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");
CREATE INDEX "User_role_updatedAt_id_idx" ON "User"("role", "updatedAt", "id");
