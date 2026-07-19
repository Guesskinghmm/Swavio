import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Cropper from "react-easy-crop";
import { getAvatarUrl, handleAvatarError } from "../utils/avatarUrl";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Trash2, Star, Calendar, BookOpen, Award, CheckCircle, Mail, MapPin, X, Crop } from "lucide-react";

// ─────────────────────────────────────────────
// Helper: draws the cropped area onto a canvas and returns a Blob
// ─────────────────────────────────────────────
async function getCroppedBlob(imageSrc, croppedAreaPixels) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx    = canvas.getContext("2d");
  canvas.width  = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0, 0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
  });
}

// ─────────────────────────────────────────────
// ImageCropModal
// ─────────────────────────────────────────────
function ImageCropModal({ src, onConfirm, onCancel }) {
  const [crop,              setCrop]              = useState({ x: 0, y: 0 });
  const [zoom,              setZoom]              = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, pxArea) => {
    setCroppedAreaPixels(pxArea);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedBlob(src, croppedAreaPixels);
    onConfirm(blob);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <span className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <Crop size={16} className="text-brand-500" />
            Crop your photo
          </span>
          <button onClick={onCancel} className="btn-ghost btn-sm rounded-lg" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Cropper area */}
        <div className="relative w-full bg-gray-800" style={{ height: 320 }}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-5 py-3 flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-10">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-brand-500"
          />
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
          <button onClick={handleConfirm} className="btn btn-primary btn-md flex-1">
            ✂️ Crop &amp; Use
          </button>
          <button onClick={onCancel} className="btn btn-secondary btn-md flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Profile (main component)
// ─────────────────────────────────────────────
export default function Profile() {
  const loggedInUserId = localStorage.getItem("userId");
  const [user,         setUser]         = useState(null);
  const [showSidebar,  setShowSidebar]  = useState(false);
  const [formData,     setFormData]     = useState({});
  const [previewImage, setPreviewImage] = useState(null);   // base64 preview shown in sidebar
  const [selectedFile, setSelectedFile] = useState(null);   // cropped Blob to upload
  const [cropSrc,      setCropSrc]      = useState(null);   // original data-URL for cropper
  const [showCropper,  setShowCropper]  = useState(false);

  // ── Fetch profile ──────────────────────────
  const fetchProfile = async () => {
    try {
      const res      = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/profile/${loggedInUserId}`
      );
      const userData = res.data;

      // Ensure arrays are always arrays
      userData.skillsToTeach = Array.isArray(userData.skillsToTeach)
        ? userData.skillsToTeach
        : userData.skillsToTeach ? [userData.skillsToTeach] : [];
      userData.skillsToLearn = Array.isArray(userData.skillsToLearn)
        ? userData.skillsToLearn
        : userData.skillsToLearn ? [userData.skillsToLearn] : [];
      userData.availability  = Array.isArray(userData.availability)
        ? userData.availability
        : userData.availability  ? [userData.availability]  : [];

      setUser(userData);
      setFormData(userData);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  useEffect(() => {
    if (loggedInUserId) fetchProfile();
  }, [loggedInUserId]); // eslint-disable-line

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ── Step 1: User picks a file → open cropper ──
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropSrc(reader.result);   // pass original data-URL to cropper
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    // Reset file input so the same file can be re-selected
    e.target.value = "";
  };

  // ── Step 2: User confirms crop → receive Blob ──
  const handleCropConfirm = (blob) => {
    setShowCropper(false);
    setCropSrc(null);

    // Turn the Blob into a File so FormData accepts it
    const file = new File([blob], "profile-crop.jpg", { type: "image/jpeg" });
    setSelectedFile(file);

    // Show preview in the sidebar
    const previewUrl = URL.createObjectURL(blob);
    setPreviewImage(previewUrl);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropSrc(null);
  };

  // ── Save Profile ───────────────────────────
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

      // ✅ FIX: immediately apply the returned user data (includes new profilePicture URL)
      setUser(res.data);
      // ✅ FIX: clear preview so avatar falls through to user.profilePicture
      setPreviewImage(null);
      setSelectedFile(null);
      setCropSrc(null);
      setShowSidebar(false);
      // Silently re-sync badges/counts in the background
      fetchProfile();
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  // ── Delete Profile Picture ─────────────────
  const deleteProfilePicture = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/users/profile-picture/${loggedInUserId}`
      );
      fetchProfile();
      setPreviewImage(null);
      setSelectedFile(null);
    } catch (err) {
      console.error("Failed to delete picture", err);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Avatar source: prefer previewImage (freshly cropped) → resolved saved URL → SVG fallback
  const avatarSrc = previewImage ? previewImage : getAvatarUrl(user.profilePicture);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* ── Crop Modal (renders above everything) ── */}
      {showCropper && cropSrc && (
        <ImageCropModal
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      {/* Profile Header Card */}
      <div className="card card-p flex flex-col sm:flex-row items-center gap-6 mb-6">
        <div className="relative shrink-0">
          <img
            src={avatarSrc}
            onError={handleAvatarError}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
          />
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {user.fullName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
            <Mail size={14} /> {user.email}
          </p>

          {user.location && (
            <p className="text-sm text-gray-400 dark:text-gray-500 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
              <MapPin size={14} /> {user.location}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={
                    star <= Math.round(user.rating || 0)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300 dark:text-gray-700"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {user.rating?.toFixed(1) || "0.0"} ({user.ratingCount || 0} ratings)
            </span>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
            <span className="badge-gray">
              Taught: {user.sessionsTaught || 0} | Learned: {user.sessionsLearned || 0}
            </span>
            {user.badges?.map((badge, i) => (
              <span key={i} className="badge-yellow">{badge}</span>
            ))}
            {user.achievementLevel && (
              <span className="badge-brand">Level: {user.achievementLevel}</span>
            )}
          </div>
        </div>

        {/* Edit / Delete buttons */}
        <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setShowSidebar(true)}
            className="btn btn-primary btn-md w-full"
          >
            <Edit3 size={15} /> Edit Profile
          </button>
          {user.profilePicture && (
            <button onClick={deleteProfilePicture} className="btn btn-danger btn-md w-full">
              <Trash2 size={15} /> Delete Picture
            </button>
          )}
        </div>
      </div>

      {/* About Me */}
      <div className="card card-p mb-6">
        <h2 className="section-heading mb-3 flex items-center gap-2">
          <BookOpen size={16} className="text-brand-500" /> About me
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {user.bio || "No bio available. Add your bio to help others get to know you!"}
        </p>
      </div>

      {/* Skills Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card card-p">
          <h3 className="section-heading mb-3 flex items-center gap-2">
            <Award size={16} className="text-brand-500" /> Skills I can teach
          </h3>
          {user.skillsToTeach?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {user.skillsToTeach.map((skill, i) => (
                <span key={i} className="badge-brand">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500">No skills listed to teach.</p>
          )}
        </div>

        <div className="card card-p">
          <h3 className="section-heading mb-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500" /> Skills I want to learn
          </h3>
          {user.skillsToLearn?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {user.skillsToLearn.map((skill, i) => (
                <span key={i} className="badge-green">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500">No learning goals set yet.</p>
          )}
        </div>
      </div>

      {/* Availability */}
      <div className="card card-p">
        <h2 className="section-heading mb-3 flex items-center gap-2">
          <Calendar size={16} className="text-amber-500" /> Availability
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {Array.isArray(user.availability) && user.availability.length > 0 ? (
            user.availability.map((slot, i) => (
              <span key={i} className="badge-gray">
                {slot.day} ({slot.time})
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500">Not specified</span>
          )}
        </div>
      </div>

      {/* ── Slide-in Sidebar Editor ── */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-white dark:bg-gray-900 z-50 flex flex-col border-l border-gray-200 dark:border-gray-800 shadow-float"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Profile
                </h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="btn-ghost btn-sm rounded-lg"
                  aria-label="Close editor"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">

                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="input py-1.5"
                  />
                  {/* Preview of the cropped result */}
                  {previewImage && (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={previewImage}
                        alt="Cropped Preview"
                        className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-800"
                      />
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✅ Cropped & ready to save
                      </span>
                    </div>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    value={formData.fullName || ""}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Location
                  </label>
                  <input
                    name="location"
                    value={formData.location || ""}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio || ""}
                    onChange={handleChange}
                    rows={3}
                    className="input"
                  />
                </div>

                {/* Skills to Teach */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Skills I Can Teach (comma separated)
                  </label>
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
                    className="input"
                  />
                </div>

                {/* Skills to Learn */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Skills I Want to Learn (comma separated)
                  </label>
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
                    className="input"
                  />
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Availability (e.g. "Mon-Fri Afternoon, Weekends Evening")
                  </label>
                  <input
                    name="availability"
                    value={
                      formData.availability
                        ?.map((slot) => `${slot.day} ${slot.time}`)
                        .join(", ") || ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availability: e.target.value
                          .split(",")
                          .map((item) => {
                            const trimmed = item.trim();
                            if (!trimmed) return null;
                            const parts = trimmed.split(" ");
                            const day   = parts[0] || "Flexible";
                            const time  = parts.slice(1).join(" ") || "Flexible";
                            return { day, time };
                          })
                          .filter(Boolean),
                      })
                    }
                    className="input"
                  />
                </div>
              </div>

              {/* Sidebar Action Buttons */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                <button onClick={handleSave} className="btn btn-primary btn-md flex-1">
                  Save Changes
                </button>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="btn btn-secondary btn-md flex-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
