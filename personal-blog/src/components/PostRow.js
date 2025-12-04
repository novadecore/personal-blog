// src/components/PostRow.jsx
import React from 'react';
import { Button, Tag, Popconfirm, Dropdown } from 'antd';

const PostRow = ({ post, onEdit, onChangeStatus, onDelete }) => {
  const renderStatusTag = (statusRaw) => {
    const s = (statusRaw || 'draft').toLowerCase();
    let color = 'default';
    if (s === 'published') color = 'green';
    else if (s === 'draft') color = 'orange';
    else if (s === 'archived') color = 'red';
    return <Tag color={color}>{s}</Tag>;
  };

  const formatDate = (v) => {
    if (!v) return '-';
    const d = new Date(v);
    return d.toLocaleString();
  };

  // Dropdown
  const statusItems = [
    { label: 'Draft', key: 'draft' },
    { label: 'Published', key: 'published' },
    { label: 'Archived', key: 'archived' },
  ];

  return (
    <>
      <td>{post.post_id}</td>
      <td className="post-title-cell">{post.title}</td>
      <td>{renderStatusTag(post.status)}</td>
      <td>{formatDate(post.create_time)}</td>
      <td>
        <Button
          size="small"
          onClick={() => onEdit(post.post_id)}
          style={{ marginRight: 8 }}
        >
          Edit
        </Button>

        <Dropdown
          trigger={['click']}
          menu={{
            items: statusItems,
            onClick: ({ key }) => {
              // keys are 'draft' / 'published' / 'archived'
              onChangeStatus(post, key);
            },
          }}
        >
          <Button size="small" style={{ marginRight: 8 }}>
            Change Status
          </Button>
        </Dropdown>

        <Popconfirm
          title="Delete this post?"
          onConfirm={() => onDelete(post.post_id)}
        >
          <Button danger size="small">Delete</Button>
        </Popconfirm>
      </td>
    </>
  );
};

export default PostRow;
