import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '🏠', exact: true },
  { to: '/questions', label: 'Question Bank', icon: '📚' },
  { to: '/my-answers', label: 'My Answers', icon: '✏️' },
  { to: '/upload', label: 'Upload Center', icon: '📤' },
  { to: '/analytics', label: 'Analytics', icon: '📊' },
  { to: '/study-plan', label: 'Study Planner', icon: '📅' },
  { to: '/exams', label: 'Exam Profiles', icon: '🎯' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-blue-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-blue-700 font-bold text-lg">E</div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none">ExamAI</h1>
            <p className="text-blue-200 text-xs mt-0.5">Smart Exam Prep</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-blue-700">
        <div className="bg-blue-700 rounded-lg p-3">
          <p className="text-white font-medium text-sm truncate">{user?.name}</p>
          <p className="text-blue-200 text-xs mt-0.5">{user?.targetExam || 'UPSC'} Aspirant</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-orange-300 text-xs">🔥</span>
            <span className="text-orange-300 text-xs font-medium">{user?.currentStreak || 0} day streak</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-white text-blue-700' : 'text-blue-100 hover:bg-blue-700'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-blue-800 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-blue-800 z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
            <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
            <div className="w-5 h-0.5 bg-gray-600"></div>
          </button>
          <span className="font-bold text-blue-700 text-lg">ExamAI</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-orange-500 text-sm">🔥 {user?.currentStreak || 0}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
