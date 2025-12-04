// src/pages/Create/CreateArticlePage.jsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Radio, Button, message } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import api from '@/utils/request';
import './index.scss';


const { TextArea } = Input;

const CreateArticlePage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // if there's a postId query param, we're in edit mode
  const postId = searchParams.get('postId');

  const [imageUrls, setImageUrls] = useState([]); // uploaded image URLs
  const [uploading, setUploading] = useState(false);

  // load existing post data if editing
  useEffect(() => {
    if (!postId) return;

    async function loadPost() {
      try {
        const data = await api.get(`/posts/${postId}`);

        form.setFieldsValue({
          title: data.title || '',
          content: data.content || '',
          status: data.status || 'draft',
          imageMode: data.image_mode || 'none',
        });

        if (data.images && data.images.length > 0) {
          setImageUrls(data.images.map(img => img.image_url));
        }
      } catch (err) {
        console.error(err);
        message.error('Failed to load article');
      }
    }

    loadPost();
  }, [postId, form]);

  const imageMode = Form.useWatch('imageMode', form);
  const maxCount =
  imageMode === 'triple' ? 3 :
  imageMode === 'single' ? 1 :
  0;

  // form submission handler
  const onFinish = async (values) => {
    try {
      const { title, content, status, imageMode } = values;
      const image_mode = imageMode === 'none' ? null : imageMode;

      if (postId) {
        // editing: PUT /posts/:id
        await api.put(`/posts/${postId}`, {
          title,
          content,
          status,
          image_mode,
          image_urls: imageUrls,
        });
        message.success('Article updated');
      } else {
        // creating: POST /posts/new
        await api.post('/posts/new', {
          title,
          content,
          status,
          image_mode,
          image_urls: imageUrls,
        });
        message.success('Article created');
      }

      navigate('/admin/articles');
    } catch (err) {
      console.error(err);
      message.error('Failed to submit article');
    }
  };

  const handleCustomUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      // upload to backend
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log("UPLOAD RESPONSE:", res);

      const url = res.url;
      if (!url) {
        throw new Error('No url in upload response');
      }
      
      setImageUrls((prev) => [...prev, url]);
      onSuccess(res.data, file); // notify success
      message.success('Image uploaded');
    } catch (err) {
      console.error(err);
      message.error('Image upload failed');
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  // prepare file list for upload component
  const uploadFileList = imageUrls.map((url, index) => ({
    uid: String(index),
    name: `image-${index}`,
    status: 'done',
    url,
  }));

  return (
    <div className="create-article-page">
      <div className="create-article-page__inner">
        <h2 className="create-article-page__title">
          {postId ? 'Edit Article' : 'Create Article'}
        </h2>

      <Form className="create-article-page__form"
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          status: 'draft',
          imageMode: 'none',
        }}
      >
        {/* Title */}
        <Form.Item
          label="Title"
          name="title"
          rules={[
            { required: true, message: 'Please input the title' },
          ]}
        >
          <Input placeholder="Enter article title" />
        </Form.Item>

        {/* Content */}
        <Form.Item
          label="Content"
          name="content"
          rules={[
            { required: true, message: 'Please input the content' },
          ]}
        >
          <TextArea
            rows={6}
            placeholder="Write your article content here"
          />
        </Form.Item>

        {/* Status */}
        <Form.Item label="Status" name="status">
          <Radio.Group>
            <Radio value="draft">Draft</Radio>
            <Radio value="published">Published</Radio>
            <Radio value="archived">Archived</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Image mode */}
        <Form.Item label="Image mode" name="imageMode">
          <Radio.Group>
            <Radio value="none">No image</Radio>
            <Radio value="single">1 image</Radio>
            <Radio value="triple">3 images</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Image upload */}
        {maxCount > 0 && (
          <Form.Item label="Images">
            <Upload
              listType="picture-card"
              fileList={uploadFileList}
              customRequest={handleCustomUpload}
              multiple
              maxCount={maxCount}
              showUploadList={{ showPreviewIcon: false }}
              onRemove={(file) => {
                setImageUrls((prev) => prev.filter((url) => url !== file.url));
              }}
            >
              {uploadFileList.length >= maxCount ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </div>
                </div>
              )}
            </Upload>
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {postId ? 'Save Changes' : 'Create'}
          </Button>
        </Form.Item>
      </Form>
      </div>
    </div>
  );
};

export default CreateArticlePage;