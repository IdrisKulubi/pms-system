'use server';
import db from '@/db/drizzle';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { encrypt } from './session';

export async function signUp(email: string, password: string) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) throw new Error('User already exists');
  
  const [newUser] = await db.insert(users).values({
    email,
    password: await encrypt(password),
    role: 'employee', 
    name: email.split('@')[0],
  }).returning();

  return createSession(newUser);
}

export async function login(
  prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  try {
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || user.password !== password) {
      return { error: 'Invalid credentials' };
    }

    // Set user session cookie
    (await
      // Set user session cookie
      cookies()).set('user_id', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { error: null };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An error occurred during login' };
  }
}

async function createSession(user: typeof users.$inferSelect) {
  const session = await encrypt(JSON.stringify(user));
  const cookieStore = cookies();
  
  (await cookieStore).set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
    sameSite: 'lax'
  });

  // Only redirect if we're in a server action
  if (typeof window === 'undefined') {
    redirect('/dashboard');
  }
  return { error: null };
}

export async function getSession() {
  const userId = (await cookies()).get('user_id')?.value;
  if (!userId) return null;

  return db.query.users.findFirst({
    where: eq(users.id, parseInt(userId)),
  });
}

export async function logout() {
  (await cookies()).delete('user_id');
  redirect('/login');
}

export async function clearSession() {
  const cookieStore = cookies();
  (await cookieStore).delete('session');
} 