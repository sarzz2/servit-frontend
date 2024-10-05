import React, { createContext, useContext, useState } from 'react';

interface SnackbarProps {
  message: string;
  type: 'success' | 'error';
}

interface SnackbarContextProps {
  showSnackbar: (message: string, type: 'success' | 'error') => void;
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(
  undefined
);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [snackbar, setSnackbar] = useState<SnackbarProps | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({ message, type });
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
      setSnackbar(null);
    }, 3000); // Snackbar disappears after 3 seconds
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {isVisible && snackbar && (
        <div
          className={`fixed top-20 z-50 right-4 p-4 rounded shadow-lg text-white ${
            snackbar.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {snackbar.message}
        </div>
      )}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
