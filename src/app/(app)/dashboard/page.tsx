import Link from "next/link";
import { getDepartments, getEmployees } from "@/services/employee-server";
import { getCurrentUser } from "@/lib/session";
import { canManageEmployees } from "@/lib/roles";

export default async function DashboardPage() {
  const [employees, departments, user] = await Promise.all([
    getEmployees(),
    getDepartments(),
    getCurrentUser(),
  ]);

  const activeEmployees = employees.filter((e) => e.status === "Active").length;

  const cards = [
    { title: "Total Employees", value: employees.length, color: "bg-blue-600" },
    { title: "Active Employees", value: activeEmployees, color: "bg-green-600" },
    { title: "Departments", value: departments.length, color: "bg-violet-600" },
  ];

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-600">
          Welcome back, {user?.username}. Here is an overview of the system.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className={`mb-5 h-2 w-12 rounded-full ${card.color}`} />
            <p className="text-sm font-medium text-slate-500">{card.title}</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>

        <div className="mt-5 flex flex-wrap gap-4">
          <Link
            href="/employees"
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            View Employees
          </Link>

          {canManageEmployees(user?.role) && (
            <Link
              href="/employees/add"
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Add Employee
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
