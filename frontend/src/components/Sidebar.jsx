import { LayoutDashboard, BookOpen, BrainCircuit, BarChart3, Settings, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const navItems = [
  { name: 'Board', icon: LayoutDashboard, path: '/' },
  { name: 'Topics', icon: BookOpen, path: '/topics' },
  { name: 'Reviews', icon: BrainCircuit, path: '/reviews' },
  { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  { name: 'Mock Interview', icon: Zap, path: '/mock-interview' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col shadow-sm">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BrainCircuit className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">PrepFlow</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200'
                )}
              >
                <Icon
                  className={clsx(
                    isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500',
                    'flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors duration-200'
                  )}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
