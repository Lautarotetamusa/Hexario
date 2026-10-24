CREATE TABLE "territory_claims" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"claimed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "territory_claims" ADD CONSTRAINT "territory_claims_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
