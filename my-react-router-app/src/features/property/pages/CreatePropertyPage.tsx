import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CreateStepDetails from './CreateStepDetails'
import CreateStepImages  from './CreateStepImages'
import { createProperty } from '../propertyService'
import type { FormValues } from '../types'
import { useAuth } from '../../auth/AuthContext'

export default function CreatePropertyPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<'details' | 'images'>('details')
  const [details, setDetails] = useState<Omit<FormValues, 'images'> | null>(null)

  // after step1
  const handleDetails = (data: Omit<FormValues, 'images'>) => {
    setDetails(data)
    setStep('images')
  }

  // after step2: receives form values from step2 ({ images })
  const handleImages = async ({ images }: { images: string[] }) => {
    if (!user || !details) return
    const payload: FormValues = { ...details, images, hostId: user.id }
    const created = await createProperty(payload)
    // go straight to edit so they can tweak if they want
    navigate(`/host/properties/${created._id}/edit`)
  }

  return (
    <div className="prose mx-auto py-8">
      <h1>Create New Listing</h1>
      {step === 'details' ? (
        <CreateStepDetails onSubmit={(d) => handleDetails(d)} />
      ) : (
        <CreateStepImages
          propertyId={undefined}
          initialImages={[]}
          onBack={() => setStep('details')}
          onSubmit={handleImages}
        />
      )}
    </div>
  )
}