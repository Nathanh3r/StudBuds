const Class = require("../models/class");

// GET /api/classes
exports.listClasses = async (req, res) => {
  try {
    const q = (req.query.q || "").toLowerCase();
    let classes = await Class.find().sort({ name: 1 }).lean();

    if (q) {
      classes = classes.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: classes.length, classes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/classes/:id  (by Mongo _id) OR /api/classes/by-code/:code
exports.getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).lean();
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });
    res.json({ success: true, class: cls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/classes/by-code/:code
exports.getClassByCode = async (req, res) => {
  try {
    const cls = await Class.findOne({ code: req.params.code }).lean();
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });
    res.json({ success: true, class: cls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/classes   (admin/test seed)
exports.createClass = async (req, res) => {
  try {
    const { code, name, description, members } = req.body;
    const cls = await Class.create({ code, name, description, members });
    res.status(201).json({ success: true, class: cls });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/classes/:id/join
exports.joinClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(
      req.params.id,
      { $inc: { members: 1 } },
      { new: true }
    );
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });
    res.json({ success: true, class: cls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/classes/:id/leave
exports.leaveClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: "Class not found" });
    cls.members = Math.max(0, (cls.members || 0) - 1);
    await cls.save();
    res.json({ success: true, class: cls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
