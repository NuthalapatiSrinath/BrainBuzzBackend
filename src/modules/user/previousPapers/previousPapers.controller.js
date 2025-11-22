import PaperCategory from "../../../database/models/previousPapers/paperCategory.model.js";
import PaperSubcategory from "../../../database/models/previousPapers/paperSubcategory.model.js";
import PreviousPaper from "../../../database/models/previousPapers/previousPaper.model.js";
import logger from "../../../utils/logger.js";

// 1. GET Categories (Page 1)
export const getPaperCategories = async (req, res) => {
  try {
    const cats = await PaperCategory.find({}).sort({ title: 1 }).lean();
    return res.json({ success: true, data: cats });
  } catch (err) {
    logger.error(`getPaperCategories error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 2. GET Subcategories (Page 2)
export const getPaperSubcategories = async (req, res) => {
  try {
    const { categoryKey } = req.params;
    const subs = await PaperSubcategory.find({ categoryKey })
      .sort({ title: 1 })
      .lean();
    return res.json({ success: true, data: subs });
  } catch (err) {
    logger.error(`getPaperSubcategories error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. GET Papers List (Page 3)
export const getPapersList = async (req, res) => {
  try {
    const { categoryKey, subId } = req.params;

    const filter = { categoryKey, subcategoryId: subId };
    if (req.query.month) {
      filter.month = req.query.month;
    }

    // A. Main List (Includes pdfUrl, title, logo, etc.)
    const papers = await PreviousPaper.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // B. Recent Papers (For Right Sidebar - Context Aware)
    // Fetches latest 10 papers specifically for THIS subcategory
    const recentPapers = await PreviousPaper.find({
      categoryKey,
      subcategoryId: subId,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title logo createdAt month categoryKey subcategoryId")
      .lean();

    return res.json({ success: true, data: { papers, recentPapers } });
  } catch (err) {
    logger.error(`getPapersList error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. TRACK DOWNLOAD (Replaces getPaperDetail)
// Call this when user clicks the PDF link to increment the counter
export const trackDownload = async (req, res) => {
  try {
    const { paperId } = req.params;

    await PreviousPaper.findByIdAndUpdate(paperId, {
      $inc: { downloadCount: 1 },
    });

    // We don't need to return data, just success
    return res.json({ success: true, message: "Count updated" });
  } catch (err) {
    logger.error(`trackDownload error: ${err.message}`);
    // Don't block the UI if tracking fails, just log it
    return res.status(200).json({ success: false });
  }
};

// 5. GET Recent Papers (Global Widget)
export const getRecentPapers = async (req, res) => {
  try {
    const recent = await PreviousPaper.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title logo createdAt month categoryKey subcategoryId")
      .lean();

    return res.json({ success: true, data: recent });
  } catch (err) {
    logger.error(`getRecentPapers error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 6. GET Paper Archives (Sidebar "Archives" Widget)
export const getPaperArchives = async (req, res) => {
  try {
    const archives = await PreviousPaper.aggregate([
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const formatted = archives.map((a) => ({
      month: a._id || "Unknown",
      label: a._id
        ? new Date(a._id + "-01").toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "Unknown",
      count: a.count,
    }));

    return res.json({ success: true, data: formatted });
  } catch (err) {
    logger.error(`getPaperArchives error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
