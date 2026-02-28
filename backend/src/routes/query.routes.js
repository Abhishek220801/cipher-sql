import { Router } from "express";
import { execQuery, loadDB } from "../controllers/query.controller.js";

const router = Router();

router.post("/load", loadDB);
router.post("/exec", execQuery);

export default router;
