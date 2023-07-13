import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import MendablePage from './MendablePage.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: '/mendable',
    element: <MendablePage />
  }
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
