const { Router } = require('express');
const multer = require('multer');
const path = require('path');

const Blog = require('../models/blog');
const Comment = require('../models/comment');

const router = Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('./public/uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Import auth middleware for specific routes
const { checkForAuthenticationCookie } = require('../middlewares/authentication');

// GET all blogs (public)
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({}).populate('createdBy').sort({ createdAt: -1 });
    return res.json({ blogs });
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// GET single blog (public)
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('createdBy');
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    
    const comments = await Comment.find({ blogId: req.params.id })
      .populate('createdBy')
      .sort({ createdAt: -1 });
    
    return res.json({ blog, comments });
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// POST new blog (protected)
router.post('/', checkForAuthenticationCookie('token'), upload.single("coverimg"), async (req, res) => {
  
  if (!req.user) {
   
    return res.status(401).json({ error: "Unauthorized - Please login first" });
  }

  const { title, body } = req.body;

  // Validate required fields
  if (!title || !body) {
    return res.status(400).json({ error: "Title and body are required" });
  }

  try {
    const newBlog = await Blog.create({
      title,
      body,
      coverImageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      createdBy: req.user._id,
    });
    
   
    return res.status(201).json({ success: true, blog: newBlog });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE blog (protected)
router.delete("/:id", checkForAuthenticationCookie("token"), async (req, res) => {
  try {
    // must be logged in
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized - Please login" });
    }

    // find blog
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // only owner can delete
    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You are not allowed to delete this blog" });
    }

    // delete comments linked to this blog
    await Comment.deleteMany({ blogId: req.params.id });

    // delete blog
    await blog.deleteOne();

    return res.json({ success: true, message: "Blog deleted successfully" });

  } catch (err) {
    return res.status(500).json({ error: "Failed to delete blog: " + err.message });
  }
});


// POST comment (protected) - FIXED with better error handling
router.post("/comment/:blogId", checkForAuthenticationCookie('token'), async (req, res) => {
  // console.log('User:', req.user);
  // console.log('Body:', req.body);
  // console.log('Blog ID:', req.params.blogId);
  
  // Check authentication
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized - Please login" });
  }

  // Validate content
  if (!req.body.content || req.body.content.trim() === '') {
    return res.status(400).json({ error: "Comment content is required" });
  }

  try {
    // Check if blog exists
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Create comment
    const newComment = await Comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create comment: " + err.message });
  }
});

module.exports = router;
