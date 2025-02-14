import { NextResponse } from 'next/server';
import db from '@/db/drizzle';
import { getSession } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { progressTracking, pillars, kpis, ppsGoals } from '@/db/schema';
import { PPSGoal } from '@/lib/pms-framework';

interface FrameworkPillar {
  id: number;
  name: string;
  weight: string;
  kpis: {
    id: number;
    name: string;
    goals: PPSGoal[];
  }[];
}

export async function GET(
  request: Request,
  context: { params: { paths: string[] } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Properly await and destructure params
    const paths = await Promise.resolve(context.params.paths);
    const path = paths[0];

    // Framework endpoint
    if (path === 'framework') {
      const framework = await db.select().from(pillars)
        .leftJoin(kpis, eq(kpis.pillarId, pillars.id))
        .leftJoin(ppsGoals, eq(ppsGoals.kpiId, kpis.id))
        .then(rows => {
          // Transform the flat data into nested structure
          return rows.reduce((acc: FrameworkPillar[], row) => {
            const pillar = acc.find(p => p.id === row.pillars.id);
            if (!pillar) {
              acc.push({
                ...row.pillars,
                kpis: [{
                  id: row.kpis?.id || 0,
                  name: row.kpis?.name || '',
                  goals: row.pps_goals ? [{
                    ...row.pps_goals,
                    weight: Number(row.pps_goals.weight)
                  }] : []
                }]
              });
            } else {
              const kpi = pillar.kpis.find(k => k.id === row.kpis?.id);
              if (!kpi) {
                pillar.kpis.push({
                  id: row.kpis?.id || 0,
                  name: row.kpis?.name || '',
                  goals: row.pps_goals ? [{
                    ...row.pps_goals,
                    weight: Number(row.pps_goals.weight)
                  }] : []
                });
              } else if (row.pps_goals) {
                kpi.goals.push({
                  ...row.pps_goals,
                  weight: Number(row.pps_goals.weight)
                });
              }
            }
            return acc;
          }, []);
        });

      return NextResponse.json(framework);
    }

    // Progress endpoint
    if (path === 'progress') {
      const progress = await db.query.progressTracking.findMany({
        where: eq(progressTracking.employeeId, session.id),
        with: {
          goal: {
            with: {
              kpi: {
                with: {
                  pillar: true
                }
              }
            }
          }
        }
      });
      return NextResponse.json(progress);
    }

    // Overall progress endpoint
    if (path === 'overall-progress') {
      const progress = await db.select({
        currentProgress: progressTracking.currentProgress,
        weight: progressTracking.weight
      })
      .from(progressTracking)
      .where(eq(progressTracking.employeeId, session.id));

      const totalWeight = progress.reduce(
        (acc, p) => acc + (Number(p.weight) || 0), 
        0
      );
      
      const weightedProgress = progress.reduce(
        (acc, p) => acc + (Number(p.currentProgress) * (Number(p.weight) || 0)) / 100,
        0
      );

      const overallProgress = totalWeight > 0 
        ? Math.round((weightedProgress / totalWeight) * 100)
        : 0;

      return NextResponse.json({ overallProgress });
    }

    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { goalId, progressValue, evidence } = await request.json();
    
    // Update or create progress tracking
    const existing = await db.query.progressTracking.findFirst({
      where: and(
        eq(progressTracking.goalId, goalId),
        eq(progressTracking.employeeId, session.id)
      )
    });

    if (existing) {
      const [updated] = await db.update(progressTracking)
        .set({ 
          currentProgress: progressValue,
          evidence,
          status: 'pending'
        })
        .where(eq(progressTracking.id, existing.id))
        .returning();
      
      return NextResponse.json(updated);
    }

    const [newProgress] = await db.insert(progressTracking)
      .values({
        goalId,
        weight: '100.00',
        employeeId: session.id,
        currentProgress: progressValue,
        target: '100.00', 
        evidence,
        status: 'pending'
      })
      .returning();

    return NextResponse.json(newProgress);

  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}