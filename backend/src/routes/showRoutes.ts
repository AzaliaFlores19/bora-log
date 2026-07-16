import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { searchShows, addShowToList, getUserList, updateShowInList, removeShowFromList, getShowDetails, getExternalShowDetails, getAllUserShows } from "../controllers/showController.js";
const router = Router();

router.get("/search", searchShows);
router.post("/add-list", verifyToken,addShowToList);
router.get("/user-list/:userId", verifyToken, getUserList);
router.patch("/update-list/:userShowId", verifyToken, updateShowInList);
router.delete("/remove-list/:userShowId", verifyToken, removeShowFromList);
router.get("/show-details/:showId", verifyToken,getShowDetails);
router.get("/all-user-shows", verifyToken, getAllUserShows);
router.get("/external-show-details/:id/:mediaType", getExternalShowDetails);

export default router;