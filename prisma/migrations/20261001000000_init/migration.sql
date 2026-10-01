CREATE TABLE "cyber_users" (
  "id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'user',
  "xp" INTEGER NOT NULL DEFAULT 0,
  "avatar_url" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cyber_users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cyber_users_email_key" ON "cyber_users"("email");
CREATE UNIQUE INDEX "cyber_users_username_key" ON "cyber_users"("username");

CREATE TABLE "cyber_projects" (
  "id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL,
  "repo_url" TEXT,
  "live_url" TEXT,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "created_by" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cyber_projects_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "cyber_projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "cyber_users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "cyber_projects_slug_key" ON "cyber_projects"("slug");
CREATE INDEX "cyber_projects_published_featured_idx" ON "cyber_projects"("published","featured");

CREATE TABLE "cyber_quizzes" (
  "id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT false,
  "time_limit" INTEGER NOT NULL DEFAULT 30,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cyber_quizzes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cyber_quizzes_slug_key" ON "cyber_quizzes"("slug");

CREATE TABLE "cyber_questions" (
  "id" UUID NOT NULL,
  "quiz_id" UUID NOT NULL,
  "prompt" TEXT NOT NULL,
  "options" JSONB NOT NULL,
  "correct_option" INTEGER NOT NULL,
  "explanation" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  CONSTRAINT "cyber_questions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "cyber_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "cyber_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "cyber_questions_quiz_id_position_key" ON "cyber_questions"("quiz_id","position");
CREATE INDEX "cyber_questions_quiz_id_idx" ON "cyber_questions"("quiz_id");

CREATE TABLE "cyber_quiz_attempts" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "quiz_id" UUID NOT NULL,
  "score" INTEGER NOT NULL,
  "max_score" INTEGER NOT NULL,
  "time_spent" INTEGER NOT NULL DEFAULT 0,
  "answers_json" JSONB NOT NULL,
  "xp_awarded" INTEGER NOT NULL DEFAULT 0,
  "attempt_key" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cyber_quiz_attempts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "cyber_quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "cyber_users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "cyber_quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "cyber_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "cyber_quiz_attempts_user_id_created_at_idx" ON "cyber_quiz_attempts"("user_id","created_at");
CREATE INDEX "cyber_quiz_attempts_quiz_id_score_idx" ON "cyber_quiz_attempts"("quiz_id","score");
CREATE UNIQUE INDEX "cyber_quiz_attempts_attempt_key_key" ON "cyber_quiz_attempts"("attempt_key");

CREATE TABLE "cyber_rooms" (
  "id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_by" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cyber_rooms_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cyber_rooms_slug_key" ON "cyber_rooms"("slug");

CREATE TABLE "cyber_room_messages" (
  "id" UUID NOT NULL,
  "room_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cyber_room_messages_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "cyber_room_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "cyber_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "cyber_room_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "cyber_users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "cyber_room_messages_room_id_created_at_idx" ON "cyber_room_messages"("room_id","created_at");
