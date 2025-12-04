// src/pages/LoginPage.jsx
import React from 'react';
import './index.scss';
import { App, Button, Card, Form, Input } from 'antd';
import logo from '@/assets/personal_blog.png';
import { useNavigate } from 'react-router-dom';
import request from '@/utils/request';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  // login form submission handler
  const onFinish = async (values) => {
    try {
      // get JSON：{ token, user: { ... } }
      const data = await request.post('/auth/login', {
        email: values.email,
        password: values.password,
      });
      console.log('LOGIN RES >>> ', data); // data.token, data.user.id etc.
      // login success
      message.success('Login successful');
      navigate('/');
    } catch (error) {
      console.log('LOGIN ERROR >>> ', error);

      const status = error.response?.status;
      const respData = error.response?.data || {};

      // wrong credentials: 401 + { error: 'Invalid email or password' }
      if (status === 401) {
        message.error(respData.error || 'Incorrect email or password.');
        return;
      }
      // incomplete form: 400 + { error: 'email/password required' }
      if (status === 400) {
        message.error(respData.error || 'Email and password are required.');
        return;
      }
      // other errors: 500 / network errors etc.
      const msg =
        respData.message ||
        respData.error ||
        error.message ||
        'Login failed. Please try again later.';

      message.error(msg);
    }
  };

  // Registration handler
  const onRegister = async () => {
    try {
      const values = await form.validateFields();
      const res = await request.post('/auth/register', {
        email: values.email,
        password: values.password,
      });
      const data = res?.data ?? res;
      console.log('REGISTER RES >>> ', data);
      // normally just return data
      if (!data || data.error) {
        const msg =
          data?.error ||
          data?.message ||
          'Registration failed.';
        message.error(msg);
        return;
      }
      // automatically log in after registration
      await request.post('/auth/login', {
        email: values.email,
        password: values.password,
      });
      message.success('Registration successful!');
      navigate('/admin/profile');
    } catch (error) {
      console.log('REGISTER ERROR >>> ', error);
      const status = error.response?.status;
      const data = error.response?.data || {};
      // already registered: 409 + { error: 'Email already exists' }
      if (status === 409) {
        message.error(data.error || 'This email is already registered. Please log in instead.');
        return;
      }
      // incomplete form: 400 + { error: 'email/password required' }
      if (status === 400) {
        message.error(data.error || 'Email and password are required.');
        return;
      }
      // other errors: 500 / network errors etc.
      const msg =
        data.message ||
        data.error ||
        error.message ||
        'Registration failed. Please try again later.';

      message.error(msg);
    }
  };

  return (
    <div className="login">
      <Card className="login-container">
        <img className="login-logo" src={logo} alt="logo" />

        <Form
          validateTrigger="onBlur"
          onFinish={onFinish}
          labelCol={{ span: 4 }}
          form={form}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'please type your email' },
              {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email format incorrect',
              },
            ]}
          >
            <Input type="email" size="large" placeholder="please type your email" prefix={<MailOutlined style={{ color: '#6366f1' }} />} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'please type your password' },
            ]}
          >
            <Input.Password size="large" placeholder="please type your password" prefix={<LockOutlined style={{ color: '#6366f1' }} />} />
          </Form.Item>

          <div className="login-buttons">
            {/* Login button */}
            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" block>
                Login
              </Button>
            </Form.Item>

            {/* Registration button */}
            <Form.Item>
              <Button
                type="default"
                htmlType="button"
                size="large"
                block
                onClick={onRegister}
              >
                Register
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
