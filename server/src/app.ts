import express from "express";
import router from "./router.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.get("/", (req, res) => res.send("Hello, You've hit the butterfly_app server"));
app.use("/api", router);
app.use(errorHandler);

export default app;