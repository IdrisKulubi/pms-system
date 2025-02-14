import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addUser } from "./actions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getSession();
  if (session?.role !== 'super_admin') redirect('/dashboard');

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      <form action={addUser} className="space-y-4">
        <Input name="email" type="email" placeholder="Company Email" required />
        <select 
          name="role" 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="super_admin">CEO</option>
        </select>
        <Button type="submit">Add User</Button>
      </form>
    </div>
  );
} 