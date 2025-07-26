import React, { Dispatch, SetStateAction } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: Dispatch<SetStateAction<string>>;
  type?: string;
  style?: React.CSSProperties;
  className?: string;
}

// The SearchBar functional component, accepting the defined props.
const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  type = "text",
  style,
  className,
}) => {
  return (
    <div className="relative flex-grow w-full sm:w-auto">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        size={20}
      />
      <input
        type={type}
        style={style}
        className={`w-full py-2.9 pl-10 pr-3 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          className || ""
        }`}
        placeholder="Search contacts..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;

// === END OF THE CORRECTED CODE FOR THIS FILE ===
