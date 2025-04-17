import React, { useEffect, useState } from 'react';
import { useNavigate, useParams }     from 'react-router-dom';
import PropertyForm                   from '../components/PropertyForm';
import { getProperty, updateProperty }from '../propertyService';
import type { FormValues, Property }  from '../types';
import { useAuth }                    from '../../auth/AuthContext';   // NEW

const EditPropertyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();                                           // NEW

  const [initialData, setInitialData] = useState<Property | null>(null);
  const [loading,      setLoading]     = useState(true);
  const [error,        setError]       = useState<string>();

  /* fetch once */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try   { setInitialData(await getProperty(id)); }
      catch { setError('Could not load this listing.'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleSubmit = async (values: FormValues) => {
    if (!id || !user) return;
    try {
      await updateProperty(id, { ...values, hostId: user.id });
      navigate('/host/properties');
    } catch {
      setError('Failed to save changes.');
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error)   return <p className="text-red-500">{error}</p>;
  if (!initialData) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Listing</h1>
      {/* pass _id so ImageUploader knows where to POST */}
      <PropertyForm initialValues={initialData} onSubmit={handleSubmit} />
    </div>
  );
};

export default EditPropertyPage;