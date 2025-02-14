'use client';
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitEvidence } from "@/lib/actions/progress-actions";

export default function EvidenceSubmission({ params }: { params: { goalId: string } }) {
  const [state, formAction] = useActionState(submitEvidence, null);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Update Progress</h1>
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="goalId" value={params.goalId} />
        
        <div>
          <label className="block text-sm font-medium mb-2">Progress (%)</label>
          <Input 
            type="number" 
            name="progress" 
            min="0"
            max="100"
            required
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Comments</label>
          <Textarea 
            name="comments" 
            rows={4} 
            className="w-full"
            placeholder="Describe your progress and achievements..."
          />
        </div>

        <Button type="submit" className="w-full">Submit Progress</Button>
      </form>
    </div>
  );
} 