import * as matchContollers from "./match.controller"

import { Router } from "express"

const router = Router();
router.get("/:id", matchContollers.getPotentials)
router.get("/", matchContollers.getAllUsersPotentials)

export default router;