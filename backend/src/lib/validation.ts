import { z, type ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";

// ===== Enum values (must stay in sync with prisma/schema.prisma) =====
export const STATUS_VALUES = ["watching", "completed", "plan_to_watch", "dropped"] as const;
export const MOOD_VALUES = [
  "happy",
  "sad",
  "nerdy",
  "adventurous",
  "romantic",
  "thrilled",
  "cozy",
  "thoughtful",
] as const;
export const TIME_COMMIT_VALUES = ["around_30_min", "between_1_and_3_hours", "binge"] as const;
export const ROLE_VALUES = ["USER", "ADMIN"] as const;
export const MEDIA_TYPE_VALUES = ["movie", "tv"] as const;

// ===== Shared primitives =====
const emailField = z.string().trim().email().max(255);
const passwordField = z.string().min(6).max(72);
const ratingField = z.number().int().min(1).max(10).nullable();
const avatarColorField = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color");

// ===== Auth =====
export const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: emailField,
  password: passwordField,
  avatarColor: avatarColorField.optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordField,
});

// ===== Users =====
export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: emailField.optional(),
  profileImage: z.string().trim().url().max(2048).nullable().optional(),
  avatarColor: avatarColorField.nullable().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1).optional(),
  newPassword: passwordField,
});

export const adminUpdateUserSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: emailField.optional(),
  role: z.enum(ROLE_VALUES).optional(),
  isActive: z.boolean().optional(),
});

// ===== Shows =====
export const showDataSchema = z.object({
  external_id: z.union([z.string(), z.number()]).transform(String),
  title: z.string().trim().min(1).max(500),
  description: z.string().nullish(),
  mediaType: z.enum(MEDIA_TYPE_VALUES),
  imageUrl: z.string().trim().url().max(2048).nullish(),
  poster_path: z.string().nullish(),
  duration: z.number().int().nonnegative().nullish(),
  totalEpisodes: z.number().int().nonnegative().nullish(),
  releaseDate: z.string().nullish(),
});

export const userShowDataSchema = z.object({
  status: z.enum(STATUS_VALUES).nullish(),
  rating: ratingField.optional(),
  mood: z.array(z.enum(MOOD_VALUES)).optional(),
  time_commit: z.enum(TIME_COMMIT_VALUES).nullish(),
});

export const addShowSchema = z.object({
  showData: showDataSchema,
  userShowData: userShowDataSchema,
});

export const updateShowEntrySchema = z.object({
  status: z.enum(STATUS_VALUES).nullish(),
  rating: ratingField.optional(),
  mood: z.array(z.enum(MOOD_VALUES)).optional(),
  time_commit: z.enum(TIME_COMMIT_VALUES).nullish(),
});

export const showListQuerySchema = z.object({
  status: z.enum(STATUS_VALUES).optional(),
  time_commit: z.enum(TIME_COMMIT_VALUES).optional(),
  mood: z.union([z.enum(MOOD_VALUES), z.array(z.enum(MOOD_VALUES))]).optional(),
});

export const externalShowParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "id must be a numeric TMDB id"),
  mediaType: z.enum(MEDIA_TYPE_VALUES),
});

// Media type filter for catalog browsing (defaults to series).
export const mediaTypeFilterSchema = z.object({
  mediaType: z.enum(["tv", "movie", "all"]).optional(),
});

export const showSearchQuerySchema = mediaTypeFilterSchema.extend({
  title: z.string().trim().min(1),
});

export type ShowListQuery = z.infer<typeof showListQuerySchema>;
export type UpdateShowEntryInput = z.infer<typeof updateShowEntrySchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;

// ===== Middleware helpers =====
function formatIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Validation error", errors: formatIssues(result.error) });
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validates and normalizes `req.query`, storing the parsed result in `res.locals.query`.
 * Express's `req.query` is not safely assignable, so we keep the parsed value aside.
 */
export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ message: "Validation error", errors: formatIssues(result.error) });
    }
    res.locals.query = result.data;
    next();
  };
}

export function validateParams(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({ message: "Validation error", errors: formatIssues(result.error) });
    }
    res.locals.params = result.data;
    next();
  };
}
