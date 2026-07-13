import React from 'react';

const Badges = () => {
  // Mock achievements — you can fetch these from the server later
  const badges = [
    { title: 'First Match 🎯', achieved: true },
    { title: 'Taught 3 People 🧑‍🏫', achieved: false },
    { title: '5-Star Feedback 🌟', achieved: true },
    { title: 'Learned New Skill 📘', achieved: true }
  ];

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Achievements</h2>
      <ul className="space-y-2">
        {badges.map((badge, idx) => (
          <li
            key={idx}
            className={`p-3 rounded-lg border-l-4 ${
              badge.achieved ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-100'
            }`}
          >
            {badge.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Badges;
