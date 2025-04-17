import React from 'react'
import {
  useForm,
  Controller,
  type SubmitHandler,
} from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import ImageUploader from '../components/ImageUploader'

/** 1. Define your step‑2 form values */
type Step2Values = {
  images: string[]
}

/** 2. Let Yup infer the schema’s type */
const schema = yup
  .object({
    images: yup
      .array()
      .of(yup.string().required())
      .min(1, 'Upload at least one image')
      .required(),
  })
  .required()

interface Props {
  /** already‑saved image URLs when editing */
  initialImages?: string[]
  /** Mongo id (undefined on “create” until the details 
step has run) */
  propertyId?: string
  /** go back to the details step */
  onBack: () => void
  /** finally save your listing */
  onSubmit: SubmitHandler<Step2Values>
}

export default function CreateStepImages({
  initialImages = [],
  propertyId,
  onBack,
  onSubmit,
}: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch,
  } = useForm<Step2Values>({
    defaultValues: { images: initialImages },
    resolver: yupResolver<Step2Values, any,
any>(schema),
    mode: 'onChange',
  })

  const watchedImages = watch('images')

  React.useEffect(() => {
    // console.log('Form images:', watchedImages)
    // console.log('Form isValid:', isValid)
  }, [watchedImages, isValid])

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} 
className="space-y-4 max-w-2xl">
        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUploader propertyId={propertyId} 
value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.images && <p 
className="text-red-500">{errors.images.message}</p>}
        <div className="flex justify-between">
          <button type="button" onClick={onBack} 
className="btn-secondary">
            ← Back
          </button>
          <button type="submit" disabled={!isValid || 
isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving…' : 'Save Listing'}
          </button>
        </div>
      </form>
    </>
  )
}