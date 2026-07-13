import { Users, Sparkles, ArrowRightLeft } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 text-gray-900 dark:text-gray-100">
      <h2 className="text-4xl font-bold mb-6 text-center">About Swavio</h2>
      <p className="text-lg text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
        Swavio is a community-driven platform where people exchange knowledge instead of money.  
        Teach what you know. Learn what you love. Grow together.
      </p>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 text-center">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex justify-center mb-4">
            <ArrowRightLeft className="w-10 h-10 text-indigo-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Exchange Skills</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Trade your knowledge without money — teach what you excel at and learn a new skill in return.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex justify-center mb-4">
            <Users className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Find Your Community</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Connect with learners and mentors across various domains to collaborate and grow together.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-10 h-10 text-yellow-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Grow Your Skills</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Enhance your expertise and explore new interests while helping others achieve their goals.
          </p>
        </div>
      </div>
    </div>
  );
}
