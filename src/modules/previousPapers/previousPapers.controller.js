import PaperCategory from "../../database/models/previousPapers/paperCategory.model.js";
import PaperSubcategory from "../../database/models/previousPapers/paperSubcategory.model.js";
import PreviousPaper from "../../database/models/previousPapers/previousPaper.model.js";
import logger from "../../utils/logger.js";

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

// 3. GET Papers List (Page 3 - Image 3)
export const getPapersList = async (req, res) => {
  try {
    const { categoryKey, subId } = req.params;

    const papers = await PreviousPaper.find({
      categoryKey,
      subcategoryId: subId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: papers });
  } catch (err) {
    logger.error(`getPapersList error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. GET Single Paper / Track Download (Page 4 - Image 4)
export const getPaperDetail = async (req, res) => {
  try {
    const { paperId } = req.params;

    // Optional: Increment download count
    const paper = await PreviousPaper.findByIdAndUpdate(
      paperId,
      { $inc: { downloadCount: 1 } },
      { new: true }
    ).lean();

    if (!paper) {
      return res
        .status(404)
        .json({ success: false, message: "Paper not found" });
    }

    return res.json({ success: true, data: paper });
  } catch (err) {
    logger.error(`getPaperDetail error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
