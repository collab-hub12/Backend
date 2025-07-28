-- Migration: Change drawing_boards from task_id to team_id
-- This migration updates the drawing_boards table to reference teams instead of tasks

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE "drawing_boards" DROP CONSTRAINT IF EXISTS "drawing_boards_task_id_tasks_id_fk";

-- Step 2: Add the new team_id column
ALTER TABLE "drawing_boards" ADD COLUMN "team_id" uuid;

-- Step 3: Populate team_id based on existing task_id data
-- This assumes we want to migrate existing data by using the team_id from the associated task
UPDATE "drawing_boards" 
SET "team_id" = (
    SELECT "team_id" 
    FROM "tasks" 
    WHERE "tasks"."id" = "drawing_boards"."task_id"
);

-- Step 4: Make team_id NOT NULL after populating data
ALTER TABLE "drawing_boards" ALTER COLUMN "team_id" SET NOT NULL;

-- Step 5: Drop the old task_id column
ALTER TABLE "drawing_boards" DROP COLUMN "task_id";

-- Step 6: Add the new foreign key constraint to teams
DO $$ BEGIN
 ALTER TABLE "drawing_boards" ADD CONSTRAINT "drawing_boards_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$; 