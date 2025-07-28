ALTER TABLE "drawing_boards" DROP CONSTRAINT "drawing_boards_task_id_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "drawing_boards" ADD COLUMN "team_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "drawing_boards" ADD CONSTRAINT "drawing_boards_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawing_boards" DROP COLUMN "task_id";