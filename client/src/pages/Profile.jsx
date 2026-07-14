import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Trash2 } from "lucide-react";

export default function Profile() {
  const loggedInUserId = localStorage.getItem("userId");
  const [user, setUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [formData, setFormData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [rating, setRating] = useState(0);

  // ✅ Fetch profile
  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/profile/${loggedInUserId}`
      );
      const userData = res.data;

      // Ensure arrays are always arrays
      userData.skillsToTeach = Array.isArray(userData.skillsToTeach)
        ? userData.skillsToTeach
        : userData.skillsToTeach
        ? [userData.skillsToTeach]
        : [];

      userData.skillsToLearn = Array.isArray(userData.skillsToLearn)
        ? userData.skillsToLearn
        : userData.skillsToLearn
        ? [userData.skillsToLearn]
        : [];

      userData.availability = Array.isArray(userData.availability)
        ? userData.availability
        : userData.availability
        ? [userData.availability]
        : [];

      setUser(userData);
      setFormData(userData);
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
    }
  };

  useEffect(() => {
    if (loggedInUserId) fetchProfile();
  }, [loggedInUserId]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Image Selection & Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);

    // Preview Only
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  // ✅ Save Profile
  const handleSave = async () => {
    try {
      let res;
      if (selectedFile) {
        const data = new FormData();
        Object.keys(formData).forEach((key) => {
          if (Array.isArray(formData[key])) {
            data.append(key, JSON.stringify(formData[key]));
          } else {
            data.append(key, formData[key] || "");
          }
        });
        data.append("profilePicture", selectedFile);

        res = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/users/${loggedInUserId}`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        const payload = { ...formData };
        ["skillsToTeach", "skillsToLearn", "availability"].forEach((key) => {
          if (Array.isArray(payload[key])) {
            payload[key] = JSON.stringify(payload[key]);
          }
        });

        res = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/users/${loggedInUserId}`,
          payload
        );
      }

      setUser(res.data);
      setShowSidebar(false);
      setSelectedFile(null);
      setPreviewImage(null);
      alert("✅ Profile Updated!");
      fetchProfile();
    } catch (err) {
      alert("❌ Failed to update profile!");
      console.error(err);
    }
  };

  // ✅ Delete Profile Picture
  const deleteProfilePicture = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/users/profile-picture/${loggedInUserId}`
      );
      alert("🗑 Profile picture deleted!");
      fetchProfile();
      setPreviewImage(null);
      setSelectedFile(null);
    } catch (err) {
      alert("❌ Failed to delete profile picture");
      console.error(err);
    }
  };

  if (!user) {
    return (
      <p className="text-center mt-10 text-gray-700 dark:text-gray-300">
        Loading...
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto p-6 text-gray-900 dark:text-gray-100 relative"
    >
      {/* Profile Header */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-blue-50 dark:bg-gray-800 p-6 rounded-xl flex items-center gap-6 shadow mb-6 transition"
      >
        <img
          src={previewImage || user.profilePicture || "/default-avatar.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow"
        />

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.fullName}</h1>
          <p className="text-gray-600 dark:text-gray-400">{user.email}</p>

          {/* ⭐ Rating Display */}
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{
                  color: star <= Math.round(user.rating || 0) ? "gold" : "gray",
                  fontSize: "22px",
                }}
              >
                ★
              </span>
            ))}
            <span className="text-sm text-gray-600 dark:text-gray-300">
              ({user.rating?.toFixed(1) || 0}) • {user.ratingCount || 0} ratings
            </span>
          </div>

          {/* 🎖️ Badges */}
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full shadow">
              📅 {user.sessionsTaught} Taught | {user.sessionsLearned} Learned
            </span>

            {user.badges?.map((badge, i) => (
              <span
                key={i}
                className="bg-yellow-200 dark:bg-yellow-800 px-3 py-1 rounded-full shadow text-sm"
              >
                {badge}
              </span>
            ))}

            {user.achievementLevel && (
              <span className="bg-green-200 dark:bg-green-800 px-3 py-1 rounded-full shadow text-sm">
                🏅 Achievement: {user.achievementLevel}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* About Me */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow mb-6 transition"
      >
        <h2 className="text-lg font-semibold mb-2">💭 About Me</h2>
        <p className="text-gray-600 dark:text-gray-300">
          {user.bio ||
            "No bio available. Add your bio to help others get to know you!"}
        </p>
      </motion.div>

      {/* Skills Section */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-blue-50 dark:bg-gray-800 p-5 rounded-xl transition"
        >
          <h3 className="font-semibold mb-2">🧑‍🏫 Skills I Can Teach</h3>
          {user.skillsToTeach?.length ? (
            <ul className="flex flex-wrap gap-2">
              {user.skillsToTeach.map((skill, i) => (
                <span
                  key={i}
                  className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No skills added yet.
            </p>
          )}
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-green-50 dark:bg-gray-800 p-5 rounded-xl transition"
        >
          <h3 className="font-semibold mb-2">🎓 Skills I Want to Learn</h3>
          {user.skillsToLearn?.length ? (
            <ul className="flex flex-wrap gap-2">
              {user.skillsToLearn.map((skill, i) => (
                <span
                  key={i}
                  className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No learning goals set.
            </p>
          )}
        </motion.div>
      </div>

      {/* Availability */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow mb-6 transition"
      >
        <h2 className="text-lg font-semibold mb-2">📅 Availability</h2>
        <div className="text-gray-600 dark:text-gray-300">
          {Array.isArray(user.availability) ? (
            user.availability.map((slot, i) => (
              <span
                key={i}
                className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded mr-1"
              >
                {slot.day} ({slot.time})
              </span>
            ))
          ) : (
            user.availability || "Not specified"
          )}
        </div>
      </motion.div>

      {/* ✅ Bottom Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => setShowSidebar(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition transform hover:scale-105"
        >
          <Edit3 className="w-4 h-4" /> Edit Profile
        </button>
        <button
          onClick={deleteProfilePicture}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg shadow transition transform hover:scale-105"
        >
          <Trash2 className="w-4 h-4" /> Delete Picture
        </button>
      </div>

      {/* 🔹 Slide-in Sidebar Editor */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white dark:bg-gray-900 w-96 p-6 h-full shadow-xl overflow-y-auto"
            >
              <h2 className="text-xl font-semibold mb-4">✏ Edit Profile</h2>

              {/* Profile Picture */}
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-700"
                />
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-20 h-20 rounded-full mt-2 object-cover"
                  />
                )}
              </div>

              {/* Full Name */}
              <label className="block mb-1 font-semibold">Full Name</label>
              <input
                name="fullName"
                value={formData.fullName || ""}
                onChange={handleChange}
                className="w-full mb-3 border p-2 rounded dark:bg-gray-800 dark:border-gray-700"
              />

              {/* Location */}
              <label className="block mb-1 font-semibold">Location</label>
              <input
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                className="w-full mb-3 border p-2 rounded dark:bg-gray-800 dark:border-gray-700"
              />

              {/* Bio */}
              <label className="block mb-1 font-semibold">Bio</label>
              <textarea
                name="bio"
                value={formData.bio || ""}
                onChange={handleChange}
                className="w-full mb-3 border p-2 rounded dark:bg-gray-800 dark:border-gray-700"
              />

              {/* Skills to Teach */}
              <label className="block mb-1 font-semibold">Skills I Can Teach</label>
              <input
                name="skillsToTeach"
                value={formData.skillsToTeach?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    skillsToTeach: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full mb-3 border p-2 rounded dark:bg-gray-800 dark:border-gray-700"
              />

              {/* Skills to Learn */}
              <label className="block mb-1 font-semibold">Skills I Want to Learn</label>
              <input
                name="skillsToLearn"
                value={formData.skillsToLearn?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    skillsToLearn: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full mb-3 border p-2 rounded dark:bg-gray-800 dark:border-gray-700"
              />

              {/* Availability */}
              <label className="block mb-1 font-semibold">Availability</label>
              <input
                name="availability"
                value={formData.availability
                  ?.map((slot) => `${slot.day} (${slot.time})`)
                  .join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    availability: e.target.value
                      .split(",")
                      .map((item) => {
                        const [day, time] = item.trim().split(" ");
                        return { day, time: time || "Flexible" };
                      }),
                  })
                }
                className="w-full mb-3 border p-2 rounded dark:bg-gray-800 dark:border-gray-700"
              />

              {/* Save / Cancel Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex-1 transition transform hover:scale-105"
                >
                  💾 Save
                </button>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded flex-1 transition transform hover:scale-105"
                >
                  ❌ Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
