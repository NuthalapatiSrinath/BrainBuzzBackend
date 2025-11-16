// src/modules/currentAffairs/currentAffairs.controller.js
import Category from "../../database/models/currentAffairs/category.model.js";
import Subcategory from "../../database/models/currentAffairs/subcategory.model.js";
import ContentItem from "../../database/models/currentAffairs/contentitem.model.js";

/**
 * Utility: determine language from request
 * Priority: query param ?lang=  -> header 'x-bb-lang' -> default 'en'
 */
function getLangFromReq(req) {
  return (req.query.lang || req.headers["x-bb-lang"] || "en").toString();
}

/**
 * Helper: determine whether q string matches a known scope
 * If your app uses a fixed set of scope labels, list them here (case-insensitive).
 * Expand this list to match whatever "scope" values you use in the DB.
 */
const KNOWN_SCOPES = [
  "international",
  "state news",
  "banking",
  "business news",
  "books & authors",
  "sports",
  "awards",
  "all",
];

/**
 * GET /api/currentaffairs/categories
 * returns list of categories (id/title/logo/description)
 */
export const getCategories = async (req, res) => {
  try {
    const lang = getLangFromReq(req);
    // categories are language-agnostic (title/description stored per category).
    const cats = await Category.find({}).sort({ title: 1 }).lean();
    return res.json({ success: true, data: cats || [] });
  } catch (err) {
    console.error("getCategories error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/currentaffairs/all
 * returns categories each with subcategories (for "All categories" landing)
 */
export const getAllCategoriesWithSubs = async (req, res) => {
  try {
    const lang = getLangFromReq(req);
    const cats = await Category.find({}).sort({ title: 1 }).lean();
    const subs = await Subcategory.find({}).sort({ title: 1 }).lean();

    // group subs by categoryKey
    const byCategory = subs.reduce((acc, s) => {
      (acc[s.categoryKey] = acc[s.categoryKey] || []).push(s);
      return acc;
    }, {});

    const result = (cats || []).map((c) => ({
      ...c,
      subcategories: (byCategory[c._id] || []).map((s) => ({
        id: s._id,
        title: s.title,
        logo: s.logo,
        description: s.description,
      })),
    }));

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("getAllCategoriesWithSubs error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/currentaffairs/:categoryKey
 * returns subcategories for the category and some meta
 */
export const getCategoryLanding = async (req, res) => {
  try {
    const rawKey = req.params.categoryKey || req.params.category || "";
    const categoryKey = String(rawKey).toLowerCase();
    if (!categoryKey)
      return res
        .status(400)
        .json({ success: false, message: "Missing category" });

    // Try find by id (some seeds use _id = slug), fallback to findOne({ key })
    let category = await Category.findById(categoryKey).lean();
    if (!category) {
      category = await Category.findOne({ _id: categoryKey }).lean();
    }
    if (!category) {
      // also try field `key` if you use it
      category = await Category.findOne({ key: categoryKey }).lean();
    }

    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    // subcategories
    const subs = await Subcategory.find({ categoryKey })
      .sort({ title: 1 })
      .lean();

    // counts per subcategory (only non-paid items here)
    const subIds = subs.map((s) => s._id);
    const counts = subIds.length
      ? await ContentItem.aggregate([
          { $match: { subcategoryId: { $in: subIds }, isPaid: false } },
          { $group: { _id: "$subcategoryId", count: { $sum: 1 } } },
        ])
      : [];

    const countsMap = counts.reduce((acc, c) => {
      acc[c._id] = c.count;
      return acc;
    }, {});

    const tiles = subs.map((s) => ({
      id: s._id,
      title: s.title,
      logo: s.logo || category.logo,
      description: s.description,
      count: countsMap[s._id] || 0,
    }));

    return res.json({
      success: true,
      data: {
        category,
        tiles,
      },
    });
  } catch (err) {
    console.error("getCategoryLanding error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/currentaffairs/:categoryKey/:subId/articles
 * Query params:
 *  - month=YYYY-MM
 *  - q=search text OR scope filter (e.g. 'Awards')  <-- improved handling
 *  - page, limit
 *  - lang (en/hi/te)
 */
export const getArticlesList = async (req, res) => {
  try {
    const rawKey = req.params.categoryKey || req.params.category || "";
    const categoryKey = String(rawKey || "").toLowerCase();
    const subId = req.params.subId;
    const q = (req.query.q || "").trim();
    const month = req.query.month || null;
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(
      200,
      Math.max(5, parseInt(req.query.limit || "20", 10))
    );
    const lang = getLangFromReq(req);

    if (!categoryKey || !subId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing category or subId" });
    }

    // base filters
    const filter = { categoryKey, subcategoryId: subId, isPaid: false };

    if (month) filter.month = month;
    if (lang) filter.language = lang;

    // If q matches a known scope label, treat as scope filter instead of text search
    const qLower = q.toLowerCase();
    const isScope = q && KNOWN_SCOPES.includes(qLower);
    if (isScope && qLower !== "all") {
      // Use original casing from q for matching as stored in DB (you may normalize DB instead)
      // Here we attempt case-insensitive match by using regex anchored
      filter.scope = new RegExp(
        "^" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
        "i"
      );
    } else if (q) {
      // full-text like search over title/excerpt/body
      const qRegex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: qRegex }, { excerpt: qRegex }, { body: qRegex }];
    }

    const skip = (page - 1) * limit;

    // total count & items
    const [total, items] = await Promise.all([
      ContentItem.countDocuments(filter),
      ContentItem.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // compute months list for subId (for sidebar)
    const monthsAgg = await ContentItem.aggregate([
      {
        $match: {
          categoryKey,
          subcategoryId: subId,
          isPaid: false,
          language: lang,
        },
      },
      {
        $group: { _id: { $ifNull: ["$month", "unknown"] }, count: { $sum: 1 } },
      },
      { $sort: { _id: -1 } },
    ]);
    const months = monthsAgg.map((m) => ({
      key: m._id,
      label:
        m._id === "unknown"
          ? "Unknown"
          : new Date(m._id + "-01").toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            }),
      count: m.count,
    }));

    return res.json({
      success: true,
      data: {
        meta: { total, page, limit },
        articles: items,
        months,
      },
    });
  } catch (err) {
    console.error("getArticlesList error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/currentaffairs/:categoryKey/:subId/:articleId
 */
export const getArticleDetail = async (req, res) => {
  try {
    const { categoryKey, subId, articleId } = req.params;
    const lang = getLangFromReq(req);

    const item = await ContentItem.findOne({
      _id: articleId,
      categoryKey,
      subcategoryId: subId,
    }).lean();
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });

    if (req.query.lang && item.language !== lang) {
      return res.status(404).json({
        success: false,
        message: "Article not found for requested language",
      });
    }

    const recent = await ContentItem.find({
      categoryKey,
      subcategoryId: subId,
      _id: { $ne: item._id },
      language: item.language,
    })
      .sort({ date: -1 })
      .limit(8)
      .select("_id title date")
      .lean();

    const monthsAgg = await ContentItem.aggregate([
      {
        $match: { categoryKey, subcategoryId: subId, language: item.language },
      },
      {
        $group: { _id: { $ifNull: ["$month", "unknown"] }, count: { $sum: 1 } },
      },
      { $sort: { _id: -1 } },
    ]);
    const months = monthsAgg.map((m) => ({
      key: m._id,
      label:
        m._id === "unknown"
          ? "Unknown"
          : new Date(m._id + "-01").toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            }),
      count: m.count,
    }));

    return res.json({
      success: true,
      data: { article: item, recentPosts: recent, months },
    });
  } catch (err) {
    console.error("getArticleDetail error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
