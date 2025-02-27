import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Value } from 'react-calendar/dist/cjs/shared/types';

interface CalendarDropdownProps {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
}

const CalendarDropdown: React.FC<CalendarDropdownProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
}) => {
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  const handleDateChange = (
    value: Value,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    setShowCalendar(false);

    if (value === null) return;

    if (Array.isArray(value)) {
      // Handle date range case
      const [start] = value;
      if (start instanceof Date) {
        onChange(start);
      }
    } else if (value instanceof Date) {
      // Handle single date case
      onChange(value);
    }
  };

  const formattedDate = value ? value.toLocaleDateString() : '';

  return (
    <div className="relative">
      <input
        type="text"
        readOnly
        onClick={() => setShowCalendar((prev) => !prev)}
        value={formattedDate}
        placeholder={placeholder}
        className="p-2 rounded w-full cursor-pointer border-none outline-none text-gray-500 dark:text-white bg-bg-secondary dark:bg-dark-secondary"
      />
      {showCalendar && (
        <div className="absolute z-10 mt-2">
          <Calendar onChange={handleDateChange} value={value || new Date()} />
        </div>
      )}
    </div>
  );
};

export default CalendarDropdown;
