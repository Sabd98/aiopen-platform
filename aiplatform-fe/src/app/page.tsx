'use client';
import ProtectedRoute from "./components/guard/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

export default function Home() {
  return (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  );
}
