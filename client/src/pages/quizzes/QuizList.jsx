import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, ArrowRight, BookOpen } from "lucide-react";

export default function QuizList() {
  const [skills,       setSkills]       = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.skillsToLearn?.length > 0) setSkills(data.skillsToLearn);
      })
      .catch((err) => console.error("Error fetching skills:", err));
  }, []);

  const startQuiz = () => {
    if (selectedSkill) navigate(`/quizzes/attempt/${selectedSkill}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={20} className="text-brand-500" />
          <p className="text-xs font-semibold tracking-widest uppercase text-brand-500">
            Skill Assessment
          </p>
        </div>
        <h1 className="page-title">Take a Quiz</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Select a skill from your learning goals to test your knowledge.
        </p>
      </div>

      {skills.length === 0 ? (
        <div className="card card-p flex flex-col items-center gap-4 py-12 text-center">
          <BookOpen size={32} className="text-gray-300 dark:text-gray-600" />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              No skills to quiz on yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Add skills you want to learn in your profile to get started.
            </p>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="btn btn-primary btn-md"
          >
            Update profile
          </button>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {skills.map((skill, i) => {
              const isSelected = selectedSkill === skill;
              return (
                <motion.button
                  key={i}
                  onClick={() => setSelectedSkill(skill)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-300 dark:hover:border-brand-700"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                  }`}>
                    <Brain size={18} />
                  </div>
                  <span className={`text-sm font-medium ${
                    isSelected
                      ? "text-brand-700 dark:text-brand-300"
                      : "text-gray-800 dark:text-gray-200"
                  }`}>
                    {skill}
                  </span>
                  {isSelected && (
                    <ArrowRight size={16} className="ml-auto text-brand-500 shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </div>

          <button
            disabled={!selectedSkill}
            onClick={startQuiz}
            className="btn btn-primary btn-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Brain size={16} />
            {selectedSkill ? `Start Quiz — ${selectedSkill}` : "Select a skill above"}
          </button>
        </>
      )}
    </div>
  );
}
