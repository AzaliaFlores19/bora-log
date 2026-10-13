import "dotenv/config";
import bcrypt from "bcryptjs";
import type { Mood, Status, Time_Commit } from "@prisma/client";
import prisma from "../src/lib/prisma.js";

// ===== Flags =====
// --prod           force production mode (demo data is never seeded, admin env is required)
// --demo           force demo data on
// --no-demo        force demo data off
// --force-password overwrite the admin password even if the user already exists
const args = process.argv.slice(2);
const isProd = args.includes("--prod") || process.env.NODE_ENV === "production";
const forcePassword = args.includes("--force-password");
const seedDemo =
  args.includes("--demo") ||
  (!isProd && !args.includes("--no-demo") && process.env.SEED_DEMO !== "false");

const log = (...parts: unknown[]) => console.log("[seed]", ...parts);

const DEMO_PASSWORD = "Demo123!";
const DEMO_USER = { name: "Demo User", email: "demo@boralog.com" };

type DemoShow = {
  external_id: string;
  title: string;
  mediaType: "movie" | "tv";
  description: string;
  imageUrl: string | null;
  duration: number;
  totalEpisodes: number;
  releaseDate: string;
  status: Status;
  rating: number;
  mood: Mood[];
  time_commit: Time_Commit;
};

const DEMO_SHOWS: DemoShow[] = [
  {
    external_id: "demo-movie-1",
    title: "Bora Demo Movie",
    mediaType: "movie",
    description: "A movie seeded for local development.",
    imageUrl: null,
    duration: 120,
    totalEpisodes: 1,
    releaseDate: "2020-05-01T00:00:00.000Z",
    status: "completed",
    rating: 9,
    mood: ["happy", "excited"],
    time_commit: "between_1_and_3_hours",
  },
  {
    external_id: "demo-series-1",
    title: "Bora Demo Series",
    mediaType: "tv",
    description: "A TV show seeded for local development.",
    imageUrl: null,
    duration: 45,
    totalEpisodes: 12,
    releaseDate: "2022-09-15T00:00:00.000Z",
    status: "watching",
    rating: 8,
    mood: ["chill", "nerdy"],
    time_commit: "around_30_min",
  },
  {
    external_id: "demo-movie-2",
    title: "Bora Demo Documentary",
    mediaType: "movie",
    description: "A documentary seeded for local development.",
    imageUrl: null,
    duration: 90,
    totalEpisodes: 1,
    releaseDate: "2019-02-10T00:00:00.000Z",
    status: "plan_to_watch",
    rating: 7,
    mood: ["nerdy", "chill"],
    time_commit: "binge",
  },
];

async function seedAdmin() {
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Bora Admin";
  let email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() || "";
  let password = process.env.SEED_ADMIN_PASSWORD || "";

  if (!email || !password) {
    if (isProd) {
      throw new Error(
        "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required when seeding production (run with --prod).",
      );
    }
    email = email || "admin@boralog.com";
    password = password || "Admin123!";
    log("SEED_ADMIN_* not fully set; using development defaults.");
  }

  const hashed = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    await prisma.user.create({
      data: { name, email, password: hashed, role: "ADMIN", isActive: true },
    });
    log(`admin created: ${email}`);
    return;
  }

  await prisma.user.update({
    where: { id: existing.id },
    data: {
      role: "ADMIN",
      isActive: true,
      deletedAt: null,
      ...(process.env.SEED_ADMIN_NAME ? { name } : {}),
      ...(forcePassword ? { password: hashed } : {}),
    },
  });
  log(`admin ensured: ${email}${forcePassword ? " (password reset)" : ""}`);
}

async function seedDemoData() {
  const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: { name: DEMO_USER.name, isActive: true, deletedAt: null },
    create: {
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      password: hashed,
      role: "USER",
      isActive: true,
    },
  });
  log(`demo user ensured: ${DEMO_USER.email} (password: ${DEMO_PASSWORD})`);

  for (const item of DEMO_SHOWS) {
    const show = await prisma.show.upsert({
      where: {
        external_id_mediaType: { external_id: item.external_id, mediaType: item.mediaType },
      },
      update: {
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        duration: item.duration,
        totalEpisodes: item.totalEpisodes,
        releaseDate: item.releaseDate,
      },
      create: {
        external_id: item.external_id,
        mediaType: item.mediaType,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        duration: item.duration,
        totalEpisodes: item.totalEpisodes,
        releaseDate: item.releaseDate,
      },
    });

    await prisma.userShow.upsert({
      where: { user_id_show_id: { user_id: user.id, show_id: show.id } },
      update: {
        status: item.status,
        rating: item.rating,
        mood: item.mood,
        time_commit: item.time_commit,
        deletedAt: null,
      },
      create: {
        user_id: user.id,
        show_id: show.id,
        status: item.status,
        rating: item.rating,
        mood: item.mood,
        time_commit: item.time_commit,
      },
    });
  }
  log(`demo shows ensured: ${DEMO_SHOWS.length}`);
}

async function main() {
  log(`mode: ${isProd ? "production" : "development"} | demo data: ${seedDemo ? "on" : "off"}`);
  await prisma.$connect();
  await seedAdmin();
  if (seedDemo) await seedDemoData();
  log("done");
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[seed] error:", message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
