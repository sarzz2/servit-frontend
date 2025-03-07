import React, { useEffect, useRef, useState } from 'react';
import { Server } from '../../types/server';
import { Permission } from '../../types/permission';
import axiosInstance from '../../utils/axiosInstance';

interface MembersProps {
  server: Server;
  members: any[];
}

const Members: React.FC<MembersProps> = ({ server, members }) => {
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const [openOptions, setOpenOptions] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setOpenOptions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleOptions = (friendId: string) => {
    setOpenOptions((prevId) => (prevId === friendId ? null : friendId));
  };

  return (
    <div>
      {members &&
        members.map((member) => (
          <div className="flex justify-between p-4 items-center bg-bg-tertiary dark:bg-dark-tertiary rounded-md">
            <span className="text-md">
              {member.username
                .split('_')
                .map(
                  (word: string) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(' ')}
            </span>
            <div>
              <i
                className="fa fa-ellipsis-vertical cursor-pointer"
                onClick={() => handleToggleOptions(member.id)}
              ></i>
            </div>
            {!openOptions && (
              <div className="absolute right-2 mt-24 w-48 bg-bg-secondary dark:bg-dark-secondary rounded-md shadow-lg z-10 py-2">
                <button className="block w-full text-left px-4 py-2 text-sm text-text-primary dark:text-dark-text-primary hover:bg-hover-bg dark:hover:bg-dark-hover">
                  Kick User
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-hover-bg dark:hover:bg-dark-hover">
                  Ban User
                </button>
                {/* <ConfirmationDialog
                  isOpen={isConfirmDialogOpen}
                  message={`Are you sure you want to remove ${friend.username} from your friend list?`}
                  onConfirm={handleRemoveFriend}
                  onCancel={() => setConfirmDialogOpen(false)}
                  disable={isConfirmModalButtonDisable}
                /> */}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default Members;
