const { Router } = require('express');
const path = require("path");
const User = require('../models/user');
const { validateToken } = require('../services/authorization');
const multer = require("multer");
const upload = multer({
  dest: path.join(__dirname, "..", "public", "uploads")
});
const { checkForAuthenticationCookie } = require('../middlewares/authentication');

const router = Router();

router.get('/signin', (req, res) => {
  return res.render("signin")
})

router.get("/signup", (req, res) => {
  return res.render("signup")
})

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);

    
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,       // required on production
      sameSite: "none",   // required for cross-domain cookies
      path: "/",
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(401).json({ error: "Incorrect email or Password" });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    await User.create({ fullname, email, password });
    res.status(201).json({ success: true, message: "User created" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/me", (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json({ user: null });

    const user = validateToken(token);
    return res.json({ user });
  } catch (err) {
    return res.json({ user: null });
  }
});

router.get("/logout", (req, res) => {
  
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  return res.json({ success: true });
});

//profile routes
router.get("/profile", checkForAuthenticationCookie("token"), (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  res.json({ user: req.user });
});

router.put(
  "/update",
  checkForAuthenticationCookie("token"),
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const updateData = {
        fullname: req.body.fullname,
      };

      if (req.file) {
        updateData.profileImage = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true }
      );

      res.json({ success: true, user: updatedUser });
    } catch (err) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

module.exports = router;
