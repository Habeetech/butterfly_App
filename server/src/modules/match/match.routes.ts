import * as matchContollers from "./match.controller"

import { Router } from "express"

const router = Router();

router.get("/:id", matchContollers.matchMaker)

export default router;