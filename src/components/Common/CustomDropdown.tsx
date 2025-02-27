import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  selected: string;
  onChange: (value: string) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  selected,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    onChange(value);
    setOpen(false);
  };

  const selectedLabel =
    options.find((opt) => opt.value === selected)?.label || 'Select';

  return (
    <div
      ref={dropdownRef}
      className="relative inline-block text-gray-500 dark:text-white"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full p-2 rounded bg-bg-secondary dark:bg-dark-secondary focus:outline-none"
      >
        <span className="text-gray-500 w-[75px] text-left">
          {selectedLabel}
        </span>
        <span className="ml-2 text-sm">&#9662;</span>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-bg-secondary dark:bg-dark-secondary rounded shadow-lg">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                handleSelect(option.value);
              }}
              className={`cursor-pointer p-2 hover:bg-hover-bg dark:hover:bg-dark-hover ${
                selected === option.value
                  ? 'bg-hover-bg dark:bg-dark-hover'
                  : ''
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
