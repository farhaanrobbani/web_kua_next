-- CreateEnum
CREATE TYPE "announcements_category" AS ENUM ('news', 'article', 'announcement');

-- CreateTable
CREATE TABLE "announcements" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "slug" VARCHAR(220),
    "category" "announcements_category" NOT NULL DEFAULT 'announcement',
    "excerpt" TEXT,
    "author_id" INTEGER,
    "image" VARCHAR(255),
    "published_at" TIMESTAMPTZ(0),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "download_items" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100),
    "file" VARCHAR(255),
    "external_url" VARCHAR(500),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "download_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kritik_sarans" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(150) NOT NULL,
    "kontak" VARCHAR(150),
    "kategori" VARCHAR(50),
    "isi" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "kritik_sarans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kua_activity_themes" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "kua_activity_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kua_daily_data" (
    "id" SERIAL NOT NULL,
    "tanggal" DATE NOT NULL,
    "data" TEXT,
    "created_by" INTEGER,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "kua_daily_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kua_settings" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "kua_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "letter_templates" (
    "id" SERIAL NOT NULL,
    "letter_type_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "body" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "letter_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "letter_types" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "permohonan_judul" VARCHAR(200),
    "description" TEXT,
    "permohonan_body" TEXT,
    "permohonan_informasi" TEXT,
    "permohonan_fields" TEXT,
    "fields" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "publik" BOOLEAN NOT NULL DEFAULT false,
    "kop_footer" TEXT,
    "kop_footer_enabled" BOOLEAN NOT NULL DEFAULT false,
    "kop_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "letter_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "letters" (
    "id" SERIAL NOT NULL,
    "letter_type_id" INTEGER NOT NULL,
    "nomor" VARCHAR(100),
    "tanggal_surat" DATE,
    "perihal" VARCHAR(255) NOT NULL,
    "header_html" TEXT,
    "tampilkan_tanggal" BOOLEAN NOT NULL DEFAULT true,
    "tampilkan_tanggal_ttd" BOOLEAN NOT NULL DEFAULT true,
    "data" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "created_by" INTEGER,
    "approved_by" INTEGER,
    "approved_at" TIMESTAMPTZ(0),
    "keterangan" TEXT,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marriage_announcements" (
    "id" SERIAL NOT NULL,
    "no_pendaftaran" VARCHAR(80),
    "nama_pria" VARCHAR(150) NOT NULL,
    "bin_pria" VARCHAR(120),
    "alamat_pria" VARCHAR(255),
    "nama_wanita" VARCHAR(150) NOT NULL,
    "binti_wanita" VARCHAR(120),
    "alamat_wanita" VARCHAR(255),
    "tanggal_akad" DATE NOT NULL,
    "tempat_nikah" VARCHAR(255),
    "status_wali" VARCHAR(150),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "marriage_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marriage_services" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "persyaratan" TEXT,
    "alur" TEXT,
    "sop" TEXT,
    "persyaratan_label" VARCHAR(50),
    "alur_label" VARCHAR(50),
    "sop_label" VARCHAR(50),
    "icon" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "marriage_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navbar_items" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "parent_id" INTEGER,
    "label" VARCHAR(100) NOT NULL,
    "url" VARCHAR(255),
    "embed_url" VARCHAR(255),
    "icon" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "has_submenu" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "navbar_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "embed_url" VARCHAR(255),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "religious_services" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "persyaratan" TEXT,
    "alur" TEXT,
    "sop" TEXT,
    "persyaratan_label" VARCHAR(50),
    "alur_label" VARCHAR(50),
    "sop_label" VARCHAR(50),
    "icon" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "religious_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(150) NOT NULL,
    "nip" VARCHAR(50),
    "kontak" VARCHAR(100),
    "jabatan" VARCHAR(150) NOT NULL,
    "pangkat_golongan" VARCHAR(100),
    "bagian" VARCHAR(150),
    "foto" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_activities" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tanggal" DATE NOT NULL,
    "kegiatan" TEXT NOT NULL,
    "pekerjaan" TEXT NOT NULL,
    "activity_type_key" VARCHAR(100),
    "total_jumlah" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "staff_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" SERIAL NOT NULL,
    "letter_type_id" INTEGER NOT NULL,
    "nama_pemohon" VARCHAR(150) NOT NULL,
    "kontak" VARCHAR(100),
    "data" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'baru',
    "token" VARCHAR(64),
    "catatan" TEXT,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activity_templates" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "activity_type_key" VARCHAR(100) NOT NULL,
    "kegiatan" TEXT NOT NULL,
    "pekerjaan" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "user_activity_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "nip" VARCHAR(50),
    "jabatan" VARCHAR(255),
    "level_jabatan" VARCHAR(255),
    "pangkat" VARCHAR(255),
    "ruang_golongan" VARCHAR(50),
    "grade_tukin" INTEGER NOT NULL DEFAULT 8,
    "jumlah_tukin_kotor" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "jumlah_tukin_bersih" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "gapok" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "jumlah_uang_makan_harian" DECIMAL(15,2) NOT NULL DEFAULT 35150.00,
    "foto_profil_url" VARCHAR(255),
    "ttd_url" VARCHAR(255),
    "instansi" VARCHAR(255) NOT NULL DEFAULT 'KUA Ampelgading',
    "role" VARCHAR(255) NOT NULL DEFAULT 'staff',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified_at" TIMESTAMPTZ(0),
    "password" VARCHAR(255) NOT NULL,
    "remember_token" VARCHAR(100),
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wakaf_services" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "persyaratan" TEXT,
    "alur" TEXT,
    "sop" TEXT,
    "persyaratan_label" VARCHAR(50),
    "alur_label" VARCHAR(50),
    "sop_label" VARCHAR(50),
    "icon" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(0),
    "updated_at" TIMESTAMPTZ(0),

    CONSTRAINT "wakaf_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "announcements_slug_unique" ON "announcements"("slug");

-- CreateIndex
CREATE INDEX "announcements_author_id_foreign" ON "announcements"("author_id");

-- CreateIndex
CREATE UNIQUE INDEX "kua_activity_themes_key_unique" ON "kua_activity_themes"("key");

-- CreateIndex
CREATE UNIQUE INDEX "kua_daily_data_tanggal_unique" ON "kua_daily_data"("tanggal");

-- CreateIndex
CREATE INDEX "kua_daily_data_created_by_foreign" ON "kua_daily_data"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "kua_settings_key_unique" ON "kua_settings"("key");

-- CreateIndex
CREATE INDEX "letter_templates_letter_type_id_foreign" ON "letter_templates"("letter_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "letter_types_code_unique" ON "letter_types"("code");

-- CreateIndex
CREATE INDEX "letters_approved_by_foreign" ON "letters"("approved_by");

-- CreateIndex
CREATE INDEX "letters_created_by_foreign" ON "letters"("created_by");

-- CreateIndex
CREATE INDEX "letters_letter_type_id_foreign" ON "letters"("letter_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "marriage_services_slug_unique" ON "marriage_services"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "navbar_items_key_unique" ON "navbar_items"("key");

-- CreateIndex
CREATE INDEX "navbar_items_parent_id_foreign" ON "navbar_items"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "pages_key_unique" ON "pages"("key");

-- CreateIndex
CREATE UNIQUE INDEX "religious_services_slug_unique" ON "religious_services"("slug");

-- CreateIndex
CREATE INDEX "staff_activities_activity_type_key_index" ON "staff_activities"("activity_type_key");

-- CreateIndex
CREATE INDEX "staff_activities_user_id_tanggal_index" ON "staff_activities"("user_id", "tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_token_unique" ON "submissions"("token");

-- CreateIndex
CREATE INDEX "submissions_letter_type_id_foreign" ON "submissions"("letter_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_activity_templates_user_id_activity_type_key_unique" ON "user_activity_templates"("user_id", "activity_type_key");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_unique" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "wakaf_services_slug_unique" ON "wakaf_services"("slug");

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "kua_daily_data" ADD CONSTRAINT "kua_daily_data_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "letter_templates" ADD CONSTRAINT "letter_templates_letter_type_id_fkey" FOREIGN KEY ("letter_type_id") REFERENCES "letter_types"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "letters" ADD CONSTRAINT "letters_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "letters" ADD CONSTRAINT "letters_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "letters" ADD CONSTRAINT "letters_letter_type_id_fkey" FOREIGN KEY ("letter_type_id") REFERENCES "letter_types"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "navbar_items" ADD CONSTRAINT "navbar_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "navbar_items"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "staff_activities" ADD CONSTRAINT "staff_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_letter_type_id_fkey" FOREIGN KEY ("letter_type_id") REFERENCES "letter_types"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "user_activity_templates" ADD CONSTRAINT "user_activity_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
