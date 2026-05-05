import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Search, Bell, User } from 'lucide-react';

export default function Navbar() {
  const dispatch = useDispatch();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 z-10 shadow-sm">
      <div className="flex-1 flex items-center">
        <div className="relative w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
            placeholder="Search questions, topics..."
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors duration-200">
          <Bell className="h-5 w-5" />
        </button>
        <div className="relative flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
            <User className="h-5 w-5 text-indigo-600" />
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
