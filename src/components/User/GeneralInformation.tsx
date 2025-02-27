import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const GeneralInformation: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <div className="flex justify-between items-center">
        <h5>Theme</h5>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-opacity-10 hover:bg-accent-color transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          <div className="flex gap-x-3 items-center">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            {theme === 'light' ? 'Dark' : 'Light'}
          </div>
        </button>
      </div>
    </div>
  );
};

export default GeneralInformation;
