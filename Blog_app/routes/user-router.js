const { Router } = require('express');
const User = require('../models/user');// get user from model/user which has the user schema 
const { validateToken } = require('../services/authorization'); 

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
      sameSite: "lax",
    });
    return res.json({ success: true });
  } catch (error) {
    return res.status(401).json({ error: "Incorrect email or Password" });
  }
});




// router.get('/logout',(req,res)=>{
//     res.clearCookie('token').redirect('/');
// })

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
  res.clearCookie("token");
  return res.json({ success: true });
});



module.exports = router;