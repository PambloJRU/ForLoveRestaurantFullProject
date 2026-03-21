import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeForm from "@/components/employees/employeeForm";
import type { Employee } from "@/types/Employee";
import { addEmployee } from "@/services/employee";
import { toast } from "sonner";

const CreateEmployee = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: Employee) => {
    try {
      setSaving(true);
      const res: any = await addEmployee(data);
      toast.success(res?.value ?? "Empleado registrado correctamente");
      navigate("/employees");
    } catch (e: any) {
      toast.error(e?.message ?? "Error registrando empleado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <EmployeeForm
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
      isSubmitting={saving}
    />
  );
};

export default CreateEmployee;
