// src/__tests__/ArticleManagementPage.test.jsx
import React from 'react';
import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import '@testing-library/jest-dom';
import ArticleManagementPage from '../pages/Article/ArticleManagementPage.jsx';

// ---- mocks ----
const mockGet = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();
const mockNavigate = jest.fn();


jest.mock('@/utils/request', () => ({
  get: (...args) => mockGet(...args),
  put: (...args) => mockPut(...args),
  delete: (...args) => mockDelete(...args),
}));

// mock useNavigate
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

let latestPostTableProps;
jest.mock('@/components/PostTable', () => (props) => {
  latestPostTableProps = props;
  return (
    <div data-testid="post-table">
      {props.loading && <span>Loading...</span>}
      {props.posts.map((p) => (
        <div key={p.post_id}>{p.title}</div>
      ))}
    </div>
  );
});

describe('ArticleManagementPage', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPut.mockReset();
    mockDelete.mockReset();
    mockNavigate.mockReset();
    latestPostTableProps = null;
  });

  test('loads current user posts and shows only their posts', async () => {
    const mockProfile = { user_id: 1 };

    const mockPosts = [
      { post_id: 1, user_id: 1, status: 'published', title: 'My Post 1' },
      { post_id: 2, user_id: 1, status: 'draft', title: 'My Post 2' },
      { post_id: 3, user_id: 2, status: 'published', title: 'Other User Post' },
    ];


    mockGet
      .mockResolvedValueOnce(mockProfile)
      .mockResolvedValueOnce(mockPosts);

    render(<ArticleManagementPage />);

    // wait for data loading
    await waitFor(() => {
      expect(screen.getByText('My Post 1')).toBeInTheDocument();
    });

    // shows only current user's posts
    expect(screen.getByText('My Post 1')).toBeInTheDocument();
    expect(screen.getByText('My Post 2')).toBeInTheDocument();

    // not shows other user's post
    expect(screen.queryByText('Other User Post')).not.toBeInTheDocument();

    // use the latest PostTable props to verify
    expect(latestPostTableProps).not.toBeNull();
    expect(latestPostTableProps.posts).toHaveLength(2);

    // request call order
    expect(mockGet).toHaveBeenNthCalledWith(1, '/profile/me');
    expect(mockGet).toHaveBeenNthCalledWith(2, '/posts');
  });

  test('filters posts by keyword', async () => {
    const mockProfile = { user_id: 1 };
    const mockPosts = [
      { post_id: 1, user_id: 1, status: 'published', title: 'First Post' },
      { post_id: 2, user_id: 1, status: 'draft', title: 'Second Note' },
    ];

    mockGet
      .mockResolvedValueOnce(mockProfile)
      .mockResolvedValueOnce(mockPosts);

    render(<ArticleManagementPage />);

    // wait for data loading
    await waitFor(() => {
      expect(screen.getByText('First Post')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search title\/content/i);
    fireEvent.change(searchInput, { target: { value: 'first' } });

    await waitFor(() => {
      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.queryByText('Second Note')).not.toBeInTheDocument();
    });
  });

  test('clicking "Create Article" navigates to /admin/create', async () => {
    const mockProfile = { user_id: 1 };
    const mockPosts = [];

    mockGet
      .mockResolvedValueOnce(mockProfile)
      .mockResolvedValueOnce(mockPosts);

    render(<ArticleManagementPage />);

    // wait for data loading
    await waitFor(() => {
      expect(screen.getByText(/Article Management/i)).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', { name: /create article/i });
    fireEvent.click(createBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/create');
  });

  test('onEdit navigates to edit page with postId', async () => {
    const mockProfile = { user_id: 1 };
    const mockPosts = [
      { post_id: 10, user_id: 1, status: 'draft', title: 'Draft Post' },
    ];

    mockGet
      .mockResolvedValueOnce(mockProfile)
      .mockResolvedValueOnce(mockPosts);

    render(<ArticleManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Draft Post')).toBeInTheDocument();
    });

    // use the latest PostTable props to call onEdit
    expect(latestPostTableProps).not.toBeNull();

    act(() => {
      latestPostTableProps.onEdit(10);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin/create?postId=10');
  });

  test('onDelete calls API and removes post', async () => {
    const mockProfile = { user_id: 1 };
    const mockPosts = [
      { post_id: 1, user_id: 1, status: 'published', title: 'Post To Delete' },
    ];

    mockGet
      .mockResolvedValueOnce(mockProfile)
      .mockResolvedValueOnce(mockPosts);

    mockDelete.mockResolvedValueOnce({});

    render(<ArticleManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Post To Delete')).toBeInTheDocument();
    });

    // use the latest PostTable props to call onDelete
    expect(latestPostTableProps).not.toBeNull();
    await act(async () => {
      await latestPostTableProps.onDelete(1);
    });

    // confirm delete API called
    expect(mockDelete).toHaveBeenCalledWith('/posts/1');

    // not shows this post on the page
    await waitFor(() => {
      expect(screen.queryByText('Post To Delete')).not.toBeInTheDocument();
    });
  });
});
