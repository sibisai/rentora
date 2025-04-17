import React, { useEffect, useState } from 'react';
import { useNavigate }   from 'react-router-dom';
import { getHostProperties, deleteProperty } from '../propertyService';
import PropertyList      from '../components/PropertyList';
import type { Property } from '../types';
import { useAuth }       from '../../auth/AuthContext';

export default function PropertyListPage() {
  const { user } = useAuth();          // <— changed
  const navigate = useNavigate();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string>();

  const fetchProperties = async () => {
    if (!user) { setError('You must be logged in.'); return; }
    setLoading(true);
    try {
      setProperties(await getHostProperties(user.id));
    } catch {
      setError('Failed to load your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    await deleteProperty(id);
    fetchProperties();
  };

  /* ---------- UI ---------- */
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Listings</h1>

      <button
        className="btn-primary mb-6"
        onClick={() => navigate('/host/properties/new')}
      >
        + New Listing
      </button>

      {loading && <p>Loading…</p>}
      {error   && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <PropertyList
          properties={properties}
          onEdit={id => navigate(`/host/properties/${id}/edit`)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}