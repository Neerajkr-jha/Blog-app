import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        },
      );

      const navigate = useNavigate();
      if (response.ok) {
        navigate('/')
      } else {
        const text = await response.text();
        alert("Signin failed: " + text);
      }
    } catch (error) {
      console.error("Signin error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="sm:w-[350px] w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white shadow-lg"
      >
        <h1 className="text-gray-900 text-3xl mt-10 font-medium">Login</h1>
        <p className="text-gray-500 text-sm mt-2 pb-4">
          Please sign in to continue
        </p>

        {/* Email Field */}
        <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            fill="none"
            stroke="#6B7280"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
            <rect x="2" y="4" width="20" height="16" rx="2" />
          </svg>

          <input
            type="email"
            name="email"
            placeholder="Email id"
            value={formData.email}
            onChange={handleChange}
            className="border-none outline-none ring-0 w-full text-gray-700"
            required
          />
        </div>

        {/* Password Field */}
        <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            fill="none"
            stroke="#6B7280"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="border-none outline-none ring-0 w-full text-gray-700"
            required
          />
        </div>

        {/* Forget Password */}
        <div className="mt-4 text-left text-indigo-500">
          <button type="button" className="text-sm">
            Forget password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-3 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity"
        >
          Login
        </button>

        {/* Signup Link */}
        <p className="text-gray-500 text-sm mt-3 mb-10">
          Don't have an account?{" "}
          <Link to="/user/signup" className="text-indigo-500 hover:underline">
            Create Account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signin;
