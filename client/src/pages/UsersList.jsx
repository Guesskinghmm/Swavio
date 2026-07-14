import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Users, Star } from "lucide-react";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const loggedInUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
        // Exclude current user
        const filteredUsers = res.data.filter(
          (user) => user._id !== loggedInUserId
        );
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [loggedInUserId]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Users className="w-7 h-7 text-indigo-600" /> Find People
      </h1>

      {users.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">
          No users found.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 flex flex-col items-center text-center transition-transform transform hover:scale-[1.02] hover:shadow-xl"
            >
              <img
                src={user.profilePicture || `/default-avatar.png`}
                alt={user.fullName}
                className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow"
              />

              <h2 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {user.fullName}
              </h2>

              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                {user.bio || "No bio added yet"}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(user.rating || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  ({user.rating?.toFixed(1) || 0})
                </span>
              </div>

              {/* Skills */}
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {user.skillsToTeach?.length ? (
                  user.skillsToTeach.slice(0, 3).map((skill, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-sm text-blue-800 dark:text-blue-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No skills added</span>
                )}
              </div>

              <Link
                to={`/profile/${user._id}`}
                className="mt-5 w-full bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
