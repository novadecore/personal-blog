import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import AdminLayout from '../pages/layout/AdminLayout.jsx';


jest.mock('@/utils/request', () => ({
  post: jest.fn(() => Promise.resolve({})),
}));

function renderWithRouter(initialEntries = ['/admin/display']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="display" element={<div>Display Page</div>} />
          <Route path="articles" element={<div>Articles Page</div>} />
          <Route path="create" element={<div>Create Page</div>} />
          <Route path="profile" element={<div>Profile Page</div>} />
        </Route>

        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Public Home</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminLayout', () => {

  test('renders layout with logo and menu', () => {
    renderWithRouter(['/admin/display']);

    // layout wrapper
    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();

    // menu items
    // menu items — allow multiple matches
    expect(screen.getAllByText(/Display/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Articles/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Create/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Profile/i).length).toBeGreaterThan(0);

  });

  test('renders the correct child route', () => {
    renderWithRouter(['/admin/articles']);
    expect(screen.getByText('Articles Page')).toBeInTheDocument();
  });

  test('clicking on menu navigates to page', () => {
    renderWithRouter(['/admin/display']);

    const createMenu = screen.getByText(/Create/i);
    fireEvent.click(createMenu);

    expect(screen.getByText('Create Page')).toBeInTheDocument();
  });

  test('back button navigates to public site', () => {
    renderWithRouter(['/admin/display']);

    const backBtn = screen.getByRole('button', { name: /back to public site/i });
    fireEvent.click(backBtn);

    expect(screen.getByText('Public Home')).toBeInTheDocument();
  });

  test('logout button logs out and navigates to login', async () => {
    renderWithRouter(['/admin/display']);

    const logoutBtn = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutBtn);

    // login page rendered after navigate('/login')
    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });
});
