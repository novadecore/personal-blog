// src/layouts/PublicLayout.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import PublicLayout from '../../src/pages/layout/PublicLayout.jsx';

function renderWithRouter(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={<div>Public Home Content</div>}
          />
          <Route
            path="/admin"
            element={<div>Admin Page</div>}
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('PublicLayout', () => {
  test('renders layout wrapper and header', () => {
    renderWithRouter(['/']);

    // layout wrapper
    const layout = screen.getByTestId('public-layout');
    expect(layout).toBeInTheDocument();

    // logo with correct alt text
    expect(
      screen.getByAltText(/logo/i)
    ).toBeInTheDocument();

    // admin button in header
    expect(
      screen.getByRole('button', { name: /Manage Site/i })
    ).toBeInTheDocument();
  });

  test('renders child route inside Outlet', () => {
    renderWithRouter(['/']);

    // should see the home content
    expect(
      screen.getByText(/Public Home Content/i)
    ).toBeInTheDocument();
  });

  test('renders different child when route changes', () => {
    renderWithRouter(['/admin']);

    // should see the admin page content
    expect(
      screen.getByText(/Admin Page/i)
    ).toBeInTheDocument();

    // should not see the home content
    expect(
      screen.queryByText(/Public Home Content/i)
    ).not.toBeInTheDocument();
  });
});
