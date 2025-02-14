'use server';
import  db  from '@/db/drizzle';
import { kpis, ceoOverrides } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';



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
    return { error: 'No active review cycle - contact your administrator' };  
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
      managerReviews: true,
      ceoOverrides: true
    },
  });
}

export async function getAllKPIs() {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const allKPIs = await db.query.kpis.findMany({
    with: {
      employee: true,
      pillar: true,
      managerReviews: {
        with: {
          manager: true
        }
      },
      ceoOverrides: {
        with: {
          superAdmin: true
        }
      }
    },
    orderBy: [desc(kpis.createdAt)]
  });

  return allKPIs;
}

export async function addCEOOverride({
  kpiId,
  overrideRating,
  overrideComment
}: {
  kpiId: number;
  overrideRating: number;
  overrideComment: string;
}) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const [newOverride] = await db.insert(ceoOverrides)
    .values({
      kpiId,
      superAdminId: session.id,
      overrideRating,
      overrideComment
    })
    .returning();

  return newOverride;
} 