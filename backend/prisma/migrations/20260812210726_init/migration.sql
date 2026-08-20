-- CreateEnum
CREATE TYPE "RepositoryStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "CodeReviewSeverity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DocumentationType" AS ENUM ('README', 'MODULE', 'FUNCTION', 'API', 'ARCHITECTURE');

-- CreateEnum
CREATE TYPE "GeneratedTestStatus" AS ENUM ('GENERATED', 'REVIEWED', 'APPROVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "githubRepoId" TEXT,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "size" INTEGER,
    "status" "RepositoryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepositoryFile" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "language" TEXT,
    "size" INTEGER,
    "contentHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepositoryFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeChunk" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "startLine" INTEGER,
    "endLine" INTEGER,
    "chunkIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeReviewFinding" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "filePath" TEXT,
    "severity" "CodeReviewSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "suggestion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeReviewFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documentation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "type" "DocumentationType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedTest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "filePath" TEXT,
    "testCode" TEXT NOT NULL,
    "status" "GeneratedTestStatus" NOT NULL DEFAULT 'GENERATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Repository_userId_idx" ON "Repository"("userId");

-- CreateIndex
CREATE INDEX "Repository_status_idx" ON "Repository"("status");

-- CreateIndex
CREATE INDEX "Repository_githubRepoId_idx" ON "Repository"("githubRepoId");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_userId_url_key" ON "Repository"("userId", "url");

-- CreateIndex
CREATE INDEX "RepositoryFile_repositoryId_idx" ON "RepositoryFile"("repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "RepositoryFile_repositoryId_path_key" ON "RepositoryFile"("repositoryId", "path");

-- CreateIndex
CREATE INDEX "ChatSession_userId_idx" ON "ChatSession"("userId");

-- CreateIndex
CREATE INDEX "ChatSession_repositoryId_idx" ON "ChatSession"("repositoryId");

-- CreateIndex
CREATE INDEX "ChatMessage_sessionId_createdAt_idx" ON "ChatMessage"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "CodeChunk_repositoryId_idx" ON "CodeChunk"("repositoryId");

-- CreateIndex
CREATE INDEX "CodeChunk_fileId_idx" ON "CodeChunk"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeChunk_fileId_chunkIndex_key" ON "CodeChunk"("fileId", "chunkIndex");

-- CreateIndex
CREATE INDEX "CodeReview_userId_idx" ON "CodeReview"("userId");

-- CreateIndex
CREATE INDEX "CodeReview_repositoryId_idx" ON "CodeReview"("repositoryId");

-- CreateIndex
CREATE INDEX "CodeReview_status_idx" ON "CodeReview"("status");

-- CreateIndex
CREATE INDEX "CodeReviewFinding_reviewId_idx" ON "CodeReviewFinding"("reviewId");

-- CreateIndex
CREATE INDEX "CodeReviewFinding_severity_idx" ON "CodeReviewFinding"("severity");

-- CreateIndex
CREATE INDEX "Documentation_userId_idx" ON "Documentation"("userId");

-- CreateIndex
CREATE INDEX "Documentation_repositoryId_idx" ON "Documentation"("repositoryId");

-- CreateIndex
CREATE INDEX "Documentation_type_idx" ON "Documentation"("type");

-- CreateIndex
CREATE INDEX "GeneratedTest_userId_idx" ON "GeneratedTest"("userId");

-- CreateIndex
CREATE INDEX "GeneratedTest_repositoryId_idx" ON "GeneratedTest"("repositoryId");

-- CreateIndex
CREATE INDEX "GeneratedTest_status_idx" ON "GeneratedTest"("status");

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepositoryFile" ADD CONSTRAINT "RepositoryFile_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeChunk" ADD CONSTRAINT "CodeChunk_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "RepositoryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeChunk" ADD CONSTRAINT "CodeChunk_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReview" ADD CONSTRAINT "CodeReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReview" ADD CONSTRAINT "CodeReview_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReviewFinding" ADD CONSTRAINT "CodeReviewFinding_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "CodeReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentation" ADD CONSTRAINT "Documentation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentation" ADD CONSTRAINT "Documentation_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedTest" ADD CONSTRAINT "GeneratedTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedTest" ADD CONSTRAINT "GeneratedTest_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
