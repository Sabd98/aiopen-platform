
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { LoginCredentials } from '../../types/auth';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [form] = Form.useForm();

  const handleLogin = async (values: LoginCredentials) => {
    try {
      clearError();
      await login(values);
      message.success('Login successful!');
      router.push('/'); // Redirect to main app
    } catch (err: any) {
      message.error(err.message || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #7F7FD5 0%, #86A8E7 50%, #91EAE4 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
        variant="borderless"
      >
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <Title level={2} style={{ margin: 0, color: '#7F7FD5' }}>
            Welcome Back
          </Title>
          <Text type="secondary">
            Sign in to your account
          </Text>
        </div>

        {error && (
          <div style={{
            background: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
            color: '#cf1322'
          }}>
            {error}
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              style={{
                height: 50,
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Text type="secondary">New to our platform?</Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Link href="/register">
            <Button type="link" size="large">
              Create an account
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}