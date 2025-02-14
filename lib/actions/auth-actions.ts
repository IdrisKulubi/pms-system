'use server';
import  db  from '@/db/drizzle';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { encrypt, decrypt } from '@/lib/session';
import { getSession } from '@/lib/auth';

export async function resetPassword(userId: number) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  await db.update(users)
    .set({ password: await encrypt('iacl@25') })
    .where(eq(users.id, userId));
}

export async function forcePasswordChange(userId: number) {
  await db.update(users)
    .set({ password: await encrypt('temp-' + Date.now().toString()) })
    .where(eq(users.id, userId));
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.id),
  });

  if (!user) throw new Error('User not found');
  
  // Verify current password
  const decryptedCurrent = await decrypt(user.password);
  if (decryptedCurrent !== currentPassword) {
    throw new Error('Current password is incorrect');
  }

  // Update to new password
  await db.update(users)
    .set({ password: await encrypt(newPassword) })
    .where(eq(users.id, session.id));
} 