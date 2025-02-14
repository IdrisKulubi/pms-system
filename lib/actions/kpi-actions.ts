'use server';
import  db  from '@/db/drizzle';
import { kpis, ceoOverrides, managerReviews, users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc, and } from 'drizzle-orm';
import { calculateKPIWeights } from '@/db/schema';



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

  // Create the new KPI
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newKPI] = await db.insert(kpis).values({
    title: title.toString() || '',
    description: description.toString() || '',
    target: target.toString() || '',
    employeeId: session.id,
    reviewCycleId: activeCycle.id,
    weight: '0.00', // Temporary weight
    name: title.toString() || '',
  }).returning();

  // Recalculate weights for all KPIs in this cycle
  await calculateKPIWeights(session.id, activeCycle.id);

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

export async function addKPIFeedback({
  kpiId,
  comment,
  rating
}: {
  kpiId: number;
  comment: string;
  rating: number;
}) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const [newFeedback] = await db.insert(ceoOverrides)
    .values({
      kpiId,
      superAdminId: session.id,
      overrideRating: rating,
      overrideComment: comment
    })
    .returning();

  return newFeedback;
}

export async function getEmployeeFeedback() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  // Get manager reviews
  const feedback = await db.select()
    .from(managerReviews)
    .where(eq(managerReviews.kpiId, session.id))
    .leftJoin(users, eq(managerReviews.managerId, users.id))
    .orderBy(desc(managerReviews.createdAt));

  // Get CEO overrides
  const ceoFeedback = await db.select()
    .from(ceoOverrides)
    .where(eq(ceoOverrides.kpiId, session.id))
    .leftJoin(users, eq(ceoOverrides.superAdminId, users.id))
    .orderBy(desc(ceoOverrides.createdAt));

  return {
    managerFeedback: feedback.map(f => ({
      id: f.manager_reviews.id,
      rating: f.manager_reviews.rating,
      comment: f.manager_reviews.comment,
      createdAt: f.manager_reviews.createdAt,
      manager: f.users ? {
        name: f.users.name
      } : undefined
    })),
    ceoFeedback: ceoFeedback.map(f => ({
      id: f.ceo_overrides.id,
      overrideRating: f.ceo_overrides.overrideRating,
      overrideComment: f.ceo_overrides.overrideComment,
      createdAt: f.ceo_overrides.createdAt,
      superAdmin: f.users ? {
        name: f.users.name
      } : undefined
    }))
  };
}

// Add a function to get KPI weights
export async function getKPIWeights(employeeId: number, reviewCycleId: number) {
  const kpiWeights = await db.query.kpis.findMany({
    where: and(
      eq(kpis.employeeId, employeeId),
      eq(kpis.reviewCycleId, reviewCycleId)
    ),
    columns: {
      id: true,
      weight: true
    }
  });

  return kpiWeights;
} 