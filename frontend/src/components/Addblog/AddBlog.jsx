import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddBlog() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    coverimg: null,
    title: "",
    body: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      data.append("coverimg", formData.coverimg);
      data.append("title", formData.title);
      data.append("body", formData.body);

      // ✅ Updated API endpoint
      const response = await fetch("http://localhost:8000/api/blogs", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      if (response.ok) {
        const resData = await response.json();
        setSuccess("Blog added successfully!");
        setFormData({ coverimg: null, title: "", body: "" });

        // ✅ Navigate to React route (not backend route)
        navigate(`/blog/${resData.blog._id}`);
      } else {
        const resText = await response.text();
        setError("Failed to add blog: " + resText);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="container mx-auto mt-10 px-4">
        <h2 className="text-2xl font-bold mb-6">Add New Blog</h2>

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 space-y-6"
          encType="multipart/form-data"
        >
          {/* Cover Image */}
          <div>
            <label
              htmlFor="coverimg"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cover Image
            </label>
            <input
              type="file"
              id="coverimg"
              name="coverimg"
              onChange={handleChange}
              required
              className="block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter blog title"
              required
              className="block w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Body */}
          <div>
            <label
              htmlFor="body"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Content
            </label>
            <textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              placeholder="Write your blog content..."
              rows="6"
              required
              className="block w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBlog;
