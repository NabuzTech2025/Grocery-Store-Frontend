import { Outlet } from 'react-router-dom';

const UserLayout = () => (
  <div>
    <h2>User View</h2>
    <Outlet />
  </div>
);

export default UserLayout;
