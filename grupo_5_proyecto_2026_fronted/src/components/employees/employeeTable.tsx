import React from "react";
import { Employee } from "../../types/Employee";
import { disableEmployee, enableEmployee } from "../../services/employee";

interface Props {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onRefresh: () => void;
}

const EmployeeTable: React.FC<Props> = ({
  employees,
  onEdit,
  onRefresh,
}) => {

  const handleToggle = async (employee: Employee) => {
    try {
      if (employee.isActive) {
        await disableEmployee(employee.id!);
      } else {
        await enableEmployee(employee);
      }
      onRefresh();
    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full text-sm text-left text-gray-600">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Identificación</th>
            <th className="px-4 py-3">Turno</th>
            <th className="px-4 py-3">Salario</th>
            <th className="px-4 py-3 text-center">Estado</th>
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr
              key={emp.id}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3">
                {emp.name} {emp.lastNames}
              </td>
              <td className="px-4 py-3">{emp.identification}</td>
              <td className="px-4 py-3">{emp.shift}</td>
              <td className="px-4 py-3">{emp.salary}</td>

              {/* BADGE ESTADO */}
              <td className="px-4 py-3 text-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    emp.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {emp.isActive ? "Activo" : "Inactivo"}
                </span>
              </td>

              {/* ACCIONES */}
              <td className="px-4 py-3 text-center space-x-3">

                {/* EDITAR */}
                <button
                  onClick={() => onEdit(emp)}
                  className="text-blue-600 hover:text-blue-800 transition"
                  title="Editar"
                >
                  ✏️
                </button>

                {/* SWITCH (REEMPLAZA BASURERO) */}
                <button
                  onClick={() => handleToggle(emp)}
                  className={`relative w-14 h-7 flex items-center rounded-full p-1 transition duration-300 ${
                    emp.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                  title={emp.isActive ? "Desactivar" : "Activar"}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition duration-300 ${
                      emp.isActive ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;