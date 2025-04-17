import React, { useState } from 'react';
import { useNavigate }      from 'react-router-dom';
import CreateStepDetails    from './CreateStepDetails';
import CreateStepImages     from './CreateStepImages';
import { createProperty }   from '../propertyService';
import type { FormValues }  from '../types';
import { useAuth }          from '../../auth/AuthContext';
import '../styles/property-forms.css';

export default function CreatePropertyPage() {
  const { user } = useAuth();
  const nav      = useNavigate();

  const [step,    setStep]    = useState<'details'|'images'>('details');
  const [details, setDetails] = useState<Omit<FormValues,'images'>|null>(null);

  const handleDetails = (data: Omit<FormValues,'images'>) => {
    setDetails(data);
    setStep('images');
  };

  const handleImages = async ({ images }: { images: string[] }) => {
    if (!user || !details) return;
    await createProperty({ ...details, images, hostId: user.id });
    nav('/host/properties');
  };

return (
    <div className="page-container">
      <div className="card">
        <h1>Create New Listing</h1>
        {step === 'details'
          ? <CreateStepDetails onSubmit={handleDetails} />
          : <CreateStepImages
              initialImages={[]}
              propertyId={undefined}
              onBack={() => setStep('details')}
              onSubmit={handleImages}
            />
        }
      </div>
    </div>
  )
}