// controllers/postController.js
const Post = require("../models/Post");
const Class = require("../models/Class");

// @desc    Create a post in a class
// @route   POST /api/classes/:id/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const classId = req.params.id;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    // Check if class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if user is a member of the class
    if (!classData.members.includes(req.user.id)) {
      return res.status(403).json({
        message: "You must be a member of this class to post",
      });
    }

    // Create post
    const post = new Post({
      classId,
      author: req.user.id,
      content: content.trim(),
    });

    await post.save();

    // Populate author info for response
    await post.populate("author", "name major");

    res.status(201).json({
      message: "Post created successfully",
      post: {
        _id: post._id,
        content: post.content,
        author: post.author,
        createdAt: post.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all posts for a class
// @route   GET /api/classes/:id/posts
// @access  Private
exports.getClassPosts = async (req, res) => {
  try {
    const classId = req.params.id;

    // Check if class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if user is a member
    if (!classData.members.includes(req.user.id)) {
      return res.status(403).json({
        message: "You must be a member of this class to view posts",
      });
    }

    // Get posts, most recent first
    const posts = await Post.find({ classId })
      .sort({ createdAt: -1 })
      .populate("author", "name major")
      .limit(50); // Limit to 50 most recent posts

    res.json({
      posts: posts.map((post) => ({
        _id: post._id,
        content: post.content,
        author: post.author,
        createdAt: post.createdAt,
      })),
      count: posts.length,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Class not found" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
