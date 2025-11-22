import Page from "../../../database/models/page.model.js";
import logger from "../../../utils/logger.js";

export const updatePage = async (req, res) => {
  try {
    const { slug, title, content, images, language } = req.body;

    if (!slug) {
      return res
        .status(400)
        .json({ success: false, message: "Slug is required" });
    }

    // Default to English if not provided
    const lang = language || "en";

    // Update existing or Create new (upsert: true)
    const doc = await Page.findOneAndUpdate(
      { slug, language: lang },
      {
        slug,
        language: lang,
        title,
        content,
        images,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      data: doc,
      message: "Page updated successfully",
    });
  } catch (err) {
    logger.error(`updatePage error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { lang } = req.query;

    const page = await Page.findOne({ slug, language: lang || "en" }).lean();

    if (!page)
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });

    return res.json({ success: true, data: page });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
