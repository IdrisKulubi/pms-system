/* eslint-disable @typescript-eslint/no-unused-vars */
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { KPI, Pillar, PPSGoal } from "@/lib/pms-framework";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { ShieldAlert } from "lucide-react";
import { Feedback } from "@/lib/pms-framework";
import { headers } from 'next/headers';
import { cache } from 'react';

// Cache the data fetching functions
const getFrameworkData = cache(async (sessionId: string) => {
  const headersList = await headers();
  const cookies = headersList.get('cookie');
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/pms/framework`, {
    credentials: 'include',
    headers: {
      Cookie: cookies || '',
      'Content-Type': 'application/json',
    },
    next: { 
      revalidate: 60, // Revalidate every minute
      tags: ['framework']
    }
  });

  if (!res.ok) {
    if (res.status === 401) redirect('/login');
    throw new Error(`Failed to fetch framework: ${res.statusText}`);
  }

  return res.json();
});

const getOverallProgress = cache(async (sessionId: string) => {
  const headersList = await headers();
  const cookies = headersList.get('cookie');

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/pms/overall-progress`, {
    credentials: 'include',
    headers: {
      Cookie: cookies || '',
      'Content-Type': 'application/json',
    },
    next: { 
      revalidate: 30, // Revalidate every 30 seconds
      tags: ['progress']
    }
  });

  if (!res.ok) {
    if (res.status === 401) redirect('/login');
    throw new Error(`Failed to fetch progress: ${res.statusText}`);
  }

  return res.json();
});

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  try {
    // Fetch data in parallel with proper error handling
    const [frameworkData, overallProgress] = await Promise.all([
      getFrameworkData(session.id.toString()).catch(error => {
        console.error('Framework fetch error:', error);
        return { error: 'Failed to load framework data' };
      }),
      getOverallProgress(session.id.toString()).catch(error => {
        console.error('Progress fetch error:', error);
        return { overallProgress: 0 };
      })
    ]);

    if ('error' in frameworkData) {
      throw new Error(frameworkData.error);
    }

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/dashboard/kpi/new">+ New KPI Submission</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-4">
                {overallProgress.overallProgress}%
              </div>
              <Progress 
                value={overallProgress.overallProgress} 
                className="h-3 bg-primary-foreground/20" 
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Current Cycle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Q2 2024</span>
                  <span className="text-muted-foreground">Ends: June 30</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {frameworkData.map((pillar: Pillar) => (
            <Card key={pillar.name}>
              <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-center">
                  <CardTitle>{pillar.name}</CardTitle>
                  <span className="text-muted-foreground">{pillar.totalWeight}% Weight</span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Accordion type="multiple">
                  {pillar.kpis.map((kpi: KPI) => (
                    <AccordionItem key={kpi.name} value={kpi.name}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">{kpi.name}</span>
                          <span className="text-muted-foreground text-sm">
                            {kpi.goals.length} Goals • {kpi.totalWeight}% Weight
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pl-4">
                          {kpi.goals.map((goal: PPSGoal, index: number) => (
                            <div key={index} className="border-l-2 pl-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{goal.description}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Verification: {goal.verification}
                                  </p>
                                </div>
                                <span className="text-sm font-medium bg-accent px-3 py-1 rounded-full">
                                  {goal.weight}%
                                </span>
                              </div>
                              <div className="mt-2 flex items-center gap-4">
                                <Progress value={65} className="h-2 w-[200px]" />
                                <Button variant="outline" size="sm">
                                  Submit Evidence
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Performance Feedback</h2>
          <div className="grid gap-6 md:grid-cols-2 dark:bg-gray-800">
            <FeedbackCard feedback={{
              reviewer: "Manager",
              rating: 4,
              comment: "Good progress on financial reporting, need more attention to client contracts",
              approved: true
            }} />
            <FeedbackCard feedback={{
              reviewer: "CEO",
              rating: 5,
              comment: "Excellent work on audit process improvements",
              overrideComment: "Approved with exceptional rating",
              approved: true
            }} />
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          Failed to load dashboard data. Please try again later.
        </div>
      </div>
    );
  }
}

function FeedbackCard({ feedback }: { feedback: Feedback }) {
  return (
    <Card>
      <CardHeader className="bg-blue-50 dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <CardTitle>{feedback.reviewer} Feedback</CardTitle>
          <Badge variant={feedback.approved ? "default" : "outline"}>
            {feedback.approved ? "Approved" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Rating:</span>
            <Rating value={feedback.rating} />
          </div>
          <p className="text-sm">{feedback.comment}</p>
          {feedback.overrideComment && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-600">
                <ShieldAlert className="h-4 w-4" />
                <span className="font-medium">CEO Override:</span>
              </div>
              <p className="mt-1 text-sm">{feedback.overrideComment}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 