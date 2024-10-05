import React from 'react';

interface SaveCancelButtonsProps {
  hasChanges: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const SaveCancelButtons: React.FC<SaveCancelButtonsProps> = ({
  hasChanges,
  onSave,
  onCancel,
}) => {
  if (!hasChanges) return null;

  return (
    <div className="flex justify-end space-x-4 mt-4">
      <button
        className="bg-gray-300 text-black dark:bg-dark-secondary dark:text-white px-4 py-2 rounded-lg"
        onClick={onCancel}
      >
        Cancel
      </button>
      <button className="bg-button-hover px-4 py-2 rounded-lg" onClick={onSave}>
        Save Changes
      </button>
    </div>
  );
};

export default SaveCancelButtons;
