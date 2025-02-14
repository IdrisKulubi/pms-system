'use server';
import db from '@/db/drizzle';
import { progressTracking } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

interface ProgressActionState {
  error?: string | null;
  success?: boolean;
}

/**
 * Handles progress submission for KPI goals
 * @param prevState Previous form state
 * @param formData Form data containing progress details
 */
export async function submitEvidence(
  prevState: ProgressActionState | null,
  formData: FormData
): Promise<ProgressActionState> {
  try {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');

    // Extract form data
    const goalId = formData.get('goalId')?.toString();
    const currentProgress = formData.get('progress')?.toString();
    const comments = formData.get('comments')?.toString();

    if (!goalId || !currentProgress) {
      return { error: 'Missing required fields' };
    }

    // Update progress tracking
    const existing = await db.query.progressTracking.findFirst({
      where: and(
        eq(progressTracking.goalId, parseInt(goalId)),
        eq(progressTracking.employeeId, session.id)
      )
    });

    if (existing) {
      await db.update(progressTracking)
        .set({ 
          currentProgress,
          evidence: comments,
          status: 'pending',
          updatedAt: new Date()
        })
        .where(eq(progressTracking.id, existing.id));
    } else {
      await db.insert(progressTracking).values({
        goalId: parseInt(goalId),
        weight: '100.00',
        employeeId: session.id,
        currentProgress,
        evidence: comments,
        status: 'pending',
        target: '100.00'
      });
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Progress submission error:', error);
    return { error: 'Failed to submit progress' };
  }
} 