import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Home({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

  const fetchBlogs = () => {
    setLoading(true);
    fetch("http://localhost:8000/api/blogs", {
      credentials: "include",
    })
      .then(async (res) => {
        console.log("Response status:", res.status);

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Received HTML instead of JSON:", text);
          throw new Error("Server returned HTML instead of JSON");
        }

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        return res.json();
      })
      .then((data) => {
        console.log(" Fetched blogs:", data);
        setBlogs(data.blogs || []);
      })
      .catch((err) => {
        console.error(" Fetch error:", err);
        setError("Failed to fetch blogs: " + err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    console.log("Fetching blogs...");
    fetchBlogs();
  }, [location.state?.refresh]);

  if (loading) {
    return <div className="text-center mt-10 text-lg">Loading blogs...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-600 text-lg">{error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="container mx-auto px-4 mt-6">
        <h1 className="text-3xl font-bold mb-6">All Blogs</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {blog.coverImageUrl && (
                  <img
                    src={`http://localhost:8000${blog.coverImageUrl}`}
                    alt={blog.title}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="p-4">
                  <h5 className="text-xl font-semibold text-gray-800 mb-2">
                    {blog.title}
                  </h5>
                  <Link
                    to={`/blog/${blog._id}`}
                    className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-lg col-span-full text-center mt-10">
              No blogs found. Be the first to post one!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
