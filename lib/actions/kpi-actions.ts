'use server';
import  db  from '@/db/drizzle';
import { kpis } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function createKPI(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'employee') {
    throw new Error('Unauthorized');
  }

  const { title, description, target } = Object.fromEntries(formData.entries());
  const activeCycle = await db.query.reviewCycles.findFirst({
    where: (cycle) => eq(cycle.isActive, true),
  });

  if (!activeCycle) {
    return { error: 'No active review cycle' };
  }

  await db.insert(kpis).values({
    title: title.toString(),
    description: description.toString(),
    target: target.toString(),
    employeeId: session.id,
    reviewCycleId: activeCycle.id,
  });

  return { success: true };
}

export async function getEmployeeKPIs() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  return db.query.kpis.findMany({
    where: (kpi) => eq(kpi.employeeId, session.id),
    with: {
      managerReviews: true,
      ceoOverrides: true,
    },
  });
} 