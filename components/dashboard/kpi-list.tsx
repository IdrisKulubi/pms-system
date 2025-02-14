'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmployeeKPIs } from "@/lib/actions/kpi-actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KPI {
  id: number;
  title: string;
  description: string | null;
  target: string | null;
  selfRating: number | null;
  selfComment: string | null;
  managerReviews: {
    rating: number;
    comment: string;
    manager?: {
      name: string;
    };
  }[];
  ceoOverrides: {
    overrideRating: number;
    overrideComment: string;
    superAdmin?: {
      name: string;
    };
  }[];
  weight: string;
}

export function KPIList() {
  const { toast } = useToast();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    try {
      const data = await getEmployeeKPIs();
      setKpis(data as KPI[]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load KPIs'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (kpis.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No KPIs found. Start by creating your first KPI.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {kpis.map(kpi => (
        <Card key={kpi.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{kpi.title}</CardTitle>
              <Badge variant="secondary">
                Weight: {parseFloat(kpi.weight).toFixed(2)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Target:</p>
                <p className="text-muted-foreground">{kpi.target}</p>
              </div>
              
              <div>
                <p className="font-medium">Your Self-Assessment:</p>
                {kpi.selfRating ? (
                  <div className="bg-muted p-3 rounded">
                    <p>Rating: {kpi.selfRating}</p>
                    <p className="mt-2">{kpi.selfComment}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Not submitted yet</p>
                )}
              </div>

              {kpi.managerReviews.length > 0 && (
                <div>
                  <p className="font-medium">Manager Feedback:</p>
                  {kpi.managerReviews.map((review, index) => (
                    <div key={index} className="bg-muted p-3 rounded mt-2">
                      <p>Rating: {review.rating}</p>
                      <p className="mt-2">{review.comment}</p>
                      {review.manager?.name && (
                        <p className="text-sm text-muted-foreground mt-2">
                          - {review.manager.name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {kpi.ceoOverrides.length > 0 && (
                <div>
                  <p className="font-medium">Admin Feedback:</p>
                  {kpi.ceoOverrides.map((override, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded mt-2">
                      <p>Rating: {override.overrideRating}</p>
                      <p className="mt-2">{override.overrideComment}</p>
                      {override.superAdmin?.name && (
                        <p className="text-sm text-blue-800 mt-2">
                          - {override.superAdmin.name} (Admin)
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 