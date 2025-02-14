'use client';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllUsers, addFeedbackToUser } from "@/lib/actions/user-actions";
import { getAllKPIs, addCEOOverride } from "@/lib/actions/kpi-actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, MessageSquare, Star } from "lucide-react";
import { LogoutButton } from '@/components/shared/logout-button';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  feedback?: {
    id: number;
    comment: string;
    createdAt: Date;
  }[];
}

interface KPI {
  id: number;
  employeeId: number;
  reviewCycleId: number;
  title: string;
  description: string | null;
  target: string | null;
  weight: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  selfRating?: number | null;
  selfComment?: string | null;
  pillarId?: number | null;
  employee?: {
    id: number;
    name: string;
    email: string;
  };
  managerReviews?: {
    id: number;
    rating: number;
    comment: string;
    manager?: {
      name: string;
    };
  }[];
  ceoOverrides?: {
    id: number;
    overrideRating: number;
    overrideComment: string;
    superAdmin?: {
      name: string;
    };
  }[];
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [feedback, setFeedback] = useState('');
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [overrideRating, setOverrideRating] = useState<number>(0);
  const [overrideComment, setOverrideComment] = useState('');

  useEffect(() => {
    loadUsers();
    loadKPIs();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load users'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadKPIs = async () => {
    try {
      const data = await getAllKPIs();
      setKpis(data as KPI[]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load KPIs'
      });
    }
  };

  const handleAddFeedback = async () => {
    if (!selectedUser || !feedback.trim()) return;

    try {
      await addFeedbackToUser({
        userId: selectedUser.id,
        comment: feedback
      });
      toast({ title: "Success", description: "Feedback added successfully" });
      setFeedback('');
      loadUsers(); // Refresh the list
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add feedback'
      });
    }
  };

  const handleAddOverride = async () => {
    if (!selectedKPI || !overrideComment.trim() || !overrideRating) return;

    try {
      await addCEOOverride({
        kpiId: selectedKPI.id,
        overrideRating,
        overrideComment
      });
      toast({ title: "Success", description: "Override added successfully" });
      setOverrideComment('');
      setOverrideRating(0);
      loadKPIs();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add override'
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={() => window.location.href = '/admin/review-cycles'}>
          Manage Review Cycles
        </Button>
        <LogoutButton />
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="kpis">KPI Reviews</TabsTrigger>
          <TabsTrigger value="feedback">Feedback History</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Employee Management</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline"
                            onClick={() => setSelectedUser(user)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Add Feedback
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Feedback for {user.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Enter your feedback..."
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              rows={5}
                            />
                            <Button 
                              className="w-full" 
                              onClick={handleAddFeedback}
                            >
                              Submit Feedback
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis">
          <Card>
            <CardHeader>
              <CardTitle>Employee KPIs</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : kpis.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No KPIs found
                </div>
              ) : (
                <div className="space-y-6">
                  {kpis.map(kpi => (
                    <div key={kpi.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-lg">{kpi.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            By: {kpi.employee?.name || 'Unknown'}
                          </p>
                          <p className="text-sm mt-2">
                            <strong>Target:</strong> {kpi.target}
                          </p>
                          <p className="text-sm mt-1">
                            <strong>Weight:</strong> {kpi.weight}%
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline"
                              onClick={() => setSelectedKPI(kpi)}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Add Override
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add CEO Override for KPI</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Rating</label>
                                <Select 
                                  value={overrideRating.toString()} 
                                  onValueChange={(value) => setOverrideRating(Number(value))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select rating" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1,2,3,4,5].map(rating => (
                                      <SelectItem key={rating} value={rating.toString()}>
                                        {rating}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Comment</label>
                                <Textarea
                                  placeholder="Enter your override comment..."
                                  value={overrideComment}
                                  onChange={(e) => setOverrideComment(e.target.value)}
                                  rows={4}
                                />
                              </div>
                              <Button 
                                className="w-full" 
                                onClick={handleAddOverride}
                              >
                                Submit Override
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="space-y-3 mt-4">
                        {kpi.selfRating !== null && (
                          <div className="bg-muted p-3 rounded">
                            <p className="font-medium">Self Assessment</p>
                            <div className="mt-1">
                              <p>Rating: {kpi.selfRating}</p>
                              <p className="text-sm mt-1">{kpi.selfComment || 'No comment provided'}</p>
                            </div>
                          </div>
                        )}

                        {kpi.managerReviews?.map((review, idx) => (
                          <div key={idx} className="bg-muted p-3 rounded">
                            <p className="font-medium">Manager Review by {review.manager?.name}</p>
                            <div className="mt-1">
                              <p>Rating: {review.rating}</p>
                              <p className="text-sm mt-1">{review.comment}</p>
                            </div>
                          </div>
                        ))}

                        {kpi.ceoOverrides?.map((override, idx) => (
                          <div key={idx} className="bg-blue-50 p-3 rounded">
                            <p className="font-medium text-blue-800">
                              CEO Override by {override.superAdmin?.name}
                            </p>
                            <div className="mt-1">
                              <p>Rating: {override.overrideRating}</p>
                              <p className="text-sm mt-1">{override.overrideComment}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Feedback History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {users.map(user => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{user.name}</h3>
                    {user.feedback && user.feedback.length > 0 ? (
                      <div className="space-y-2">
                        {user.feedback.map(fb => (
                          <div key={fb.id} className="bg-muted p-3 rounded">
                            <p>{fb.comment}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(fb.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No feedback yet</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 