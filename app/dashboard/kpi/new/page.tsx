'use client';
import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from "@/lib/auth";
import {  useFormStatus } from "react-dom";
import { createKPI } from "@/lib/actions/kpi-actions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Loader2 } from "lucide-react";
import { pmsFramework } from "@/lib/pms-framework";

const PILLAR_DESCRIPTIONS = {
  Branding: "Focus on innovation, visibility, and thought leadership (5%)",
  Clients: "Manage client relationships, business development, and feedback (5%)",
  Financials: "Handle cash flow, audits, and financial management (30%)",
  "Internal Processes & Systems": "Manage internal operations, compliance, and systems (45%)",
  "People and Culture": "Focus on learning, development, and employee satisfaction (15%)"
};

// Submit Button with Loading State
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit"
      className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        'Submit Progress'
      )}
    </Button>
  );
}

export default function NewKPIPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedPillar, setSelectedPillar] = useState('');
  const [selectedKPI, setSelectedKPI] = useState('');
  const [availableKPIs, setAvailableKPIs] = useState<Array<{ name: string; weight: number }>>([]);

  // Form state with server action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction] = useActionState(async (prevState: any, formData: FormData) => {
    try {
      const result = await createKPI(prevState, formData);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        return { error: result.error };
      }
      
      toast({
        title: "Success",
        description: "KPI progress submitted successfully",
      });
      router.push('/dashboard');
      return result;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit KPI progress",
      });
      return { error: "Submission failed" };
    }
  }, null);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Unauthorized",
          description: "Please login to continue",
        });
        router.push('/login');
      }
    };
    checkAuth();
  }, [router, toast]);

  // Update KPIs when pillar changes
  useEffect(() => {
    const pillar = pmsFramework.find(p => p.name === selectedPillar);
    if (pillar) {
      setAvailableKPIs(pillar.kpis.map(kpi => ({
        name: kpi.name,
        weight: kpi.totalWeight
      })));
    } else {
      setAvailableKPIs([]);
    }
  }, [selectedPillar]);

  return (
    <div className="p-6 max-w-3xl mx-auto dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6">Submit New KPI Progress</h1>

      {/* Pillar Selection Guide */}
      <Card className="mb-8 bg-green-50/50 dark:bg-gray-800/50 border-green-100 dark:border-green-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InfoIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            Understanding PMS Pillars
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(PILLAR_DESCRIPTIONS).map(([pillar, desc]) => (
            <div key={pillar} className="flex gap-4">
              <div className="font-semibold min-w-[200px] text-green-700 dark:text-green-300">{pillar}</div>
              <div className="text-muted-foreground dark:text-gray-400">{desc}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <form action={formAction} className="space-y-8">
        <Card className="border-green-100 dark:border-green-900">
          <CardHeader className="border-b border-green-100 dark:border-green-900">
            <CardTitle>Select Performance Area</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 dark:bg-gray-800/50">
            {/* Pillar Selection */}
            <div className="space-y-2">
              <Label htmlFor="pillar">Performance Pillar</Label>
              <Select 
                name="pillar" 
                value={selectedPillar} 
                onValueChange={(value) => {
                  setSelectedPillar(value);
                  setSelectedKPI(''); // Reset KPI when pillar changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a pillar" />
                </SelectTrigger>
                <SelectContent>
                  {pmsFramework.map(pillar => (
                    <SelectItem key={pillar.name} value={pillar.name}>
                      {pillar.name} ({pillar.totalWeight}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Each pillar represents a key area of performance measurement
              </p>
            </div>

            {/* KPI Selection */}
            <div className="space-y-2">
              <Label htmlFor="kpi">Key Performance Indicator</Label>
              <Select 
                name="kpi"
                value={selectedKPI}
                onValueChange={setSelectedKPI}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select KPI" />
                </SelectTrigger>
                <SelectContent>
                  {availableKPIs.map(kpi => (
                    <SelectItem key={kpi.name} value={kpi.name}>
                      {kpi.name} ({kpi.weight}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPillar && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">KPI Goals for {selectedPillar}:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {pmsFramework
                      .find(p => p.name === selectedPillar)
                      ?.kpis.map(kpi => kpi.goals.map((goal, idx) => (
                        <li key={`${kpi.name}-${idx}`} className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">{kpi.name}:</span> {goal.description}
                          <br />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Verification: {goal.verification}
                          </span>
                        </li>
                      )))
                      .flat()}
                  </ul>
                </div>
              )}
            </div>

            {/* Progress Input */}
            <div className="space-y-2">
              <Label htmlFor="progress">Current Progress (%)</Label>
              <Input 
                type="number" 
                name="progress" 
                min="0" 
                max="100" 
                placeholder="Enter progress percentage"
                required
              />
            </div>

            {/* Evidence/Verification */}
            <div className="space-y-2">
              <Label htmlFor="evidence">Evidence of Progress</Label>
              <Textarea 
                name="evidence" 
                placeholder="Describe your progress and provide verification details..."
                rows={4}
                required
              />
              <Alert>
                <AlertDescription>
                  Remember to include specific examples and metrics that verify your progress
                </AlertDescription>
              </Alert>
            </div>

            {state?.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            variant="outline" 
            className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950"
            onClick={() => {
              toast({
                description: "Changes discarded",
              });
              router.back();
            }}
            type="button"
          >
            Cancel
          </Button>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
} 