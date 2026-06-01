import express from "express";
import router from "./router.js";

const app = express();

app.use(express.json());
app.get("/", (req, res) => res.send("Hello, You've hit the butterfly_app server"));
app.use("/api", router);

export default app;