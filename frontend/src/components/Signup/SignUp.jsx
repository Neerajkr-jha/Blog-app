import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess("Signup successful! Redirecting to login...");

        setTimeout(() => {
          navigate("/user/signin"); 
        }, 1500);
      } else {
        const text = await response.text();
        setError(text || "Signup failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full sm:w-[350px] text-center border border-zinc-300/60 rounded-2xl px-8 bg-white shadow-xl"
      >
        {/* Title */}
        <h1 className="text-zinc-900 text-3xl mt-10 font-medium">
          Create Account
        </h1>

        <p className="text-zinc-500 text-sm mt-2 pb-6">
          Please sign up to continue
        </p>

        {/* Full Name */}
        <div className="flex items-center w-full mt-4 bg-white border border-zinc-300 h-12 rounded-full pl-6 gap-2">
          <input
            type="text"
            placeholder="Full Name"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            className="bg-transparent text-zinc-600 outline-none text-sm w-full"
            required
          />
        </div>

        {/* Email */}
        <div className="flex items-center w-full mt-4 bg-white border border-zinc-300 h-12 rounded-full pl-6 gap-2">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="bg-transparent text-zinc-600 outline-none text-sm w-full"
            required
          />
        </div>

        {/* Password */}
        <div className="flex items-center mt-4 w-full bg-white border border-zinc-300 h-12 rounded-full pl-6 gap-2">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="bg-transparent text-zinc-600 outline-none text-sm w-full"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        {/* Success / Error Messages */}
        {success && <p className="text-green-600 text-sm mt-3">{success}</p>}
        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        {/* Navigate to Login */}
        <p className="text-zinc-500 text-sm mt-3 mb-11">
          Already have an account?{" "}
           <Link
            to="/user/signin"               
            className="text-indigo-500 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignUp;
