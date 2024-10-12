import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Overview from './Overview';
import CategoriesAndChannels from './CategoriesAndChannels';

const ServerSettings: React.FC = () => {
  const { serverId } = useParams<{ serverId: string }>();
  const [server, setServer] = useState<any>({});
  const [selectedSetting, setSelectedSetting] = useState<string>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch server data
    axiosInstance
      .get(`/servers/${serverId}`)
      .then((response) => {
        setServer(response.data.server);
      })
      .catch((error) => {
        console.error('Error fetching server data', error);
      });
  }, [serverId]);

  const renderContent = () => {
    switch (selectedSetting) {
      case 'overview':
        return <Overview server={server} setServer={setServer} />;
      case 'categories':
        return <CategoriesAndChannels server={server} />;
      default:
        return <Overview server={server} setServer={setServer} />;
    }
  };

  return (
    <div className="flex w-full h-screen bg-bg-secondary dark:bg-dark-secondary text-primary dark:text-dark-text-primary">
      {/* Sidebar */}
      <aside className="w-1/4 min-w-[250px] bg-bg-primary dark:bg-dark-primary py-6 px-4">
        <ul>
          <li
            className={`py-2 px-4 hover:bg-hover-bg dark:hover:bg-dark-hover cursor-pointer rounded-lg mb-2 ${
              selectedSetting === 'overview'
                ? 'bg-hover-bg dark:bg-dark-hover'
                : ''
            }`}
            onClick={() => setSelectedSetting('overview')}
          >
            Overview
          </li>
          <li
            className={`py-2 px-4 hover:bg-hover-bg dark:hover:bg-dark-hover cursor-pointer rounded-lg mb-2 ${
              selectedSetting === 'categories'
                ? 'bg-hover-bg dark:bg-dark-hover'
                : ''
            }`}
            onClick={() => setSelectedSetting('categories')}
          >
            Categories and Channels
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="w-3/4 bg-bg-secondary dark:bg-dark-secondary p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Server Settings</h2>
          <button
            className="bg-hover-bg p-2 rounded-full"
            onClick={() => navigate('/home/' + serverId)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default ServerSettings;
