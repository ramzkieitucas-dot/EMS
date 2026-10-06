"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDepartments, EmployeeRequest } from "@/services/employee-service";
import { Department } from "@/types/department";

type FormErrors = Partial<Record<keyof EmployeeRequest, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^(09|\+639)\d{9}$/;
const NAME_REGEX = /^[A-Za-zÀ-ÿñÑ .'-]+$/;

export const emptyEmployeeForm: EmployeeRequest = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  hireDate: new Date().toISOString().split("T")[0],
  status: "Active",
  departmentId: 0,
};

function cleanPhone(phone: string | undefined) {
  return (phone ?? "").replace(/[\s-]/g, "");
}

function validate(form: EmployeeRequest): FormErrors {
  const errors: FormErrors = {};
  const today = new Date().toISOString().split("T")[0];

  const firstName = form.firstName.trim();
  if (!firstName) errors.firstName = "First name is required.";
  else if (!NAME_REGEX.test(firstName)) errors.firstName = "First name can only contain letters.";

  const lastName = form.lastName.trim();
  if (!lastName) errors.lastName = "Last name is required.";
  else if (!NAME_REGEX.test(lastName)) errors.lastName = "Last name can only contain letters.";

  const email = form.email.trim();
  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Enter a valid email (e.g., juan@example.com).";

  const phone = cleanPhone(form.phone);
  if (!phone) errors.phone = "Phone number is required.";
  else if (!PHONE_REGEX.test(phone)) errors.phone = "Use 09XXXXXXXXX or +639XXXXXXXXX.";

  const position = (form.position ?? "").trim();
  if (!position) errors.position = "Position is required.";
  else if (position.length < 2) errors.position = "Position must be at least 2 characters.";

  if (form.departmentId === 0) errors.departmentId = "Please select a department.";

  if (!form.hireDate) errors.hireDate = "Hire date is required.";
  else if (form.hireDate > today) errors.hireDate = "Hire date cannot be in the future.";

  if (!form.status) errors.status = "Status is required.";

  return errors;
}

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

function fieldClass(hasError: boolean) {
  const base =
    "w-full rounded-lg border bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:ring-2";
  return hasError
    ? `${base} border-red-500 focus:ring-red-100`
    : `${base} border-slate-300 focus:border-blue-500 focus:ring-blue-100`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

interface EmployeeFormProps {
  initialValues?: EmployeeRequest;
  employeeCode?: string;
  submitLabel: string;
  onSubmit: (payload: EmployeeRequest) => Promise<void>;
}

export default function EmployeeForm({
  initialValues = emptyEmployeeForm,
  employeeCode,
  submitLabel,
  onSubmit,
}: EmployeeFormProps) {
  const [form, setForm] = useState<EmployeeRequest>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    getDepartments()
      .then(setDepartments)
      .catch(() => setServerError("Unable to load departments."));
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    const parsedValue = name === "departmentId" ? Number(value) : value;

    setForm((current) => {
      const updated = { ...current };
      Reflect.set(updated, name, parsedValue);
      return updated;
    });

    setErrors((current) => {
      const updated = { ...current };
      Reflect.deleteProperty(updated, name);
      return updated;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");

    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const payload: EmployeeRequest = {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: cleanPhone(form.phone),
      position: (form.position ?? "").trim(),
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      {serverError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>Employee Code</label>
          <input
            value={employeeCode ?? "Auto-generated on save"}
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-slate-500"
          />
        </div>

        <div>
          <label className={labelClass}>Email *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="juan@example.com"
            className={fieldClass(!!errors.email)}
          />
          <FieldError message={errors.email} />
        </div>

        <div>
          <label className={labelClass}>First Name *</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="Juan"
            className={fieldClass(!!errors.firstName)}
          />
          <FieldError message={errors.firstName} />
        </div>

        <div>
          <label className={labelClass}>Last Name *</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Dela Cruz"
            className={fieldClass(!!errors.lastName)}
          />
          <FieldError message={errors.lastName} />
        </div>

        <div>
          <label className={labelClass}>Phone *</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="09123456789"
            maxLength={13}
            className={fieldClass(!!errors.phone)}
          />
          <FieldError message={errors.phone} />
        </div>

        <div>
          <label className={labelClass}>Position *</label>
          <input
            name="position"
            value={form.position}
            onChange={handleChange}
            placeholder="Software Engineer"
            className={fieldClass(!!errors.position)}
          />
          <FieldError message={errors.position} />
        </div>

        <div>
          <label className={labelClass}>Department *</label>
          <select
            name="departmentId"
            value={form.departmentId}
            onChange={handleChange}
            className={fieldClass(!!errors.departmentId)}
          >
            <option value={0}>Select department</option>
            {departments.map((department) => (
              <option key={department.departmentId} value={department.departmentId}>
                {department.departmentName}
              </option>
            ))}
          </select>
          <FieldError message={errors.departmentId} />
        </div>

        <div>
          <label className={labelClass}>Hire Date *</label>
          <input
            type="date"
            name="hireDate"
            value={form.hireDate}
            onChange={handleChange}
            className={fieldClass(!!errors.hireDate)}
          />
          <FieldError message={errors.hireDate} />
        </div>

        <div>
          <label className={labelClass}>Status *</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={fieldClass(!!errors.status)}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
          <FieldError message={errors.status} />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Link
          href="/employees"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
