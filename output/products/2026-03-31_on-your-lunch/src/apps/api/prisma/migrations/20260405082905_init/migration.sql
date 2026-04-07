-- CreateEnum
CREATE TYPE "PriceRange" AS ENUM ('UNDER_10K', 'BETWEEN_10K_20K', 'OVER_20K');

-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('KAKAO', 'MANUAL', 'USER');

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(30) NOT NULL,
    "color_code" VARCHAR(7) NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergy_type" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(20) NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "allergy_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "nickname" VARCHAR(10) NOT NULL,
    "profile_image_url" TEXT,
    "google_id" VARCHAR(255) NOT NULL,
    "refresh_token" TEXT,
    "notification_enabled" BOOLEAN NOT NULL DEFAULT true,
    "notification_time" VARCHAR(5) NOT NULL DEFAULT '11:30',
    "marketing_agreed" BOOLEAN NOT NULL DEFAULT false,
    "terms_agreed_at" TIMESTAMPTZ NOT NULL,
    "expo_push_token" TEXT,
    "preferred_price_range" "PriceRange" NOT NULL,
    "is_onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_location" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "building_name" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferred_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_preferred_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_excluded_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_excluded_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_allergy" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "allergy_type_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_allergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kakao_place_id" VARCHAR(50),
    "name" VARCHAR(100) NOT NULL,
    "category_id" UUID NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "phone" VARCHAR(20),
    "description" VARCHAR(200),
    "price_range" "PriceRange",
    "business_hours" VARCHAR(200),
    "thumbnail_url" TEXT,
    "is_user_created" BOOLEAN NOT NULL DEFAULT false,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "data_source" "DataSource" NOT NULL DEFAULT 'KAKAO',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_menu" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "restaurant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "price" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_photo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "restaurant_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "is_thumbnail" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eating_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "restaurant_id" UUID,
    "manual_restaurant_name" VARCHAR(100),
    "manual_category_id" UUID,
    "eaten_date" DATE NOT NULL,
    "rating" SMALLINT NOT NULL,
    "memo" VARCHAR(300),
    "is_from_recommendation" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eating_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "recommendation_date" DATE NOT NULL,
    "refresh_count" SMALLINT NOT NULL DEFAULT 0,
    "filter_category_ids" UUID[],
    "filter_price_range" VARCHAR(20),
    "filter_walk_minutes" SMALLINT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_log_item" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recommendation_log_id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "display_order" SMALLINT NOT NULL,

    CONSTRAINT "recommendation_log_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kakao_category_mapping" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kakao_category" VARCHAR(100) NOT NULL,
    "category_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kakao_category_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "event_name" VARCHAR(50) NOT NULL,
    "event_data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "allergy_type_name_key" ON "allergy_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_google_id_key" ON "user"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_location_user_id_key" ON "user_location"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_upc_user_category" ON "user_preferred_category"("user_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_uec_user_category" ON "user_excluded_category"("user_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_ua_user_allergy" ON "user_allergy"("user_id", "allergy_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_kakao_place_id_key" ON "restaurant"("kakao_place_id");

-- CreateIndex
CREATE INDEX "idx_restaurant_category" ON "restaurant"("category_id");

-- CreateIndex
CREATE INDEX "idx_restaurant_menu_restaurant" ON "restaurant_menu"("restaurant_id");

-- CreateIndex
CREATE INDEX "idx_restaurant_photo_restaurant" ON "restaurant_photo"("restaurant_id");

-- CreateIndex
CREATE INDEX "idx_eating_history_user_recent" ON "eating_history"("user_id", "eaten_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "idx_eating_history_user_date" ON "eating_history"("user_id", "restaurant_id", "eaten_date");

-- CreateIndex
CREATE INDEX "idx_favorite_user_created" ON "favorite"("user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "idx_favorite_user_restaurant" ON "favorite"("user_id", "restaurant_id");

-- CreateIndex
CREATE INDEX "idx_recommendation_log_user_date" ON "recommendation_log"("user_id", "recommendation_date" DESC);

-- CreateIndex
CREATE INDEX "idx_rli_log_id" ON "recommendation_log_item"("recommendation_log_id");

-- CreateIndex
CREATE INDEX "idx_rli_restaurant" ON "recommendation_log_item"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "kakao_category_mapping_kakao_category_key" ON "kakao_category_mapping"("kakao_category");

-- CreateIndex
CREATE INDEX "idx_event_log_user_created" ON "event_log"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_event_log_name_created" ON "event_log"("event_name", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "user_location" ADD CONSTRAINT "user_location_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferred_category" ADD CONSTRAINT "user_preferred_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferred_category" ADD CONSTRAINT "user_preferred_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_excluded_category" ADD CONSTRAINT "user_excluded_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_excluded_category" ADD CONSTRAINT "user_excluded_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_allergy" ADD CONSTRAINT "user_allergy_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_allergy" ADD CONSTRAINT "user_allergy_allergy_type_id_fkey" FOREIGN KEY ("allergy_type_id") REFERENCES "allergy_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant" ADD CONSTRAINT "restaurant_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_menu" ADD CONSTRAINT "restaurant_menu_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_photo" ADD CONSTRAINT "restaurant_photo_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eating_history" ADD CONSTRAINT "eating_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eating_history" ADD CONSTRAINT "eating_history_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_log" ADD CONSTRAINT "recommendation_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_log_item" ADD CONSTRAINT "recommendation_log_item_recommendation_log_id_fkey" FOREIGN KEY ("recommendation_log_id") REFERENCES "recommendation_log"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_log_item" ADD CONSTRAINT "recommendation_log_item_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_log" ADD CONSTRAINT "event_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
