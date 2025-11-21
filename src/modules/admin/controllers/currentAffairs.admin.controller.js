import Category from "../../../database/models/currentAffairs/category.model.js";
import Subcategory from "../../../database/models/currentAffairs/subcategory.model.js";
import Article from "../../../database/models/currentAffairs/article.model.js";
import ArticleDetail from "../../../database/models/currentAffairs/articleDetail.model.js";
import logger from "../../../utils/logger.js";

/* ==========================================
   CATEGORIES
   ========================================== */
export const createCategory = async (req, res) => {
  try {
    const { _id, title, logo, description } = req.body;
    if (!(_id && title))
      return res
        .status(400)
        .json({ success: false, message: "_id and title required" });

    const exists = await Category.findById(_id);
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "Category exists" });

    const doc = await Category.create({ _id, title, logo, description });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const doc = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const doc = await Category.findByIdAndDelete(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ==========================================
   SUBCATEGORIES
   Route: POST /:categoryKey/subcategory
   ========================================== */
export const createSubcategory = async (req, res) => {
  try {
    // 1. Extract from URL
    const { categoryKey } = req.params;
    const { _id, title, logo, description } = req.body;

    if (!_id || !title)
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });

    // Validate Parent
    const categoryExists = await Category.exists({ _id: categoryKey });
    if (!categoryExists)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    const doc = await Subcategory.create({
      _id,
      categoryKey, // <--- forced
      title,
      logo,
      description,
    });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    const doc = await Subcategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const doc = await Subcategory.findByIdAndDelete(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ==========================================
   CONTENT (Articles)
   Route: POST /:categoryKey/:subId/content
   ========================================== */
export const createContent = async (req, res) => {
  try {
    // 1. Extract from URL
    const { categoryKey, subId } = req.params;
    const payload = req.body;

    if (!payload.title) {
      return res
        .status(400)
        .json({ success: false, message: "Title required" });
    }

    // 2. Separate Body/ContentUrl from Metadata
    const { body, contentUrl, ...metaData } = payload;

    // 3. Create Article (Metadata) with forced URL params
    const article = await Article.create({
      ...metaData,
      categoryKey, // <--- forced
      subcategoryId: subId, // <--- forced
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4. Create ArticleDetail (Body)
    await ArticleDetail.create({
      articleId: article._id,
      body: body || "",
      contentUrl: contentUrl || "",
    });

    return res.status(201).json({ success: true, data: article });
  } catch (err) {
    logger.error(`createContent error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateContent = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;

    const { body, contentUrl, ...metaData } = payload;

    const article = await Article.findByIdAndUpdate(
      id,
      { ...metaData, updatedAt: new Date() },
      { new: true }
    );

    if (!article)
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });

    await ArticleDetail.findOneAndUpdate(
      { articleId: id },
      { body, contentUrl },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: article });
  } catch (err) {
    logger.error(`updateContent error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteContent = async (req, res) => {
  try {
    const id = req.params.id;
    const article = await Article.findByIdAndDelete(id);
    await ArticleDetail.findOneAndDelete({ articleId: id });

    if (!article)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    logger.error(`deleteContent error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
