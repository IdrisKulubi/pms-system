'use server';
import  db  from '@/db/drizzle';
import { managerReviews, ceoOverrides, reviewCycles } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function submitManagerReview(kpiId: number, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'manager') {
    throw new Error('Unauthorized');
  }

  const { rating, comment, approved } = Object.fromEntries(formData.entries());

  await db.insert(managerReviews).values({
    kpiId,
    managerId: session.id,
    rating: Number(rating),
    comment: comment.toString(),
    approved: approved === 'true',
  });

  return { success: true };
}

export async function submitCEOOverride(kpiId: number, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const { rating, comment } = Object.fromEntries(formData.entries());

  await db.insert(ceoOverrides).values({
    kpiId,
    superAdminId: session.id,
    overrideRating: Number(rating),
    overrideComment: comment.toString(),
  });

  return { success: true };
}

export async function getPendingReviews() {
  const session = await getSession();
  if (!session || session.role !== 'manager') {
    throw new Error('Unauthorized');
  }

  return db.query.kpis.findMany({
    where: (kpi) => eq(kpi.reviewCycleId, (db.select().from(reviewCycles).where(eq(reviewCycles.isActive, true)))),
    with: {
      employee: true,
      managerReviews: true,
    },
  });
} 