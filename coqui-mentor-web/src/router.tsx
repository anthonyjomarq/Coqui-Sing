import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { HomePage } from './pages/HomePage';
import { ExercisesPage } from './pages/ExercisesPage';
import { ExerciseDetailPage } from './pages/ExerciseDetailPage';
import { ProgressPage } from './pages/ProgressPage';
import { RecordingsPage } from './pages/RecordingsPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RouteErrorBoundary } from './components/common/RouteErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
        errorElement: <RouteErrorBoundary />
      },
      {
        path: 'exercises',
        element: <ExercisesPage />,
        errorElement: <RouteErrorBoundary />
      },
      {
        path: 'exercises/:id',
        element: <ExerciseDetailPage />,
        errorElement: <RouteErrorBoundary />
      },
      {
        path: 'progress',
        element: <ProgressPage />,
        errorElement: <RouteErrorBoundary />
      },
      {
        path: 'recordings',
        element: <RecordingsPage />,
        errorElement: <RouteErrorBoundary />
      },
      {
        path: 'about',
        element: <AboutPage />,
        errorElement: <RouteErrorBoundary />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
