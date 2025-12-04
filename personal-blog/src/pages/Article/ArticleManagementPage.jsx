import React, { useEffect, useState } from 'react';
import { Input, Select, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import instance from '@/utils/request';
import PostTable from '@/components/PostTable';
import './index.scss';

const { Search } = Input;
const { Option } = Select;

const ArticleManagementPage = () => {
  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentUserId, setCurrentUserId] = useState(null);

  const navigate = useNavigate();

  // get current user id on mount
  useEffect(() => {
    async function loadMe() {
      try {
        const me = await instance.get('/profile/me');
        setCurrentUserId(me.user_id);
      } catch (e) {
        console.error('Failed to load current user', e);
        setLoading(false);
      }
    }
    loadMe();
  }, []);

  // load user's posts when currentUserId is set
  useEffect(() => {
    if (!currentUserId) return;
    setLoading(true);
    async function load() {
      try {
        const res = await instance.get('/posts');
        const mine = (res || []).filter(
          (p) => p.user_id === currentUserId
        );
        setPosts(mine);
        setFiltered(mine);
      } catch (e) {
        console.error(e);
        message.error('Failed to load posts');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [currentUserId]);

  // filter posts when keyword or statusFilter changes
  useEffect(() => {
    const kw = keyword.trim().toLowerCase();

    const list = posts.filter((p) => {
      const matchKw =
        !kw ||
        p.title.toLowerCase().includes(kw) ||
        (p.content || '').toLowerCase().includes(kw);

      const matchStatus =
        statusFilter === 'all' ||
        (p.status || '').toLowerCase() === statusFilter;

      return matchKw && matchStatus;
    });

    setFiltered(list);
  }, [keyword, statusFilter, posts]);

  // handlers
  const onEdit = (id) => navigate(`/admin/create?postId=${id}`);

  const onChangeStatus = async (post, newStatus) => {
    try {
      await instance.put(`/posts/${post.post_id}`, { status: newStatus });

      setPosts((prev) =>
        prev.map((p) =>
          p.post_id === post.post_id ? { ...p, status: newStatus } : p
        )
      );
      message.success(`Status updated to ${newStatus}`);
    } catch (e) {
      console.error(e);
      message.error('Failed to update status');
    }
  };

  const onDelete = async (id) => {
    try {
      await instance.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.post_id !== id));
      message.success('Deleted');
    } catch {
      message.error('Delete failed');
    }
  };

  return (
    <div className="article-management-page">
      <h2>Article Management</h2>

      <div className="article-management-controls">
        <Search
          placeholder="Search title/content"
          allowClear
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 240 }}
        />

        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 160 }}
        >
          <Option value="all">All</Option>
          <Option value="draft">Draft</Option>
          <Option value="published">Published</Option>
          <Option value="archived">Archived</Option>
        </Select>

        <Button type="primary" onClick={() => navigate('/admin/create')}>
          Create Article
        </Button>
      </div>

      <div className="post-table-wrapper">
        <PostTable
          posts={filtered}
          loading={loading}
          onEdit={onEdit}
          onChangeStatus={onChangeStatus}
          onDelete={onDelete}
          className="article-table"
        />
      </div>
    </div>
  );
};

export default ArticleManagementPage;
