
import { Rocket, User, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="py-4 px-6 md:px-10 flex justify-between items-center border-b border-gray-200">
      <Link to="/" className="flex items-center space-x-2">
        <Rocket className="h-7 w-7 text-purple-600" />
        <span className="text-xl font-semibold text-gray-800">Infinite Game</span>
      </Link>
      <button className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
        <User className="h-5 w-5 text-gray-600" />
        <ChevronDown className="h-4 w-4 text-gray-600" />
      </button>
    </header>
  );
};

export default Header;
