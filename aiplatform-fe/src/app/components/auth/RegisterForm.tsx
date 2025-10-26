
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { RegisterCredentials } from '../../types/auth';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function RegisterForm() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [form] = Form.useForm();

  const handleRegister = async (values: RegisterCredentials) => {
    try {
      clearError();
      await register(values);
      message.success('Registration successful! Welcome!');
      router.push('/'); 
    } catch (err: any) {
      message.error(err.message || 'Registration failed');
    }
  };

  return (
    <main style={{
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
          <Title level={2} style={{ margin: 0, color: '7F7FD5' }}>
            Create Account
          </Title>
          <Text type="secondary">
            Join us today
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
          onFinish={handleRegister}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Please input your username!' },
              { min: 3, message: 'Username must be at least 3 characters!' },
              { max: 50, message: 'Username must be less than 50 characters!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </Form.Item>

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
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
              autoComplete="new-password"
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Text type="secondary">Already have an account?</Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Link href="/login">
            <Button type="link" size="large">
              Sign in instead
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}