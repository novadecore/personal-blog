import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import DisplayPage from '../pages/Display/DisplayPage.jsx';

// mock request instance
const mockGet = jest.fn();

jest.mock('@/utils/request', () => ({
  get: (...args) => mockGet(...args),
}));

// mock PostCard component
jest.mock('@/components/PostCard', () => (props) => {
  return (
    <div data-testid="post-card">
      {props.post.title}
    </div>
  );
});

describe('DisplayPage', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  test('shows "No profile" and "No posts" when profile is null', async () => {
    mockGet.mockResolvedValueOnce(null);

    render(<DisplayPage />);

    // wait for profile loading to finish
    await waitFor(() => {
      expect(screen.getByText(/No profile found\./i)).toBeInTheDocument();
    });

    // wait for posts loading to finish
    expect(screen.getByText('Loading posts...')).toBeInTheDocument();

    // confirm only profile request was made
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('/profile/me');
  });

  test('renders profile info and only current user published posts', async () => {
    const mockProfile = {
      user_id: 1,
      avatar_url: 'http://example.com/avatar.jpg',
      display_name: 'Nova',
      role: 'Writer',
      bio: 'Hello world',
    };

    const mockPosts = [
      {
        post_id: 1,
        user_id: 1,
        status: 'PUBLISHED',
        title: 'My Published Post',
      },
      {
        post_id: 2,
        user_id: 1,
        status: 'draft',
        title: 'My Draft Post',
      },
      {
        post_id: 3,
        user_id: 2,
        status: 'published',
        title: 'Other User Post',
      },
    ];

    // mock API responses
    mockGet
      .mockResolvedValueOnce(mockProfile)
      .mockResolvedValueOnce(mockPosts);

    render(<DisplayPage />);

    // wait for profile loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading profile/i)).not.toBeInTheDocument();
    });

    // profile info rendered
    expect(screen.getByText('Nova')).toBeInTheDocument();
    expect(screen.getByText(/Role:/i)).toBeInTheDocument();
    expect(screen.getByText(/Writer/i)).toBeInTheDocument();
    expect(screen.getByText(/Bio:/i)).toBeInTheDocument();
    expect(screen.getByText(/Hello world/i)).toBeInTheDocument();

    // wait for posts loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading posts/i)).not.toBeInTheDocument();
    });

    // only current user's published post is rendered
    const postCards = screen.getAllByTestId('post-card');
    expect(postCards).toHaveLength(1);
    expect(postCards[0]).toHaveTextContent('My Published Post');

    // other posts are not rendered
    expect(screen.queryByText('My Draft Post')).not.toBeInTheDocument();
    expect(screen.queryByText('Other User Post')).not.toBeInTheDocument();

    // confirm only profile request was made
    expect(mockGet).toHaveBeenNthCalledWith(1, '/profile/me');
    expect(mockGet).toHaveBeenNthCalledWith(2, '/posts');
  });
});
