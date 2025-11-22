import Category from "../../../database/models/currentAffairs/category.model.js";
import Subcategory from "../../../database/models/currentAffairs/subcategory.model.js";
// UPDATED MODELS
import Article from "../../../database/models/currentAffairs/article.model.js";
import ArticleDetail from "../../../database/models/currentAffairs/articleDetail.model.js";
import logger from "../../../utils/logger.js";

/**
 * Utility: determine language from request
 */
function getLangFromReq(req) {
  return (req.query.lang || req.headers["x-bb-lang"] || "en").toString();
}

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

/* Categories & Subcategories - UNCHANGED */
export const getCategories = async (req, res) => {
  try {
    const cats = await Category.find({}).sort({ title: 1 }).lean();
    return res.json({ success: true, data: cats || [] });
  } catch (err) {
    logger.error(`getCategories error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllCategoriesWithSubs = async (req, res) => {
  try {
    const cats = await Category.find({}).sort({ title: 1 }).lean();
    const subs = await Subcategory.find({}).sort({ title: 1 }).lean();

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
    logger.error(`getAllCategoriesWithSubs error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCategoryLanding = async (req, res) => {
  try {
    const rawKey = req.params.categoryKey || req.params.category || "";
    const categoryKey = String(rawKey).toLowerCase();

    if (!categoryKey)
      return res
        .status(400)
        .json({ success: false, message: "Missing category" });

    let category = await Category.findById(categoryKey).lean();
    if (!category)
      category = await Category.findOne({ _id: categoryKey }).lean();
    if (!category)
      category = await Category.findOne({ key: categoryKey }).lean();

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const subs = await Subcategory.find({ categoryKey })
      .sort({ title: 1 })
      .lean();

    // counts per subcategory (Using Article model now)
    const subIds = subs.map((s) => s._id);
    const counts = subIds.length
      ? await Article.aggregate([
          { $match: { subcategoryId: { $in: subIds } } }, // Removed isPaid check
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

    return res.json({ success: true, data: { category, tiles } });
  } catch (err) {
    logger.error(`getCategoryLanding error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* LIST ARTICLES - Uses only 'Article' Model (Fast) */
export const getArticlesList = async (req, res) => {
  try {
    const { categoryKey: rawKey, subId } = req.params;
    const categoryKey = String(rawKey || "").toLowerCase();
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

    const filter = { categoryKey, subcategoryId: subId }; // Removed isPaid

    if (month) filter.month = month;
    if (lang) filter.language = lang;

    const qLower = q.toLowerCase();
    const isScope = q && KNOWN_SCOPES.includes(qLower);
    if (isScope && qLower !== "all") {
      filter.scope = new RegExp(
        "^" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
        "i"
      );
    } else if (q) {
      const qRegex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      // Note: We can no longer search 'body' here because it's in a different collection
      // This makes search much faster but limited to title/excerpt
      filter.$or = [{ title: qRegex }, { excerpt: qRegex }];
    }

    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      Article.countDocuments(filter),
      Article.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
    ]);

    const monthsAgg = await Article.aggregate([
      { $match: { categoryKey, subcategoryId: subId, language: lang } },
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
      data: { meta: { total, page, limit }, articles: items, months },
    });
  } catch (err) {
    logger.error(`getArticlesList error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ARTICLE DETAIL - Fetches 'Article' + 'ArticleDetail' */
export const getArticleDetail = async (req, res) => {
  try {
    const { categoryKey, subId, articleId } = req.params;
    const lang = getLangFromReq(req);

    // 1. Fetch Metadata
    const article = await Article.findOne({
      _id: articleId,
      categoryKey,
      subcategoryId: subId,
    }).lean();

    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }

    if (req.query.lang && article.language !== lang) {
      return res.status(404).json({
        success: false,
        message: "Article not found for requested language",
      });
    }

    // 2. Fetch Heavy Content (Body)
    const detail = await ArticleDetail.findOne({
      articleId: article._id,
    }).lean();

    // 3. Breadcrumbs
    const [category, subcategory] = await Promise.all([
      Category.findById(categoryKey).select("title").lean(),
      Subcategory.findById(subId).select("title").lean(),
    ]);

    // 4. Recent Posts (Sidebar)
    const recent = await Article.find({
      categoryKey,
      subcategoryId: subId,
      _id: { $ne: article._id },
      language: article.language,
    })
      .sort({ date: -1 })
      .limit(8)
      .select("_id title date")
      .lean();

    // 5. Monthly Archive (Sidebar)
    const monthsAgg = await Article.aggregate([
      {
        $match: {
          categoryKey,
          subcategoryId: subId,
          language: article.language,
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
        // Merge article metadata + detail body
        article: {
          ...article,
          body: detail?.body || "",
          contentUrl: detail?.contentUrl || "",
        },
        breadcrumbs: {
          category: category?.title,
          subcategory: subcategory?.title,
        },
        recentPosts: recent,
        months: months,
      },
    });
  } catch (err) {
    logger.error(`getArticleDetail error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
