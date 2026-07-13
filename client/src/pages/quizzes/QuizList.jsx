import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export default function QuizList() {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) return;

    fetch(`http://localhost:5000/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.skillsToLearn?.length > 0) {
          setSkills(data.skillsToLearn);
        }
      })
      .catch((err) => console.error("❌ Error fetching skills:", err));
  }, []);

  const startQuiz = () => {
    if (selectedSkill) navigate(`/quizzes/attempt/${selectedSkill}`);
  };

  return (
    <motion.div
      className="p-6 max-w-2xl mx-auto text-gray-900 dark:text-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-3xl font-bold mb-6 text-center">
        🧠 Choose a Skill to Test Yourself
      </h2>

      {skills.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 dark:text-gray-400"
        >
          No skills found. Please update your profile to add skills to learn.
        </motion.p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {skills.map((skill, i) => (
            <motion.div
              key={i}
              onClick={() => setSelectedSkill(skill)}
              className={`cursor-pointer border rounded-xl p-5 flex items-center gap-4 shadow hover:shadow-lg transition-all
              ${selectedSkill === skill ? "bg-blue-100 dark:bg-blue-900" : "bg-white dark:bg-gray-800"}`}
              whileHover={{ scale: 1.03 }}
            >
              <Brain
                className={`w-8 h-8 ${
                  selectedSkill === skill ? "text-blue-600" : "text-gray-500 dark:text-gray-300"
                }`}
              />
              <span className="text-lg font-medium">{skill}</span>
            </motion.div>
          ))}
        </div>
      )}

      <button
        disabled={!selectedSkill}
        className={`w-full py-3 text-lg rounded-lg font-semibold transition-all
          ${
            selectedSkill
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
        onClick={startQuiz}
      >
        🚀 Start Quiz
      </button>
    </motion.div>
  );
}
