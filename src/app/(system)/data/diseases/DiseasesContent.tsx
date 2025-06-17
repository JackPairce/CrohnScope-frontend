"use client";
import ConfirmDialog from "@/components/ConfirmDialog";
import { DataForm, DataHeader, DataList } from "@/components/DataManagement";
import { DataType } from "@/components/DataManagement/types";
import Loader from "@/components/loader";
import Toast, { type ToastType } from "@/components/Toast";
import type { ApiDisease } from "@/lib/api/";
import {
  addDisease,
  deleteDisease,
  getDiseases,
  updateDisease,
} from "@/lib/api/diseases";
import { useEffect, useState } from "react";

const Type: DataType = "disease";

export default function DiseasesContent() {
  const [diseases, setDiseases] = useState<ApiDisease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
  const handleSubmit = async (formData: Partial<ApiDisease>) => {
    setIsSubmitting(true);
    try {
      if (editMode === "add") {
        formData.id = diseases.length + 1; // Temporary ID assignment
        const response = await addDisease(formData as ApiDisease);
        setDiseases((prev) => [...prev, response]);
        addToast("Disease added successfully", "success");
      } else if (selectedDisease) {
        formData.id = selectedDisease.id;
        const response = await updateDisease(formData as ApiDisease);
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

  if (isLoading) {
    return <Loader />;
  }

  const filteredDiseases = diseases.filter((disease) =>
    disease.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <DataHeader
        type="disease"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddNew={handleAdd}
      />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className={editMode == "view" ? "lg:col-span-2" : "lg:col-span-1"}>
          <DataList
            type={Type}
            items={filteredDiseases}
            setSelectedItem={(item) => {
              setSelectedDisease(item);
              setEditMode("view");
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            editMode={editMode}
          />
        </div>

        <div
          className={
            // if edit mode or add give more focus to the form
            editMode === "edit" || editMode === "add" ? "lg:col-span-2" : ""
          }
        >
          <DataForm
            type={Type}
            item={selectedDisease}
            onSave={handleSubmit}
            onCancel={() => {
              setEditMode("view");
              setSelectedDisease(null);
            }}
            isNameExists={diseases.some(
              (disease) =>
                disease.name.toLowerCase() ===
                  selectedDisease?.name.toLowerCase() &&
                disease.id !== selectedDisease?.id
            )}
            isSubmitting={isSubmitting}
            editMode={editMode}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Disease"
        message="Are you sure you want to delete this disease? This action cannot be undone."
        actions={[
          {
            label: "Cancel",
            value: false,
            type: "default",
          },
          {
            label: "Delete",
            value: true,
            type: "danger",
            autoFocus: true,
          },
        ]}
        onClose={(confirmed: boolean) => {
          if (confirmed && diseaseToDelete) {
            handleDeleteConfirmed(diseaseToDelete.id);
          }
          setShowDeleteConfirm(false);
          setDiseaseToDelete(null);
        }}
      />

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
