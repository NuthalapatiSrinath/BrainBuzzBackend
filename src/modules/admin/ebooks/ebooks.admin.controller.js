import EbookCategory from "../../../database/models/ebooks/ebookCategory.model.js";
import EbookSubcategory from "../../../database/models/ebooks/ebookSubcategory.model.js";
import Ebook from "../../../database/models/ebooks/ebook.model.js";
import logger from "../../../utils/logger.js";

/* ==========================================
   HELPER FUNCTIONS
   ========================================== */
// Converts "English, Telugu" -> ["English", "Telugu"]
const parseLanguages = (input) => {
  if (!input) return ["English"];
  if (Array.isArray(input)) return input;
  return input.split(",").map((lang) => lang.trim());
};

/* ==========================================
   CATEGORIES
   ========================================== */
export const createCategory = async (req, res) => {
  try {
    const { _id, title, logo, description } = req.body;
    const doc = await EbookCategory.create({ _id, title, logo, description });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const doc = await EbookCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const doc = await EbookCategory.findByIdAndDelete(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

/* ==========================================
   SUBCATEGORIES
   ========================================== */
export const createSubcategory = async (req, res) => {
  try {
    const { categoryKey } = req.params;
    const { _id, title, logo, description } = req.body;

    const catExists = await EbookCategory.exists({ _id: categoryKey });
    if (!catExists)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    const doc = await EbookSubcategory.create({
      _id,
      categoryKey,
      title,
      logo,
      description,
    });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    const doc = await EbookSubcategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const doc = await EbookSubcategory.findByIdAndDelete(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

/* ==========================================
   E-BOOKS (Content)
   ========================================== */
export const createEbook = async (req, res) => {
  try {
    const { categoryKey, subId } = req.params;
    const {
      title,
      pdfUrl,
      thumbnail,
      description,
      language,
      validity,
      isPaid,
    } = req.body;

    // 1. Validate Subcategory
    const subExists = await EbookSubcategory.exists({
      _id: subId,
      categoryKey,
    });
    if (!subExists)
      return res
        .status(404)
        .json({ success: false, message: "Invalid Category/Subcategory" });

    // 2. Parse Languages
    const langArray = parseLanguages(language);

    // 3. Create E-Book
    const doc = await Ebook.create({
      title,
      categoryKey,
      subcategoryId: subId,
      pdfUrl,
      thumbnail,
      description,
      language: langArray,
      validity: validity || "NA",
      isPaid: isPaid || false,
      createdAt: new Date(),
    });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    // 4. Handle Duplicate Title
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An E-Book with this title already exists.",
      });
    }
    logger.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateEbook = async (req, res) => {
  try {
    // 1. Prevent Empty Updates
    if (Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No data provided for update." });
    }

    // 2. Handle Language Update
    if (req.body.language) {
      req.body.language = parseLanguages(req.body.language);
    }

    const doc = await Ebook.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });

    return res.json({ success: true, data: doc });
  } catch (err) {
    // 3. Handle Duplicate Title on Update
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Title already exists." });
    }
    logger.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteEbook = async (req, res) => {
  try {
    const doc = await Ebook.findByIdAndDelete(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false });
  }
};
