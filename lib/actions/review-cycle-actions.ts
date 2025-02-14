/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';
import  db  from '@/db/drizzle';
import { reviewCycles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function createReviewCycle(data: {
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  if (data.startDate > data.endDate) {
    throw new Error('End date must be after start date');
  }

  if (data.isActive) {
    await db.update(reviewCycles)
      .set({ isActive: false })
      .where(eq(reviewCycles.isActive, true));
  }

  await db.insert(reviewCycles).values({
    name: data.name,
    startDate: data.startDate,
    endDate: data.endDate,
    isActive: data.isActive
  });
}

export async function getReviewCycles() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  return db.query.reviewCycles.findMany({
    orderBy: (cycles, { desc }) => [desc(cycles.createdAt)]
  });
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

export async function updateReviewCycle(data: any) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') throw new Error('Unauthorized');

  if (data.isActive) {
    await db.update(reviewCycles)
      .set({ isActive: false })
      .where(eq(reviewCycles.isActive, true));
  }

  await db.update(reviewCycles)
    .set(data)
    .where(eq(reviewCycles.id, data.id));
}

export async function deleteReviewCycle(cycleId: any) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') throw new Error('Unauthorized');

  await db.delete(reviewCycles)
    .where(eq(reviewCycles.id, cycleId));
} 