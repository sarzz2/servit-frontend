import { Outlet } from 'react-router-dom';
import ServerList from '../components/Server/ServerList';

const ServerLayout: React.FC = () => {
  return (
    <div className="flex">
      {/* Server List always visible */}
      <ServerList />

      {/* The content for the selected route */}
      <Outlet />
    </div>
  );
};

export default ServerLayout;
