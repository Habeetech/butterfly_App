import { Router } from "express";
import discoverRoutes from "./modules/discover/discover.routes.js";
import userRoutes from "./modules/users/user.routes.js"


const router = Router();

router.use("/discover", discoverRoutes);
router.use("/users", userRoutes)

export default router;