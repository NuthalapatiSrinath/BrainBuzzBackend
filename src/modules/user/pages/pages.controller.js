import Page from "../../../database/models/page.model.js";

export const getPage = async (req, res) => {
  try {
    const { slug } = req.params;
    // Check query param ?lang=te, default to 'en'
    const lang = req.query.lang || "en";

    const page = await Page.findOne({ slug, language: lang }).lean();

    if (!page) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }

    return res.json({ success: true, data: page });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
