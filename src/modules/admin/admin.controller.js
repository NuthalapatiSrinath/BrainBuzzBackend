import Category from "../../database/models/currentAffairs/category.model.js";
import Subcategory from "../../database/models/currentAffairs/subcategory.model.js";
// NEW MODELS
import Article from "../../database/models/currentAffairs/article.model.js";
import ArticleDetail from "../../database/models/currentAffairs/articleDetail.model.js";

import Media from "../../database/models/media.model.js";
import Subscription from "../../database/models/subscription.model.js";
import logger from "../../utils/logger.js";

/* ----- Categories & Subcategories (Unchanged) ----- */
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

export const createSubcategory = async (req, res) => {
  try {
    const { _id, categoryKey, title, logo, description } = req.body;
    if (!(_id && categoryKey && title))
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    const doc = await Subcategory.create({
      _id,
      categoryKey,
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

/* ----- Content (Articles) - UPDATED FOR SPLIT MODELS ----- */

export const createContent = async (req, res) => {
  try {
    const payload = req.body;

    // 1. Validation
    if (!payload.title || !payload.categoryKey || !payload.subcategoryId) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields missing" });
    }

    // 2. Separate Body/ContentUrl from Metadata
    const { body, contentUrl, ...metaData } = payload;

    // 3. Create Article (Metadata)
    // If _id is not provided, Mongoose creates one automatically.
    // If you provide a custom _id in payload, it uses that.
    const article = await Article.create({
      ...metaData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4. Create ArticleDetail (Body) linked to Article
    await ArticleDetail.create({
      articleId: article._id, // Link them
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

    // 1. Separate Body/ContentUrl
    const { body, contentUrl, ...metaData } = payload;

    // 2. Update Article (Metadata)
    const article = await Article.findByIdAndUpdate(
      id,
      { ...metaData, updatedAt: new Date() },
      { new: true }
    );

    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    // 3. Update ArticleDetail (Body)
    // upsert: true ensures it creates detail if it was missing for some reason
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

    // Delete both
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

/* ----- Media & Subscriptions (Unchanged) ----- */

export const createMedia = async (req, res) => {
  try {
    const { url, filename, type, size, meta } = req.body;
    if (!url)
      return res.status(400).json({ success: false, message: "url required" });
    const doc = await Media.create({
      url,
      filename,
      type: type || "image",
      size,
      meta,
      uploadedBy: req.user?.sub,
    });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const listMedia = async (req, res) => {
  try {
    const items = await Media.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const doc = await Media.findByIdAndDelete(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const listSubscriptions = async (req, res) => {
  try {
    const items = await Subscription.find({})
      .sort({ startAt: -1 })
      .limit(500)
      .lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
