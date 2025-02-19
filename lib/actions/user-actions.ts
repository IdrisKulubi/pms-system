'use server';
import  db  from '@/db/drizzle';
import { users, feedback } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { encrypt } from '@/lib/session';
import { isValidEmail } from '@/lib/validators';

export async function addUser(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const email = formData.get('email') as string;
  const role = formData.get('role') as string;

  if (!isValidEmail(email)) {
    return { 
      error: 'Invalid email format. Must be in format: Firstname.Lastname@companydomain.com' 
    };
  }

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return { error: 'User already exists' };
    }

    await db.insert(users).values({
      email: email.toString(),
      role: role.toString() as "super_admin" | "employee" | "manager",
      name: email.split('@')[0].replace('.', ' '),
      password: await encrypt(process.env.DEFAULT_PASSWORD!), 
    });

    return { success: true };
  } catch (error) 
  {
    console.error(error);
    return { error: 'Failed to add user' };
  }
}

export async function getUsers() {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  return db.query.users.findMany();
}

export async function deleteUser(userId: number) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  await db.delete(users).where(eq(users.id, userId));
}

export async function getAllUsers() {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const allUsers = await db.query.users.findMany({
    with: {
      feedback: {
        with: {
          admin: true
        }
      }
    },
    orderBy: [desc(users.createdAt)]
  });

  return allUsers.map(user => ({
    ...user,
    password: undefined
  }));
}

export async function addFeedbackToUser({
  userId,
  comment
}: {
  userId: number;
  comment: string;
}) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const [newFeedback] = await db.insert(feedback)
    .values({
      userId,
      adminId: session.id,
      comment,
    })
    .returning();

  return newFeedback;
} 