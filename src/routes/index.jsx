import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Login from '../Pages/Admin/Login';
import Certificates from '../Pages/Admin/Certificates';
import CertificateDetails from '../Pages/Admin/CertificateDetails';
import Settings from '../Pages/Admin/Settings';
import Admins from '../Pages/Admin/Admins';
import Profile from '../Pages/Admin/Profile';
import PublicCertificates from '../Pages/PublicCertificates';
import PublicCertificateDetails from '../Pages/PublicCertificateDetails';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicCertificates />,
  },
  {
    path: '/allcompanies',
    element: <PublicCertificates />,
  },
  {
    path: '/certificate/:id',
    element: <PublicCertificateDetails />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="/admin/certificates" replace />,
      },
      {
        path: 'certificates',
        element: <Certificates />,
      },
      {
        path: 'certificates/:id',
        element: <CertificateDetails />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'users',
        element: <Admins />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
    ],
  },
  {
    path: '*',
    element: <div>404 Not Found</div>,
  },
]);
