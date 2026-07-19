import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Star, Calendar, BookOpen, Award, CheckCircle, Mail, MapPin } from "lucide-react";

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
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header Card */}
      <div className="card card-p flex flex-col sm:flex-row items-center gap-6 mb-6">
        <img
          src={user.profilePicture || "/default-avatar.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
        />
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

          {/* Interactive Rating */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  onClick={() => submitRating(star)}
                  className={`cursor-pointer transition-colors ${
                    star <= (rating || Math.round(user.rating || 0))
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300 dark:text-gray-700 hover:text-amber-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {user.rating?.toFixed(1) || "0.0"} ({user.ratingCount || 0} ratings)
            </span>
          </div>

          {/* Badges / Stats */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
            <span className="badge-gray">
              Taught: {user.sessionsTaught || 0} | Learned: {user.sessionsLearned || 0}
            </span>

            {user.badges?.map((badge, i) => (
              <span key={i} className="badge-yellow">
                {badge}
              </span>
            ))}

            {user.achievementLevel && (
              <span className="badge-brand">
                Level: {user.achievementLevel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* About Me */}
      <div className="card card-p mb-6">
        <h2 className="section-heading mb-3 flex items-center gap-2">
          <BookOpen size={16} className="text-brand-500" /> About me
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {user.bio || "No bio available."}
        </p>
      </div>

      {/* Skills Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card card-p">
          <h3 className="section-heading mb-3 flex items-center gap-2">
            <Award size={16} className="text-brand-500" /> Skills offered
          </h3>
          {user.skillsToTeach?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {user.skillsToTeach.map((skill, i) => (
                <span key={i} className="badge-brand">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500">No skills listed to teach.</p>
          )}
        </div>

        <div className="card card-p">
          <h3 className="section-heading mb-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500" /> Skills wanted
          </h3>
          {user.skillsToLearn?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {user.skillsToLearn.map((skill, i) => (
                <span key={i} className="badge-green">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500">No learning goals set.</p>
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
    </div>
  );
}
