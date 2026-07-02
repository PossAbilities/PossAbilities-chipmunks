import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';
import ChampionRegister from '@/components/ChampionRegister';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Chipmunks — Activity Champion register',
  robots: { index: false },
};

export default async function ChampionPage() {
  const store = await cookies();
  const session = verifyToken(store.get(COOKIE_NAME)?.value);

  if (!session) {
    return (
      <LoginForm
        role="champion"
        title="Activity Champions"
        subtitle="Today’s register — check children in and out"
        askName
      />
    );
  }
  return <ChampionRegister championName={session.name || (session.role === 'admin' ? 'Admin' : '')} isAdmin={session.role === 'admin'} />;
}
