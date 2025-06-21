
import { User, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  return (
    <header className="py-4 px-6 md:px-10 flex justify-between items-center border-b border-gray-200 no-print">
      <Link to="/" className="flex items-center space-x-2">
        <img 
          src="/lovable-uploads/3ed0df40-9d9f-4016-bdba-991ba7a3468c.png" 
          alt="Infinite Game Logo" 
          className="h-7 w-7"
        />
        <span className="text-xl font-semibold text-gray-800">Infinite Game</span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
            <User className="h-5 w-5 text-gray-600" />
            <ChevronDown className="h-4 w-4 text-gray-600" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to="/results">View Results (Test)</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;
