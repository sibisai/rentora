import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyForm from '../components/PropertyForm';
import { createProperty } from '../propertyService';
import type { FormValues, Property } from '../types'; 
const CreatePropertyPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: FormValues) => {
    const created: Property = await createProperty(data);
    navigate(`/properties/${created._id}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New Listing</h1>
      <PropertyForm onSubmit={handleSubmit} />
    </div>
  );
};

export default CreatePropertyPage;