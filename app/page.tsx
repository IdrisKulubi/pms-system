import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-6">Performance Management System</h1>
        <div className="space-y-4">
          <Button asChild>
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6">
        {session.role === 'employee' && (
          <div className="border p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Your KPIs</h2>
            <Button asChild>
              <Link href="/dashboard/kpi/new">Submit New KPI</Link>
            </Button>
          </div>
        )}

        {session.role === 'manager' && (
          <div className="border p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Team Reviews</h2>
            <Button asChild>
              <Link href="/manager/reviews">View Pending Reviews</Link>
            </Button>
          </div>
        )}

        {session.role === 'super_admin' && (
          <div className="border p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
            <div className="space-y-4">
              <Button asChild>
                <Link href="/admin/users">Manage Users</Link>
              </Button>
              <Button asChild>
                <Link href="/admin/review-cycles">Manage Review Cycles</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
