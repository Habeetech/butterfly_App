import { Router } from "express";
import * as discovercontroller from "./discover.controller.ts"

const router = Router();

router.get("/:userId", discovercontroller.discoverProfiles);

export default router;