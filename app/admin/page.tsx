import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Chipmunks Admin',
  robots: { index: false },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const store = await cookies();
  const session = verifyToken(store.get(COOKIE_NAME)?.value);
  const { error } = await searchParams;

  if (!session || session.role !== 'admin') {
    return (
      <LoginForm
        role="admin"
        title="Chipmunks Admin"
        subtitle="Bookings, dates, emails and exports"
        initialError={error || ''}
      />
    );
  }
  return <AdminDashboard />;
}
