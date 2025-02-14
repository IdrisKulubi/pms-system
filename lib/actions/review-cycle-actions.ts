'use server';
import  db  from '@/db/drizzle';
import { reviewCycles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function createReviewCycle(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const { name: cycle_name, startDate: start_date, endDate: end_date } = Object.fromEntries(formData.entries());

  await db.insert(reviewCycles).values({
    name: cycle_name.toString(),
    startDate: start_date.toString(),
    endDate: end_date.toString(),
    isActive: false,
  });

  return { success: true };
}

export async function activateReviewCycle(cycleId: number) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  await db.transaction(async (tx) => {
    // Deactivate all other cycles
    await tx.update(reviewCycles)
      .set({ isActive: false })
      .where(eq(reviewCycles.isActive, true));

    // Activate selected cycle
    await tx.update(reviewCycles)
      .set({ isActive: true })
      .where(eq(reviewCycles.id, cycleId));
  });
}

export async function getActiveReviewCycle() {
  return db.query.reviewCycles.findFirst({
    where: eq(reviewCycles.isActive, true),
  });
}

export async function getAllReviewCycles() {
  return db.query.reviewCycles.findMany();
} 