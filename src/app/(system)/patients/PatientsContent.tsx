"use client";
//

import Loader from "@/components/loader";
import { useEffect, useState } from "react";

export default function PatientsContent() {
  const [error, setError] = useState<Error | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Simulate fetching patient data
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call to get patients
        // For now, just setting up the error handling pattern
        const mockPatients = [
          { id: "p1", name: "John Doe", age: 42, status: "Active" },
          { id: "p2", name: "Jane Smith", age: 35, status: "In Treatment" },
          { id: "p3", name: "Robert Johnson", age: 58, status: "Follow-up" },
        ];

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        setPatients(mockPatients);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load patient data")
        );
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Throw any errors to be caught by the error boundary
  if (error) {
    throw error;
  }

  // Simple patients list UI - would be much more elaborate in a real app
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--foreground)" }}
        >
          Patients
        </h1>
        <p className="mt-2" style={{ color: "var(--text-muted)" }}>
          Manage and view your patient records
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <div
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--card-border)",
          }}
          className="shadow-md rounded-lg overflow-hidden"
        >
          <table
            className="min-w-full divide-y"
            style={{ borderColor: "var(--card-border)" }}
          >
            <thead style={{ background: "var(--header-bg)" }}>
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Age
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              style={{ background: "var(--card-bg)" }}
              className="divide-y"
            >
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    {patient.name}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {patient.age}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        patient.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : patient.status === "In Treatment"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      style={{ color: "var(--accent)" }}
                      className="hover:opacity-80 mr-3"
                    >
                      View
                    </button>
                    <button
                      style={{ color: "var(--accent)" }}
                      className="hover:opacity-80"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
