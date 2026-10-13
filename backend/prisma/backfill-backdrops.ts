import "dotenv/config";
import prisma from "../src/lib/prisma.js";
import { getExternalDetails } from "../src/services/tmdbService.js";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const isTmdbId = (id: string) => /^\d+$/.test(id);

async function main() {
  const shows = await prisma.show.findMany({ where: { backdropUrl: null } });
  const targets = shows.filter((s) => isTmdbId(s.external_id));

  console.log(
    `[backfill] candidates: ${targets.length} of ${shows.length} shows missing a backdrop (non-TMDB ids are skipped).`,
  );

  let updated = 0;
  let failed = 0;

  for (const show of targets) {
    try {
      const details = await getExternalDetails(show.external_id, show.mediaType);
      await prisma.show.update({
        where: { id: show.id },
        data: {
          backdropUrl: details.backdropUrl ?? undefined,
          imageUrl: show.imageUrl ?? details.imageUrl ?? undefined,
        },
      });
      updated += 1;
      if (updated % 10 === 0) console.log(`[backfill] ${updated} updated...`);
      await delay(120); // gentle with the TMDB rate limit
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[backfill] failed for "${show.title}" (${show.external_id}): ${message}`);
    }
  }

  console.log(`[backfill] done. updated: ${updated}, failed: ${failed}`);
}

main()
  .catch((error) => {
    console.error("[backfill] error:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
