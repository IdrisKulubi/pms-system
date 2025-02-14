'use server';
import  db  from '@/db/drizzle';
import { kpis, progressTracking } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';



// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  await db.insert(kpis).values ({
    title: title.toString() || '',
    description: description.toString() || '',
    target: target.toString() || '',
    employeeId: session.id,
    reviewCycleId: activeCycle.id,
    weight: "0.00",
    name: title.toString() || '',
  });

  return { success: true };
}

export async function getEmployeeKPIs() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  return db.query.kpis.findMany({
    where: eq(kpis.employeeId, session.id),
    with: {
      pillar: true,
      ppsGoals: {
        with: {
          progressTracking: {
            where: eq(progressTracking.employeeId, session.id)
          }
        }
      },
      managerReviews: true,
      ceoOverrides: true
    },
  });
} 