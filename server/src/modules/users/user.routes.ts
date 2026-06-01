import { Router } from "express";
import * as userControllers from "./user.controller.ts"

const router = Router();

router.get("/", userControllers.getUsers)

export default router;