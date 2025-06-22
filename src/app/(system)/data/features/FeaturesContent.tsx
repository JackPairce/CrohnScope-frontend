"use client";

//
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  DataForm,
  DataHeader,
  DataList,
  DataType,
} from "@/components/DataManagement";
import { DataItem, ViewType } from "@/components/DataManagement/types";
import Loader from "@/components/loader";
import Toast, { ToastContainer, type ToastType } from "@/components/Toast";
import type { ApiDisease, ApiFeature } from "@/lib/api";
import {
  addFeatures,
  deleteFeatures,
  getDiseases,
  getFeatures,
  updateFeatures,
} from "@/lib/api";
import { useEffect, useState } from "react";

const Type: DataType = "feature";

export default function FeaturesContent() {
  const [features, setFeatures] = useState<ApiFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeature, setSelectedFeature] = useState<ApiFeature | null>(
    null
  );
  const [editMode, setEditMode] = useState<ViewType>("view");
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: ToastType }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<ApiFeature | null>(
    null
  );
  const [diseases, setDiseases] = useState<ApiDisease[]>([]);

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
        const featuresData = await getFeatures();
        setFeatures(featuresData);
        const diseasesData = await getDiseases();
        setDiseases(diseasesData);
      } catch (error) {
        console.error("Error fetching features:", error);
        addToast("Failed to load features", "error");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleAdd = () => {
    setSelectedFeature(null);
    setEditMode("add");
  };

  //
  const handleEdit = (feature: DataItem<typeof Type>) => {
    setSelectedFeature(feature as ApiFeature);
    setEditMode("edit");
  };

  const handleDelete = (feature: DataItem<typeof Type>) => {
    setFeatureToDelete(feature as ApiFeature);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirmed = async (id: number) => {
    try {
      await deleteFeatures(id);
      setFeatures((prev) => prev.filter((f) => f.id !== id));
      addToast("Feature deleted successfully", "success");
      setSelectedFeature(null);
    } catch (error) {
      console.error("Error deleting feature:", error);
      addToast("Failed to delete feature", "error");
    }
  };

  const handleSubmit = async (formData: ApiFeature | ApiDisease) => {
    setIsSubmitting(true);
    try {
      if (editMode === "add") {
        formData.id = features.length + 1; // Temporary ID, should be handled by backend
        const { feature_type: newFeature } = await addFeatures(formData as any);
        setFeatures((features) => [...features, newFeature]);
        addToast("Feature added successfully", "success");
      } else if (selectedFeature) {
        const data = { ...selectedFeature, ...formData };
        const { feature_type: updated_feature } = await updateFeatures(data);
        setFeatures((features) =>
          features.map((f) =>
            f.id === updated_feature.id ? updated_feature : f
          )
        );
        addToast("Feature updated successfully", "success");
      }
      setEditMode("view");
      setSelectedFeature(null);
    } catch (error) {
      console.error("Error saving feature:", error);
      addToast("Failed to save feature", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const filteredFeatures = features.filter((feature) =>
    feature.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <DataHeader
        type="feature"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddNew={handleAdd}
      />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className={editMode == "view" ? "lg:col-span-2" : "lg:col-span-1"}>
          <DataList
            type={Type}
            items={filteredFeatures}
            setSelectedItem={(item) => {
              setSelectedFeature(item as ApiFeature);
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
            item={selectedFeature}
            tags={diseases}
            onSave={handleSubmit}
            onCancel={() => {
              setEditMode("view");
              setSelectedFeature(null);
            }}
            isSubmitting={isSubmitting}
            editMode={editMode}
            isNameExists={features.some(
              (feature) =>
                feature.name.toLowerCase() ===
                  (selectedFeature?.name || "").toLowerCase() &&
                feature.id !== selectedFeature?.id
            )}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Feature"
        message="Are you sure you want to delete this feature? This action cannot be undone."
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
          if (confirmed && featureToDelete) {
            handleDeleteConfirmed(featureToDelete.id);
          }
          setShowDeleteConfirm(false);
          setFeatureToDelete(null);
        }}
      />

      <ToastContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContainer>
    </div>
  );
}
