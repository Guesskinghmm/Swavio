import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { User, Star, Calendar, BookOpen, GraduationCap } from "lucide-react";

export default function OtherProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);

  // Fetch profile of the selected user
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${userId}`);
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [userId]);

  // Submit rating
  const submitRating = async (star) => {
    setRating(star);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/rate/${userId}`,
        { rating: star },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser({
        ...user,
        rating: res.data.newRating,
        ratingCount: res.data.ratingCount,
        badges: res.data.badges,
        achievementLevel: res.data.achievementLevel,
      });

      alert("Rating submitted!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit rating");
    }
  };

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-900 dark:text-gray-100">
      {/* Profile Header */}
      <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-xl flex items-center gap-6 shadow mb-6">
        <img
          src={user.profilePicture || "/default-avatar.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-600"
        />
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" /> {user.fullName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{user.email}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                onClick={() => submitRating(star)}
                className={`w-5 h-5 cursor-pointer ${
                  star <= (rating || Math.round(user.rating || 0))
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-400"
                }`}
              />
            ))}
            <span className="text-sm text-gray-600 dark:text-gray-300">
              ({user.rating?.toFixed(1) || 0}) • {user.ratingCount || 0} ratings
            </span>
          </div>
        </div>
      </div>

      {/* About Me */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" /> About Me
        </h2>
        <p>{user.bio || "No bio added yet"}</p>
      </div>

      {/* Skills Section */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-gray-800 p-5 rounded-xl">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" /> Skills I Can Teach
          </h3>
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
            <p className="text-gray-500 dark:text-gray-400">No skills added yet.</p>
          )}
        </div>

        <div className="bg-green-50 dark:bg-gray-800 p-5 rounded-xl">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-green-500" /> Skills I Want to Learn
          </h3>
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
            <p className="text-gray-500 dark:text-gray-400">No learning goals set.</p>
          )}
        </div>
      </div>

      {/* Availability */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-yellow-500" /> Availability
        </h2>
        <div className="text-gray-600 dark:text-gray-300">
          {Array.isArray(user.availability) && user.availability.length > 0 ? (
            user.availability.map((slot, i) => (
              <span
                key={i}
                className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded mr-1"
              >
                {slot.day} ({slot.time})
              </span>
            ))
          ) : (
            <p>Not specified</p>
          )}
        </div>
      </div>
    </div>
  );
}
