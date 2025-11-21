import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../../context/UserContext"; 

function Blog() {
  const { user } = useContext(UserContext); 
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    console.log("🔍 Current user from context:", user);
    console.log("🔍 User is logged in:", !!user);
  }, [user]);

  useEffect(() => {
    fetchBlogAndComments();
  }, [id]);

  const fetchBlogAndComments = () => {
    setLoading(true);

    fetch(`http://localhost:8000/api/blogs/${id}`, {
      credentials: "include",
    })
      .then(async (res) => {
        console.log("Response status:", res.status);

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Received HTML:", text);
          throw new Error("Server returned HTML instead of JSON");
        }

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        return res.json();
      })
      .then((data) => {
        setBlog(data.blog);
        setComments(data.comments || []);
      })
      .catch((err) => {
        setError("Failed to load blog: " + err.message);
      })
      .finally(() => setLoading(false));
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    console.log("🔵 Starting comment submission...");
    console.log("🔵 Blog ID:", id);
    console.log("🔵 Comment text:", commentText);
    console.log("🔵 User:", user);

    if (!user) {
      setCommentError("Please log in to comment");
      return;
    }

    if (!commentText.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }

    setCommentLoading(true);
    setCommentError("");

    const url = `http://localhost:8000/api/blogs/comment/${id}`;
    console.log("🔵 Posting to URL:", url);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content: commentText }),
      });

      console.log("🔵 Response status:", response.status);

      const responseText = await response.text();
      console.log("🔵 Response text:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("❌ Failed to parse JSON:", e);
        console.error("❌ Response was:", responseText);
        throw new Error("Server returned invalid JSON");
      }

      if (response.ok) {
        console.log("✅ Comment added successfully:", data);
        setCommentText("");
        fetchBlogAndComments();
      } else {
        console.error("❌ Error response:", data);
        setCommentError(data.error || "Failed to add comment");
      }
    } catch (err) {
      console.error("❌ Failed to add comment:", err);
      setCommentError("Failed to add comment: " + err.message);
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-700">Loading blog...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-600 text-xl">Blog not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Blog content */}
      <div className="container mx-auto mt-8 px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">{blog.title}</h1>

        {blog.coverImageUrl && (
          <img
            src={`http://localhost:8000${blog.coverImageUrl}`}
            alt={blog.title}
            className="w-full rounded-lg shadow-md mb-6"
          />
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <pre className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed font-sans">
            {blog.body}
          </pre>
        </div>

        {/* Author Section */}
        {blog.createdBy && (
          <div className="flex items-center gap-3 mb-8 pb-6 border-b">
            {blog.createdBy.profileImage ? (
              <img
                src={`http://localhost:8000${blog.createdBy.profileImage}`}
                alt={blog.createdBy.fullname || "Author"}
                className="w-12 h-12 rounded-full border object-cover bg-gray-200"
                onError={(e) => {
                  console.error("❌ Failed to load image:", e.target.src);
                  // Fallback to initial avatar
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "flex";
                }}
              />
            ) : null}

            {/* Fallback Avatar */}
            <div
              className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold"
              style={{ display: blog.createdBy.profileImage ? "none" : "flex" }}
            >
              {(blog.createdBy.fullname || blog.createdBy.email)
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <p className="text-gray-600 text-sm">Written by</p>
              <p className="text-gray-800 font-medium">
                {blog.createdBy.fullname || blog.createdBy.email}
              </p>
            </div>
          </div>
        )}

        {/* Comment Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Comments ({comments.length})
          </h2>

          {user ? (
            <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Add a Comment</h3>
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  disabled={commentLoading}
                />

                {commentError && (
                  <div className="mt-2 text-red-600 text-sm">
                    {commentError}
                  </div>
                )}

                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={commentLoading || !commentText.trim()}
                    className={`bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors ${
                      commentLoading || !commentText.trim()
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {commentLoading ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-yellow-800">
                Please{" "}
                <a
                  href="/user/signin"
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  sign in
                </a>{" "}
                to leave a comment.
              </p>
            </div>
          )}

          {/* Comment List */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                >
                  {comment.createdBy?.profileImage ? (
                    <img
                      src={`http://localhost:8000${comment.createdBy.profileImage}`}
                      alt={comment.createdBy.fullname}
                      className="w-10 h-10 rounded-full border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                      {(
                        comment.createdBy?.fullname ||
                        comment.createdBy?.email ||
                        "A"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">
                        {comment.createdBy?.fullname ||
                          comment.createdBy?.email ||
                          "Anonymous"}
                      </span>
                      {comment.createdAt && (
                        <span className="text-gray-500 text-xs">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="text-gray-400 text-5xl mb-3">💬</div>
                <p className="text-gray-500">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Blog;
