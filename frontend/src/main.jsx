import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { UserProvider } from "./context/UserContext";

import Layout from "./Layout.jsx";
import Blog from "./components/Blog/Blog.jsx";
import SignUp from "./components/Signup/SignUp.jsx";
import Signin from "./components/signin/Signin.jsx";
import Home from "./components/Home/Home.jsx";
import AddBlog from "./components/Addblog/AddBlog.jsx";
import Profile from './components/Profile.jsx';


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="/blog/add-new" element={<AddBlog />} />
        <Route path="/user/signup" element={<SignUp />} />
        <Route path="/user/signin" element={<Signin />} />
        <Route path="/user/profile" element={<Profile />} />
      </Route>
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </StrictMode>
);