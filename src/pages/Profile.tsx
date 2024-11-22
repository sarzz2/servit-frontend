import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PersonalInformation from '../components/User/PersonalInformation';
import SecuritySettings from '../components/User/SecuritySettings';

const Profile: React.FC = () => {
  const [activeSection, setActiveSection] = useState('personal-info');
  const { service } = useParams<{ service: string }>();
  const navigate = useNavigate();
  useEffect(() => {
    if (service !== undefined) {
      setActiveSection(service);
    }
  }, []);

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

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="relative flex w-full min-h-screen">
      <div className="absolute top-6 right-6">
        <i
          className="fas fa-lg fa-times cursor-pointer"
          onClick={handleBack}
        ></i>
      </div>
      <div className="w-1/4 p-6 rounded shadow-2xl mr-6 bg-box-primary">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-text-primary">
            Account Settings
          </h2>
        </div>
        <ul>
          <li
            className={`mb-4 cursor-pointer hover:bg-button-hover dark:hover:bg-dark-button-hover rounded p-2 ${
              activeSection === 'personal-info'
                ? 'bg-button-hover dark:bg-dark-button-hover'
                : 'text-text-primary'
            }`}
            onClick={() => setActiveSection('personal-info')}
          >
            Personal Information
          </li>
          <li
            className={`mb-4 cursor-pointer hover:bg-button-hover dark:hover:bg-dark-button-hover rounded p-2 ${
              activeSection === 'security'
                ? 'bg-button-hover dark:bg-dark-button-hover'
                : 'text-text-primary'
            }`}
            onClick={() => setActiveSection('security')}
          >
            Security
          </li>
        </ul>
      </div>

      <div className="w-3/4 bg-box-primary p-6 rounded shadow-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-text-primary">
          {activeSection === 'personal-info'
            ? 'Personal Information'
            : 'Security Settings'}
        </h2>
        <div className="p-6 rounded-lg shadow-2xl bg-bg-primary">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
