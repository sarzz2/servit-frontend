import React, { useState } from 'react';
import PersonalInformation from '../components/User/PersonalInformation';
import SecuritySettings from '../components/User/SecuritySettings';

const Profile: React.FC = () => {
  const [activeSection, setActiveSection] = useState('personal-info');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal-info':
        return <PersonalInformation />;
      case 'security':
        return <SecuritySettings />;
      default:
        return <PersonalInformation />;
    }
  };

  return (
    <div
      className="flex w-full min-h-screen"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div
        className="w-1/4 p-6 rounded shadow-2xl mr-6 "
        style={{ backgroundColor: 'var(--box-primary)' }}
      >
        <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
        <ul>
          <li
            className={`mb-4 cursor-pointer ${
              activeSection === 'personal-info' ? 'text-blue-500' : ''
            }`}
            onClick={() => setActiveSection('personal-info')}
            style={{ color: 'var(--text-primary)' }}
          >
            Personal Information
          </li>
          <li
            className={`mb-4 cursor-pointer ${
              activeSection === 'security' ? 'text-blue-500' : ''
            }`}
            onClick={() => setActiveSection('security')}
            style={{ color: 'var(--text-primary)' }}
          >
            Security
          </li>
        </ul>
      </div>

      <div
        className="w-3/4 bg-gray-100 p-6 rounded shadow-2xl"
        style={{ backgroundColor: 'var(--box-primary)' }}
      >
        <h2
          className="text-2xl font-semibold mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          {activeSection === 'personal-info'
            ? 'Personal Information'
            : 'Security Settings'}
        </h2>
        <div
          className="p-6 rounded-lg shadow-2xl"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
