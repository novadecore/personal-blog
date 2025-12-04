// src/components/PostTable.jsx
import React from 'react';
import PostRow from './PostRow';

const PostTable = ({ posts, loading, onEdit, onChangeStatus, onDelete }) => {
  if (loading) return <p>Loading…</p>;
  if (posts.length === 0) return <p>No posts found.</p>;

  return (
    <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>ID</th>
          <th className="post-title-cell">Title</th>
          <th>Status</th>
          <th>Created At</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {posts.map((post) => (
          <tr key={post.post_id}>
            <PostRow
              post={post}
              onEdit={onEdit}
              onChangeStatus={onChangeStatus}
              onDelete={onDelete}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PostTable;
