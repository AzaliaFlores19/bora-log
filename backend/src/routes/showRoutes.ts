import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  searchShows,
  getTrendingShows,
  addShowToList,
  getUserList,
  updateShowInList,
  removeShowFromList,
  getShowDetails,
  getExternalShowDetails,
} from "../controllers/showController.js";
import {
  validateBody,
  validateQuery,
  validateParams,
  addShowSchema,
  updateShowEntrySchema,
  showListQuerySchema,
  externalShowParamsSchema,
  showSearchQuerySchema,
  mediaTypeFilterSchema,
} from "../lib/validation.js";

const router = Router();

router.get("/search", validateQuery(showSearchQuerySchema), searchShows);
router.get("/trending", validateQuery(mediaTypeFilterSchema), getTrendingShows);
router.post("/add-list", verifyToken, validateBody(addShowSchema), addShowToList);
router.get("/user-list/:userId", verifyToken, validateQuery(showListQuerySchema), getUserList);
router.patch("/update-list/:userShowId", verifyToken, validateBody(updateShowEntrySchema), updateShowInList);
router.delete("/remove-list/:userShowId", verifyToken, removeShowFromList);
router.get("/show-details/:userShowId", verifyToken, getShowDetails);
router.get("/external-show-details/:id/:mediaType", validateParams(externalShowParamsSchema), getExternalShowDetails);

export default router;
