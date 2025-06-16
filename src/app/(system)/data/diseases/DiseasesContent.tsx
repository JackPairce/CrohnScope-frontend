"use client";
import ConfirmDialog from "@/components/ConfirmDialog";
import Loader from "@/components/loader";
import Toast, { ToastContainer, ToastType } from "@/components/Toast";
import {
  addDisease,
  ApiDisease,
  deleteDisease,
  getDiseases,
  updateDisease,
} from "@/lib/api/diseases";
import { useEffect, useState } from "react";

export default function DiseasesContent() {
  const [diseases, setDiseases] = useState<ApiDisease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDisease, setSelectedDisease] = useState<ApiDisease | null>(
    null
  );
  const [editMode, setEditMode] = useState<"view" | "edit" | "add">("view");
  const [formData, setFormData] = useState<Partial<ApiDisease>>({});
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: ToastType }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [diseaseToDelete, setDiseaseToDelete] = useState<ApiDisease | null>(
    null
  );

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const data = await getDiseases();
        setDiseases(data);
      } catch (error) {
        addToast("Failed to load diseases", "error");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleAdd = () => {
    setSelectedDisease(null);
    setFormData({});
    setEditMode("add");
  };
  const handleEdit = (disease: ApiDisease) => {
    setSelectedDisease(disease);
    setFormData({ ...disease });
    setEditMode("edit");
  };
  const handleDelete = (disease: ApiDisease) => {
    setDiseaseToDelete(disease);
    setShowDeleteConfirm(true);
  };
  const handleDeleteConfirmed = async (id: number) => {
    try {
      await deleteDisease(id);
      setDiseases((prev) => prev.filter((d) => d.id !== id));
      addToast("Disease deleted successfully", "success");
      setSelectedDisease(null);
    } catch (error) {
      addToast("Failed to delete disease", "error");
    }
  };
  const handleSubmit = async (data: Partial<ApiDisease>) => {
    setIsSubmitting(true);
    try {
      if (editMode === "add") {
        data.id = diseases.length + 1; // Temporary ID assignment
        const response = await addDisease(data as ApiDisease);
        setDiseases((prev) => [...prev, response]);
        addToast("Disease added successfully", "success");
      } else if (selectedDisease) {
        const response = await updateDisease(data as ApiDisease);
        setDiseases((prev) =>
          prev.map((d) => (d.id === response.id ? response : d))
        );
        addToast("Disease updated successfully", "success");
      }
      setEditMode("view");
      setSelectedDisease(null);
    } catch (error) {
      addToast("Failed to save disease", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    setEditMode("view");
    setSelectedDisease(null);
  };

  if (isLoading) return <Loader />;

  return (
    <div className="diseases-content">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Diseases</h2>
        <button
          onClick={handleAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Add Disease
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {diseases.map((disease) => (
                  <tr key={disease.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{disease.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-500 dark:text-gray-300">
                        {disease.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(disease)}
                        className="text-indigo-600 hover:underline mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(disease)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          {editMode !== "view" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(formData);
              }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData((f: Partial<ApiDisease>) => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((f: Partial<ApiDisease>) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : editMode === "add"
                    ? "Add"
                    : "Update"}
                </button>
                <button
                  type="button"
                  className="bg-gray-500 px-4 py-2 rounded"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : selectedDisease ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">
                {selectedDisease.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {selectedDisease.description}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(selectedDisease)}
                  className="text-indigo-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedDisease)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-64 flex flex-col items-center justify-center text-center">
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                Select a disease from the list to view details or click "Add
                Disease" to create one
              </p>
            </div>
          )}
        </div>
      </div>
      {diseaseToDelete && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Disease"
          message={`Are you sure you want to delete this disease${
            diseaseToDelete.name ? ` \"${diseaseToDelete.name}\"` : ""
          }? This action cannot be undone.`}
          dialogType="danger"
          actions={[
            { label: "Cancel", value: false, type: "default", autoFocus: true },
            { label: "Delete", value: true, type: "danger" },
          ]}
          onClose={(confirmed: boolean) => {
            if (confirmed && diseaseToDelete)
              handleDeleteConfirmed(diseaseToDelete.id);
            setShowDeleteConfirm(false);
            setDiseaseToDelete(null);
          }}
        />
      )}
      <ToastContainer>
        {toasts.map(({ id, message, type }) => (
          <Toast
            key={id}
            message={message}
            type={type}
            onClose={() => removeToast(id)}
          />
        ))}
      </ToastContainer>
    </div>
  );
}
