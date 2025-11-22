import PaperCategory from "../../../database/models/previousPapers/paperCategory.model.js";
import PaperSubcategory from "../../../database/models/previousPapers/paperSubcategory.model.js";
import PreviousPaper from "../../../database/models/previousPapers/previousPaper.model.js";
import logger from "../../../utils/logger.js";

/* ==========================================
   PAPER CATEGORIES (e.g. "UPSC", "SSC")
   ========================================== */
// No changes needed here (Root level)
export const createPaperCategory = async (req, res) => {
  try {
    const { _id, title, logo, description } = req.body;
    if (!_id || !title) {
      return res
        .status(400)
        .json({ success: false, message: "_id and title required" });
    }
    const exists = await PaperCategory.findById(_id);
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Category ID already exists" });
    }

    const doc = await PaperCategory.create({ _id, title, logo, description });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    logger.error(`createPaperCategory error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updatePaperCategory = async (req, res) => {
  try {
    const doc = await PaperCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    logger.error(`updatePaperCategory error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deletePaperCategory = async (req, res) => {
  try {
    const doc = await PaperCategory.findByIdAndDelete(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    logger.error(`deletePaperCategory error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ==========================================
   PAPER SUBCATEGORIES
   Route: POST /:categoryKey/subcategory
   ========================================== */
export const createPaperSubcategory = async (req, res) => {
  try {
    // 1. Extract categoryKey from URL Params
    const { categoryKey } = req.params;
    const { _id, title, logo, description } = req.body;

    if (!_id || !title || !categoryKey) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Optional: Validate if Category exists
    const categoryExists = await PaperCategory.exists({ _id: categoryKey });
    if (!categoryExists) {
      return res
        .status(404)
        .json({ success: false, message: "Parent Category not found" });
    }

    const doc = await PaperSubcategory.create({
      _id,
      categoryKey, // <--- forced from URL
      title,
      logo,
      description,
    });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    logger.error(`createPaperSubcategory error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update/Delete remains strictly ID based as _id is unique
export const updatePaperSubcategory = async (req, res) => {
  try {
    const doc = await PaperSubcategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    logger.error(`updatePaperSubcategory error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deletePaperSubcategory = async (req, res) => {
  try {
    const doc = await PaperSubcategory.findByIdAndDelete(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    logger.error(`deletePaperSubcategory error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ==========================================
   PREVIOUS PAPERS (Content)
   Route: POST /:categoryKey/:subId/paper
   ========================================== */
export const createPaper = async (req, res) => {
  try {
    // 1. Extract IDs from URL Params
    const { categoryKey, subId } = req.params;

    const {
      title,
      pdfUrl,
      exam,
      year,
      subject,
      language,
      month,
      isPaid,
      logo,
    } = req.body;

    if (!title || !pdfUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Missing title or pdfUrl" });
    }

    // Optional: Validate Subcategory exists
    const subExists = await PaperSubcategory.exists({
      _id: subId,
      categoryKey,
    });
    if (!subExists) {
      return res.status(404).json({
        success: false,
        message: "Invalid Category/Subcategory combination",
      });
    }

    const doc = await PreviousPaper.create({
      title,
      pdfUrl,
      categoryKey, // <--- forced from URL
      subcategoryId: subId, // <--- forced from URL
      exam,
      year,
      subject,
      language: language || "en",
      month,
      isPaid: isPaid || false,
      logo,
      createdAt: new Date(),
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    logger.error(`createPaper error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updatePaper = async (req, res) => {
  try {
    const doc = await PreviousPaper.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    logger.error(`updatePaper error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deletePaper = async (req, res) => {
  try {
    const doc = await PreviousPaper.findByIdAndDelete(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    logger.error(`deletePaper error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
