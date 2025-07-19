// frontend/src/components/SortDropdown.tsx
import React from "react";
import { ChevronDown } from "lucide-react";

interface SortDropdownProps {
  sortBy: string;
  // onSortChange: (value: string) => void;
  onSortChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}
const SortDropdown: React.FC<SortDropdownProps> = ({
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="relative w-full sm:w-auto">
      <select
        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 mr-20 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition duration-200 shadow-sm cursor-pointer"
        value={sortBy}
        // onChange={(e) => onSortChange(e.target.value)}
        onChange={onSortChange}
      >
        <option value="alphabetical">Alphabetical</option>
        <option value="newlyAdded">Newest First</option>
        <option value="mostRecent">Most Recent</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <ChevronDown size={16} />
      </div>
    </div>
  );
};

export default SortDropdown;
