// client/src/components/BadgeList.jsx
const BadgeList = ({ badges }) => (
  <div className="mt-6">
    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">🏅 Badges Earned</h3>
    {badges.length === 0 ? (
      <p className="text-gray-500 dark:text-gray-300">No badges yet.</p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {badges.map((badge, idx) => (
          <span
            key={idx}
            className="bg-yellow-300 text-black px-3 py-1 rounded-full text-sm font-medium shadow"
          >
            {badge}
          </span>
        ))}
      </div>
    )}
  </div>
);

export default BadgeList;
