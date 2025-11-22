import express from "express";
import * as ctrl from "./pages.controller.js";

const router = express.Router();

router.get("/:slug", ctrl.getPage);

export default router;
