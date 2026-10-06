"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EmployeeForm from "@/components/employees/EmployeeForm";
import { getEmployee, updateEmployee, EmployeeRequest } from "@/services/employee-service";
import { Employee } from "@/types/employee";

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getEmployee(Number(id))
      .then((data) => {
        if (data) setEmployee(data);
        else setLoadError("Employee not found.");
      })
      .catch(() => setLoadError("Unable to load employee."));
  }, [id]);

  async function handleSubmit(payload: EmployeeRequest) {
    await updateEmployee(Number(id), payload);
    router.push(`/employees/${id}`);
    router.refresh();
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        {loadError}
      </div>
    );
  }

  if (!employee) {
    return <p className="text-slate-500">Loading employee...</p>;
  }

  const initialValues: EmployeeRequest = {
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone ?? "",
    position: employee.position ?? "",
    hireDate: employee.hireDate.slice(0, 10),
    status: employee.status,
    departmentId: employee.departmentId,
  };

  return (
    <section className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Edit Employee</h1>
        <p className="mt-1 text-slate-600">
          Update the details for {employee.firstName} {employee.lastName}.
        </p>
      </div>

      <EmployeeForm
        initialValues={initialValues}
        employeeCode={employee.employeeCode}
        submitLabel="Update Employee"
        onSubmit={handleSubmit}
      />
    </section>
  );
}
