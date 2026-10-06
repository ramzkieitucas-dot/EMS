// CLIENT: used by Client Components ("use client")
import { Employee } from "@/types/employee";
import { Department } from "@/types/department";
import { apiFetch, getErrorMessage } from "@/lib/api-client";

export type EmployeeRequest = Omit<Employee, "employeeId" | "employeeCode">;
export type CreateEmployeeRequest = EmployeeRequest;

export async function getEmployee(id: number): Promise<Employee | null> {
  const response = await apiFetch(`/employees/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to fetch employee");
  return response.json();
}

export async function getDepartments(): Promise<Department[]> {
  const response = await apiFetch("/departments");
  if (!response.ok) throw new Error("Failed to fetch departments");
  return response.json();
}

export async function createEmployee(employee: EmployeeRequest): Promise<Employee> {
  const response = await apiFetch("/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to create employee"));
  }

  return response.json();
}

export async function updateEmployee(id: number, employee: EmployeeRequest): Promise<void> {
  const response = await apiFetch(`/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to update employee"));
  }
}

export async function deleteEmployee(id: number): Promise<void> {
  const response = await apiFetch(`/employees/${id}`, { method: "DELETE" });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to delete employee"));
  }
}
