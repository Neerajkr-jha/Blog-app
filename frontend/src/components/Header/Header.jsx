import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

function Header() {
  const { user, setUser } = useContext(UserContext);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/user/logout", {
        method: "GET",
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      {/* Left - Brand */}
      <Link
        to="/"
        className="text-2xl font-bold tracking-wide hover:text-indigo-400 transition"
      >
        Blogg
      </Link>

      {/* Right - Navigation */}
      <nav className="flex items-center space-x-6">
        <Link
        to="/"
        className="tracking-wide hover:text-indigo-400 transition"
      >
        Home
      </Link>
        {user ? (
          <>
            {/* Show to signed-in users */}
            <Link
              to="/blog/add-new"
              className="hover:text-indigo-400 transition"
            >
              Add Blog
            </Link>

            <div className="relative group">
              <button className="hover:text-indigo-400 transition">
                {user.fullname || user.email}
              </button>

              <div className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-md w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Show to guests only */}
            <Link
              to="/user/signin"
              className="hover:text-indigo-400 transition"
            >
              Sign In
            </Link>

            <Link
              to="/user/signup"
              className="hover:text-indigo-400 transition"
            >
              Create Account
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
