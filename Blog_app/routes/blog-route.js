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
const { checkForAtuhenticationCookie } = require('../middlewares/authentication');

// GET all blogs (public)
router.get('/', async (req, res) => {
  try {
    console.log('✅ GET /api/blogs hit - Fetching all blogs');
    const blogs = await Blog.find({}).populate('createdBy').sort({ createdAt: -1 });
    console.log(`✅ Found ${blogs.length} blogs`);
    return res.json({ blogs });
  } catch (error) {
    console.error('❌ Error fetching blogs:', error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// GET single blog (public)
router.get('/:id', async (req, res) => {
  try {
    console.log('✅ GET /api/blogs/:id hit');
    const blog = await Blog.findById(req.params.id).populate('createdBy');
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    
    const comments = await Comment.find({ blogId: req.params.id })
      .populate('createdBy')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found blog with ${comments.length} comments`);
    return res.json({ blog, comments });
  } catch (error) {
    console.error('❌ Error fetching blog:', error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// POST new blog (protected)
router.post('/', checkForAtuhenticationCookie('token'), upload.single("coverimg"), async (req, res) => {
  console.log('✅ POST /api/blogs route hit');
  console.log('User:', req.user);
  console.log('File:', req.file);
  console.log('Body:', req.body);
  
  if (!req.user) {
    console.log('❌ No user found - Unauthorized');
    return res.status(401).json({ error: "Unauthorized - Please login" });
  }

  const { title, body } = req.body;
  const coverimg = req.file;

  try {
    const newBlog = await Blog.create({
      title,
      body,
      coverImageUrl: coverimg ? `/uploads/${coverimg.filename}` : undefined,
      createdBy: req.user._id,
    });
    console.log('✅ Blog created:', newBlog._id);
    res.status(201).json({ success: true, blog: newBlog });
  } catch (err) {
    console.error('❌ Error creating blog:', err);
    res.status(400).json({ error: err.message });
  }
});

// POST comment (protected) - FIXED with better error handling
router.post("/comment/:blogId", checkForAtuhenticationCookie('token'), async (req, res) => {
  console.log('✅ POST /api/blogs/comment/:blogId hit');
  console.log('User:', req.user);
  console.log('Body:', req.body);
  console.log('Blog ID:', req.params.blogId);
  
  // Check authentication
  if (!req.user) {
    console.log('❌ No user found - Unauthorized');
    return res.status(401).json({ error: "Unauthorized - Please login" });
  }

  // Validate content
  if (!req.body.content || req.body.content.trim() === '') {
    console.log('❌ Empty comment content');
    return res.status(400).json({ error: "Comment content is required" });
  }

  try {
    // Check if blog exists
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      console.log('❌ Blog not found');
      return res.status(404).json({ error: "Blog not found" });
    }

    // Create comment
    const newComment = await Comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });

    console.log('✅ Comment created:', newComment._id);
    return res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    console.error('❌ Error creating comment:', err);
    return res.status(500).json({ error: "Failed to create comment: " + err.message });
  }
});

module.exports = router;
