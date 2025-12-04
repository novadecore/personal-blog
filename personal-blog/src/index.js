// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from '@/router';
import 'antd/dist/reset.css';
import './index.scss';

import { ConfigProvider, App as AntApp } from 'antd';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ConfigProvider>
    <AntApp>
      <RouterProvider router={router} />
    </AntApp>
  </ConfigProvider>
);
