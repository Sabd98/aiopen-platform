'use client';
import GuestRoute from '../components/guard/GuestRoute';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <GuestRoute>
      <LoginForm />
    </GuestRoute>
  );
}