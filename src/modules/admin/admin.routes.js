// src/modules/admin/admin.routes.js
import express from "express";
import ensureAdmin from "../../middleware/ensureAdmin.js";
import { authenticate } from "../../middleware/auth.js"; // your existing
import * as ctrl from "./admin.controller.js";

const router = express.Router();

// protect all admin routes: authenticate -> ensureAdmin
router.use(authenticate, ensureAdmin);

/* categories */
router.post("/category", ctrl.createCategory);
router.put("/category/:id", ctrl.updateCategory);
router.delete("/category/:id", ctrl.deleteCategory);

/* subcategories */
router.post("/subcategory", ctrl.createSubcategory);
router.put("/subcategory/:id", ctrl.updateSubcategory);
router.delete("/subcategory/:id", ctrl.deleteSubcategory);

/* contentitems (articles/ebooks/testseries entries) */
router.post("/content", ctrl.createContent);
router.put("/content/:id", ctrl.updateContent);
router.delete("/content/:id", ctrl.deleteContent);

/* media */
router.post("/media", ctrl.createMedia);
router.get("/media", ctrl.listMedia);
router.delete("/media/:id", ctrl.deleteMedia);

/* subscriptions */
router.get("/subscriptions", ctrl.listSubscriptions);

export default router;
