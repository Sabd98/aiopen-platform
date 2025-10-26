'use client';
import GuestRoute from '../components/guard/GuestRoute';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <GuestRoute>
      <RegisterForm />
    </GuestRoute>
  );
}