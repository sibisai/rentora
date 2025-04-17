import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PropertyForm from "../components/PropertyForm";
import { getProperty, updateProperty } from "../propertyService";
import type { FormValues, Property } from "../types";

const EditPropertyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const prop = await getProperty(id);
        setInitialData(prop);
      } catch {
        setError("Could not load this listing.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Notice: we don't use SubmitHandler<...> here — just
  // the plain signature your PropertyForm expects:
  const handleSubmit = async (formValues: FormValues) => {
    try {
      await updateProperty(id!, formValues);
      navigate("/host/properties");
    } catch {
      setError("Failed to save changes.");
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!initialData) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Listing</h1>
      <PropertyForm
        initialValues={initialData}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EditPropertyPage