import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  message: React.ReactNode;
  disable: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  disable,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative w-full max-w-md p-8 bg-bg-primary dark:bg-dark-primary rounded-lg shadow-lg">
        <div className="flex justify-center mb-5">
          <img src="/Images/confirmDialogImage.svg" alt="Delete" />
        </div>
        <p className="text-primary dark:text-dark-text-primary mb-6 text-center">
          {message}
        </p>
        <div className="flex justify-between">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed"
            onClick={onConfirm}
            disabled={disable}
          >
            Confirm
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
