"use client";

import { useRouter } from "next/navigation";
import EmployeeForm from "@/components/employees/EmployeeForm";
import { createEmployee, EmployeeRequest } from "@/services/employee-service";

export default function AddEmployeePage() {
  const router = useRouter();

  async function handleSubmit(payload: EmployeeRequest) {
    await createEmployee(payload);
    router.push("/employees");
    router.refresh();
  }

  return (
    <section className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Add Employee</h1>
        <p className="mt-1 text-slate-600">Fields marked with * are required.</p>
      </div>

      <EmployeeForm submitLabel="Save Employee" onSubmit={handleSubmit} />
    </section>
  );
}
