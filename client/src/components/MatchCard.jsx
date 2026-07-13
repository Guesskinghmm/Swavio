import { Link } from "react-router-dom";

export default function MatchCard({ user }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="flex items-center gap-4 mb-2">
        <img
          src={user.profilePic || "/default.png"}
          alt={user.fullName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h2 className="text-lg font-semibold">{user.fullName}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
      <p><strong>Teaches:</strong> {user.skillsToTeach?.join(", ")}</p>
      <p><strong>Wants:</strong> {user.skillsToLearn?.join(", ")}</p>

      <div className="mt-3 flex gap-2">
        <Link to={`/portfolio/${user._id}`} className="text-blue-600 underline">
          View Profile
        </Link>
        <Link to="/chat" className="text-green-600 underline">
          Start Chat
        </Link>
      </div>
    </div>
  );
}
