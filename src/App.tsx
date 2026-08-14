import { Routes, Route, NavLink } from "react-router";

// Simple Page Components for learning
function Home() {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-lg space-y-4 border border-zinc-200 dark:border-zinc-850 transition-all duration-300">
      <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        🏠 Home Page
      </div>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm">
        Welcome to your new React + Tailwind CSS app! This is the Home view managed by React Router.
      </p>
      <div className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg text-zinc-600 dark:text-zinc-300">
        Edit <code className="font-bold">src/App.tsx</code> to write your own code.
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-lg space-y-4 border border-zinc-200 dark:border-zinc-850 transition-all duration-300">
      <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        ℹ️ About Page
      </div>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm">
        You navigated here using React Router. This shows how multiple views can be swapped dynamically.
      </p>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Navigation */}
      <nav className="mb-8 flex space-x-1 bg-zinc-200/80 dark:bg-zinc-800/80 backdrop-blur-md p-1 rounded-xl">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-white dark:bg-zinc-700 text-zinc-950 dark:text-zinc-50 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-white dark:bg-zinc-700 text-zinc-950 dark:text-zinc-50 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`
          }
        >
          About
        </NavLink>
      </nav>

      {/* Route Views */}
      <main className="w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
