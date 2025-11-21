require('dotenv').config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const Blog = require('./models/blog');
const userRoute = require('./routes/user-router');
const blogRoute = require('./routes/blog-route');
const { checkForAtuhenticationCookie } = require('./middlewares/authentication');

const app = express();
const PORT = process.env.PORT || 8000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URL).then(() => console.log("MongoDB connected"));

// View engine setup
app.set('view engine', "ejs");
app.set('views', path.resolve("./views"));


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.resolve("./public")));

app.use(checkForAtuhenticationCookie('token'));

app.use('/api/blogs', blogRoute); 
app.use('/user', userRoute);


app.get('/', async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render('home', {
    user: req.user,
    blogs: allBlogs,
  });
});

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/blogs`);
});
