// controllers/postController.js
import Post from "../models/Post.js";
import Class from "../models/Class.js";

// @desc    Create a post in a class
// @route   POST /api/classes/:id/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { content, type = "chat" } = req.body;
    const classId = req.params.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (!classData.members.includes(req.user.id)) {
      return res.status(403).json({
        message: "You must be a member of this class to post",
      });
    }

    const post = new Post({
      classId,
      author: req.user.id,
      content: content.trim(),
      type,
    });

    await post.save();
    await post.populate("author", "name major");

    res.status(201).json({
      message: "Post created successfully",
      post: {
        _id: post._id,
        content: post.content,
        type: post.type,
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
export const getClassPosts = async (req, res) => {
  try {
    const classId = req.params.id;
    const { type, limit = 100 } = req.query;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (!classData.members.includes(req.user.id)) {
      return res.status(403).json({
        message: "You must be a member of this class to view posts",
      });
    }

    // Build query
    const query = {
      classId,
      deletedAt: null,
    };

    if (type) {
      query.type = type; // Filter by type if specified
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 }) // Newest first for loading, reverse in frontend
      .populate("author", "name major")
      .limit(parseInt(limit));

    res.json({
      posts: posts.reverse(), // Reverse so oldest is first for chat display
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

// @desc    Delete a post (soft delete)
// @route   DELETE /api/posts/:postId
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only author can delete
    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    // Soft delete
    post.deletedAt = new Date();
    post.content = "[Message deleted]";
    await post.save();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Edit a post
// @route   PUT /api/posts/:postId
// @access  Private
export const editPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this post" });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Content is required" });
    }

    post.content = content.trim();
    post.editedAt = new Date();
    await post.save();
    await post.populate("author", "name major");

    res.json({ message: "Post updated successfully", post });
  } catch (error) {
    console.error("Error editing post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
