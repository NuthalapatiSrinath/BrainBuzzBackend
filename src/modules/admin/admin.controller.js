import Category from "../../database/models/currentAffairs/category.model.js";
import Subcategory from "../../database/models/currentAffairs/subcategory.model.js";
import ContentItem from "../../database/models/currentAffairs/contentitem.model.js";

import Media from "../../database/models/media.model.js";
import Subscription from "../../database/models/subscription.model.js";

/* ----- Categories ----- */

// Create category
export const createCategory = async (req, res) => {
  try {
    const { _id, title, logo, description } = req.body;
    if (!(_id && title))
      return res
        .status(400)
        .json({ success: false, message: "_id and title are required" });

    const exists = await Category.findById(_id);
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "Category already exists" });

    const doc = await Category.create({ _id, title, logo, description });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("createCategory", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const patch = req.body;
    const doc = await Category.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    });
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("updateCategory", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete category (note: does NOT cascade delete subcategories/content)
export const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Category.findByIdAndDelete(id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("deleteCategory", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ----- Subcategories ----- */

export const createSubcategory = async (req, res) => {
  try {
    const { _id, categoryKey, title, logo, description } = req.body;
    if (!(_id && categoryKey && title))
      return res
        .status(400)
        .json({ success: false, message: "_id, categoryKey, title required" });
    const cat = await Category.findById(categoryKey);
    if (!cat)
      return res
        .status(400)
        .json({ success: false, message: "categoryKey invalid" });

    const exists = await Subcategory.findById(_id);
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "Subcategory exists" });

    const doc = await Subcategory.create({
      _id,
      categoryKey,
      title,
      logo,
      description,
    });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("createSubcategory", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Subcategory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("updateSubcategory", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Subcategory.findByIdAndDelete(id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("deleteSubcategory", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ----- Content (articles, ebooks, prev papers) ----- */

export const createContent = async (req, res) => {
  try {
    // body should include at least: title, categoryKey, subcategoryId
    const payload = req.body;
    if (!payload.title || !payload.categoryKey || !payload.subcategoryId) {
      return res.status(400).json({
        success: false,
        message: "title, categoryKey, subcategoryId required",
      });
    }

    // optional: validate category/subcategory exist
    const cat = await Category.findById(payload.categoryKey);
    if (!cat)
      return res
        .status(400)
        .json({ success: false, message: "Invalid categoryKey" });

    const sub = await Subcategory.findById(payload.subcategoryId);
    if (!sub)
      return res
        .status(400)
        .json({ success: false, message: "Invalid subcategoryId" });

    // assign createdAt/updatedAt
    payload.createdAt = payload.createdAt || new Date();
    payload.updatedAt = new Date();

    const doc = await ContentItem.create(payload);
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("createContent", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateContent = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await ContentItem.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("updateContent", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteContent = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await ContentItem.findByIdAndDelete(id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("deleteContent", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ----- Media ----- */

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
    console.error("createMedia", err);
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
    console.error("listMedia", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Media.findByIdAndDelete(id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("deleteMedia", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ----- Subscriptions ----- */

export const listSubscriptions = async (req, res) => {
  try {
    const items = await Subscription.find({})
      .sort({ startAt: -1 })
      .limit(500)
      .lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error("listSubscriptions", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
