/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createReviewCycle, getReviewCycles, deleteReviewCycle } from "@/lib/actions/review-cycle-actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Edit, CalendarDays } from "lucide-react";
import { addDays, format, isBefore, isAfter } from "date-fns";

interface ReviewCycle {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

interface FormData {
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export default function ReviewCyclesPage() {
  const { toast } = useToast();
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCycle, setEditCycle] = useState<ReviewCycle | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    startDate: new Date(),
    endDate: addDays(new Date(), 30),
    isActive: false
  });
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  const loadCycles = useCallback(async () => {
    try {
      const data = await getReviewCycles();
      setCycles(data.map((cycle: ReviewCycle) => ({
        ...cycle,
        startDate: new Date(cycle.startDate),
        endDate: new Date(cycle.endDate)
      })));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load cycles'
      });
    } finally {
      setLoading(false);
    }
  }, [getReviewCycles, toast]);

  useEffect(() => {
    loadCycles();
  }, [loadCycles]);

  const getCycleStatus = (cycle: ReviewCycle) => {
    const today = new Date();
    if (cycle.isActive) return { label: 'Active', class: 'bg-green-100 text-green-800' };
    if (isAfter(today, cycle.endDate)) return { label: 'Expired', class: 'bg-red-100 text-red-800' };
    if (isBefore(today, cycle.startDate)) return { label: 'Upcoming', class: 'bg-blue-100 text-blue-800' };
    return { label: 'Inactive', class: 'bg-gray-100 text-gray-800' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateLoading(true);
    try {
      await createReviewCycle(formData);
      toast({ title: "Success", description: "Review cycle created" });
      await loadCycles();
      setFormData({
        name: '',
        startDate: new Date(),
        endDate: addDays(new Date(), 30),
        isActive: false
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create cycle'
      });
    } finally {
      setIsCreateLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteReviewCycle(id);
      toast({ title: "Success", description: "Cycle deleted" });
      await loadCycles();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete cycle'
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Review Cycles</h1>
       
        <Dialog>
          <DialogTrigger asChild>
            <Button>New Cycle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Review Cycle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                    disabled={(date) => isBefore(date, new Date())}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, endDate: date }))}
                    disabled={(date) => isBefore(date, formData.startDate)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label>Set as Active</Label>
              </div>
              <Button type="submit" className="w-full" disabled={isCreateLoading}>
                {isCreateLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {cycles.map(cycle => {
            const status = getCycleStatus(cycle);
            return (
              <div key={cycle.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{cycle.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${status.class}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <CalendarDays className="inline-block w-4 h-4 mr-1" />
                    {format(cycle.startDate, 'MMM dd, yyyy')} - {format(cycle.endDate, 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditCycle(cycle)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(cycle.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 