// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import api from '@/utils/request';
import { Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './index.scss';

const { Title, Text } = Typography;


export default function ProfilePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // load profile data on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get('/profile/me');
        const p = res || {};

        form.setFieldsValue({
          display_name: p.display_name || '',
          bio: p.bio || '',
          role: p.role || '',
          avatar_url: p.avatar_url || '',
        });
        setAvatarPreview(p.avatar_url || '');
      } catch (err) {
        if (err.response?.status === 401) {
          message.error('login required');
        } else {
          message.error('Failed to load profile');
        }
      } finally {
        setInitialLoading(false);
      }
    }

    fetchProfile();
  }, [form]);

  const handleAvatarUpload = async ({ file, onSuccess, onError }) => {
  try {
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const url = res.url;

    if (!url) throw new Error("Upload failed");

    // set avatar url in form and preview
    form.setFieldsValue({ avatar_url: url });
    setAvatarPreview(url);

    message.success("Avatar uploaded");
    onSuccess(res, file);
  } catch (err) {
    console.error(err);
    message.error("Avatar upload failed");
    onError(err);
  } finally {
    setUploadingAvatar(false);
  }
};

  // handle form submission
  const onFinish = async (values) => {
    try {
      setLoading(true);
      await api.put('/profile', values);
      message.success('Profile updated successfully');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update profile';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page-container">
    <Card
      loading={initialLoading}
      className="profile-card"
    >
      <Title level={3}>Profile</Title>
      <Text type="secondary">
        Update your public profile information.
      </Text>

      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
        onFinish={onFinish}
      >
        {/* display_name */}
        <Form.Item
          label="Display name"
          name="display_name"
        >
          <Input placeholder="How your name shows on posts" />
        </Form.Item>

        {/* role */}
        <Form.Item
          label="Role"
          name="role"
        >
          <Input placeholder="e.g. Student, Product Manager, Developer..." />
        </Form.Item>

        {/* bio */}
        <Form.Item
          label="Bio"
          name="bio"
        >
          <Input.TextArea
            rows={4}
            placeholder="Short introduction about yourself"
          />
        </Form.Item>

        {/* avatar_url */}
        <Form.Item label="Avatar">
          <div style={{ marginBottom: 16 }}>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid #ddd',
                }}
              />
            ) : (
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #ddd',
                }}
              >
                No Avatar
              </div>
            )}
          </div>
        <Upload
          customRequest={handleAvatarUpload}
          showUploadList={false}
          multiple={false}
        >
          <Button icon={<PlusOutlined />}>
            {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
          </Button>
        </Upload>

        <Form.Item name="avatar_url" noStyle>
          <Input type="hidden" />
        </Form.Item>
      </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            Save
          </Button>
        </Form.Item>
      </Form>
    </Card>
    </div>
  );
}