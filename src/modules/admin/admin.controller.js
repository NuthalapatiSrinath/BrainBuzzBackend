import Media from "../../database/models/media.model.js";
import Subscription from "../../database/models/subscription.model.js";
import logger from "../../utils/logger.js";

/* ==========================================
   MEDIA (Common for all modules)
   ========================================== */

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
    logger.error(`createMedia error: ${err.message}`);
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
    logger.error(`listMedia error: ${err.message}`);
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
    logger.error(`deleteMedia error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ==========================================
   SUBSCRIPTIONS (Admin View)
   ========================================== */

export const listSubscriptions = async (req, res) => {
  try {
    const items = await Subscription.find({})
      .sort({ startAt: -1 })
      .limit(500)
      .lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    logger.error(`listSubscriptions error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
