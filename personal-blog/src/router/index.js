// src/router/index.tsx (or .js)
import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '@/pages/Layout/PublicLayout';
import AdminLayout from '@/pages/Layout/AdminLayout';

import Login from '@/pages/Login/LoginPage';
import DisplayPage from '@/pages/Display/DisplayPage';
import ArticleManagementPage from '@/pages/Article/ArticleManagementPage';
import CreateArticlePage from '@/pages/Create/CreateArticlePage';
import ProfilePage from '@/pages/Profile/ProfilePage';

const router = createBrowserRouter([
  // Public area (no sidebar)
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <DisplayPage />,
      },
    ],
  },

  // Admin area (with sidebar)
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/display" />,
      },
      {
        path: 'display',
        element: <DisplayPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'articles',
        element: <ArticleManagementPage />,
      },
      {
        path: 'create',
        element: <CreateArticlePage />,
      },
    ],
  },

  // Login page (no layout)
  {
    path: '/login',
    element: <Login />,
  },
]);

export default router;
