-- AlterTable
ALTER TABLE "User" ADD COLUMN "avatarColor" TEXT;

-- AlterEnum: swap the Mood enum to the app's canonical set.
-- Existing values are remapped first (chill->cozy, excited/energetic->thrilled,
-- mad/stressed/bored/lonely/tragic/tense->sad) via a text[] intermediate step.
BEGIN;
CREATE TYPE "Mood_new" AS ENUM ('happy', 'sad', 'nerdy', 'adventurous', 'romantic', 'thrilled', 'cozy', 'thoughtful');

ALTER TABLE "UserShow" ALTER COLUMN "mood" DROP DEFAULT;
ALTER TABLE "UserShow" ALTER COLUMN "mood" TYPE text[] USING "mood"::text[];

UPDATE "UserShow" SET "mood" = COALESCE(
  (
    SELECT array_agg(DISTINCT (CASE elem
      WHEN 'chill' THEN 'cozy'
      WHEN 'excited' THEN 'thrilled'
      WHEN 'energetic' THEN 'thrilled'
      WHEN 'mad' THEN 'sad'
      WHEN 'stressed' THEN 'sad'
      WHEN 'bored' THEN 'sad'
      WHEN 'lonely' THEN 'sad'
      WHEN 'tragic' THEN 'sad'
      WHEN 'tense' THEN 'sad'
      ELSE elem
    END))
    FROM unnest("mood") AS elem
  ),
  ARRAY[]::text[]
);

ALTER TABLE "UserShow" ALTER COLUMN "mood" TYPE "Mood_new"[] USING "mood"::"Mood_new"[];

ALTER TYPE "Mood" RENAME TO "Mood_old";
ALTER TYPE "Mood_new" RENAME TO "Mood";
DROP TYPE "Mood_old";
COMMIT;
