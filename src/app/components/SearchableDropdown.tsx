import { useState, useRef, useEffect } from 'react';

interface SearchableDropdownProps {
  options: string[];
  placeholder: string;
  value: string;
  label: string;
  onChange: (value: string) => void;
}

export default function SearchableDropdown({ 
  options, 
  placeholder, 
  value, 
  label,
  onChange 
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Handle option selection
  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Display text in the dropdown button
  const displayValue = value || placeholder;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      
      {/* Dropdown button */}
      <button
        type="button"
        className="flex justify-between items-center w-full px-4 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{displayValue}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Search input at top of dropdown */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          
          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {/* All option */}
            <div
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${!value ? 'bg-blue-50' : ''}`}
              onClick={() => handleSelect('')}
            >
              {`All ${label}s`}
            </div>
            
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${option === value ? 'bg-blue-50' : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
