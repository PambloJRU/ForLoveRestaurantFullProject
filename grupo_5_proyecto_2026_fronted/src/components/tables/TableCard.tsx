import { Table } from "../../types/Table";

interface Props {
  table: Table;
  onClick: (table: Table) => void;
}

export default function TableCard({ table, onClick }: Props) {
  const getColor = () => {
    switch (table.state) {
      case "Libre":
        return "#16a34a";
      case "Ocupada":
        return "#dc2626";
      case "Reservada":
        return "#eab308";
      default:
        return "#6b7280";
    }
  };

  return (
    <div
      onClick={() => onClick(table)}
      style={{
        width: 130,
        height: 90,
        backgroundColor: getColor(),
        borderRadius: 16,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
        boxShadow: "0 6px 12px rgba(0,0,0,0.4)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "scale(1.05)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.transform = "scale(1)")
      }
    >
      Mesa {table.number}
    </div>
  );
}
