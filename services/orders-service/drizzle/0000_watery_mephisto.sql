CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"courier_id" uuid,
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"pickup_location" jsonb NOT NULL,
	"dropoff_location" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
