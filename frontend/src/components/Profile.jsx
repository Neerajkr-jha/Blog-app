import React, { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);
  const [fullname, setFullname] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false); // <-- NEW

  useEffect(() => {
    fetch("http://localhost:8000/user/profile", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setFullname(data.user.fullname || "");
          setPreviewImage(
            data.user.profileImage
              ? `http://localhost:8000${data.user.profileImage}`
              : ""
          );
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    const formData = new FormData();
    formData.append("fullname", fullname);
    if (profileImage) formData.append("profileImage", profileImage);

    try {
      const res = await fetch("http://localhost:8000/user/update", {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to update profile");
        return;
      }

      setMessage("Profile updated successfully!");
      setIsEditing(false); // exit edit mode
      setUser(data.user);

    } catch (err) {
      setMessage("Error updating profile: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-xl text-gray-600">
        Loading Profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex justify-center items-center text-xl text-red-600">
        No user found. Please log in.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">My Profile</h1>

        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold">
              {user.fullname?.charAt(0).toUpperCase() ||
                user.email?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {message && (
          <div className="mb-4 text-center text-sm text-green-600 font-medium">
            {message}
          </div>
        )}

        {/* ---------------- VIEW PROFILE MODE ---------------- */}
        {!isEditing && (
          <div>
            <p className="text-lg mb-2">
              <span className="font-semibold">Full Name:</span> {user.fullname}
            </p>

            <p className="text-lg mb-6">
              <span className="font-semibold">Email:</span> {user.email}
            </p>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
            >
              Edit Profile
            </button>
          </div>
        )}

        {/* ---------------- EDIT PROFILE MODE ---------------- */}
        {isEditing && (
          <form onSubmit={handleProfileUpdate}>
            <label className="block mb-2 font-medium">Full Name</label>
            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg mb-4"
            />

            <label className="block mb-2 font-medium">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setProfileImage(e.target.files[0]);
                setPreviewImage(URL.createObjectURL(e.target.files[0]));
              }}
              className="w-full border px-3 py-2 rounded-lg mb-6"
            />

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition mb-3"
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="w-full bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;
