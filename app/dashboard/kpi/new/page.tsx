'use client';
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createKPI } from "@/lib/actions/kpi-actions";

export default function KPISubmissionForm() {
  const [state, formAction] = useFormState(createKPI, null);

  return (
    <form action={formAction} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <label className="block text-sm font-medium mb-2">KPI Title</label>
        <Input name="title" required />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea name="description" rows={4} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Target</label>
        <Input name="target" required />
      </div>

      <Button type="submit" className="w-full">Submit KPI</Button>
    </form>
  );
} 