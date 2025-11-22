import EbookCategory from "../../../database/models/ebooks/ebookCategory.model.js";
import EbookSubcategory from "../../../database/models/ebooks/ebookSubcategory.model.js";
import Ebook from "../../../database/models/ebooks/ebook.model.js";
import logger from "../../../utils/logger.js";

// 1. Get Categories
export const getEbookCategories = async (req, res) => {
  try {
    const cats = await EbookCategory.find({}).sort({ title: 1 }).lean();
    return res.json({ success: true, data: cats });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 2. Get Subcategories
export const getEbookSubcategories = async (req, res) => {
  try {
    const { categoryKey } = req.params;
    const subs = await EbookSubcategory.find({ categoryKey })
      .sort({ title: 1 })
      .lean();
    return res.json({ success: true, data: subs });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. List E-Books (With Array Language Filter)
export const getEbooksList = async (req, res) => {
  try {
    const { categoryKey, subId } = req.params;
    const { lang, q } = req.query;

    const filter = { categoryKey, subcategoryId: subId };

    // FILTER: MongoDB checks if the string 'lang' exists inside the 'language' array
    if (lang) {
      filter.language = lang;
    }
    // Search by Title
    if (q) {
      filter.title = { $regex: q, $options: "i" };
    }

    const books = await Ebook.find(filter)
      .select("title thumbnail language validity isPaid pdfUrl")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: books });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. Get E-Book Detail
export const getEbookDetail = async (req, res) => {
  try {
    const { ebookId } = req.params;
    const book = await Ebook.findById(ebookId).lean();

    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });

    return res.json({ success: true, data: book });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 5. Track Download
export const trackEbookDownload = async (req, res) => {
  try {
    const { ebookId } = req.params;
    await Ebook.findByIdAndUpdate(ebookId, { $inc: { downloadCount: 1 } });
    return res.json({ success: true, message: "Count updated" });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

// 6. View All (Nested Directory)
export const getAllEbookCategoriesWithSubs = async (req, res) => {
  try {
    const cats = await EbookCategory.find({}).sort({ title: 1 }).lean();
    const subs = await EbookSubcategory.find({}).sort({ title: 1 }).lean();

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
    logger.error(`getAllEbookCategoriesWithSubs error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
