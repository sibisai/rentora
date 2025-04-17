import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHostProperties, deleteProperty } from "../propertyService";
import PropertyList from "../components/PropertyList";
import type { Property } from "../types";
import { useAuth } from "../../auth/AuthContext";

const PropertyListPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const { user } = useAuth();         // ← get the logged‑in host’s ID
  const hostId = user?.id;
  const navigate = useNavigate();

  const fetchProperties = async () => {
    if (!hostId) return setError("You must be logged in.");
    setLoading(true);
    try {
      const list = await getHostProperties(hostId);
      setProperties(list);
    } catch {
      setError("Failed to load your listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    await deleteProperty(id);
    fetchProperties();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Listings</h1>
      <button
        className="btn-primary mb-6"
        onClick={() => navigate("/host/properties/new")}
      >
        + New Listing
      </button>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <PropertyList
          properties={properties}
          onEdit={(id) => navigate(`/host/properties/${id}/edit`)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default PropertyListPage;