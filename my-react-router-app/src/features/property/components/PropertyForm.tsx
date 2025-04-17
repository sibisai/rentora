import React from 'react'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { yupResolver }  from '@hookform/resolvers/yup'
import * as yup         from 'yup'

import LocationPicker   from './LocationPicker'
import ImageUploader    from './ImageUploader'
import { useAuth }      from '../../auth/AuthContext'
import type { FormValues } from '../types'

type Props = {
  initialValues?: FormValues & { _id?: string }
  onSubmit:      SubmitHandler<FormValues>
}

export default function PropertyForm({ initialValues, onSubmit }: Props) {
  const { user } = useAuth()
  const isEdit   = Boolean(initialValues?._id)

  // ————— coordinate tuple —————
  const coordinatesSchema = yup
    .tuple([yup.number().required(), yup.number().required()])
    .required() as yup.Schema<[number,number]>

  // ————— strongly‑typed string[] schema —————
  const stringArraySchema = yup
    .array()
    .of(yup.string().required())
    .default(() => [])
    .ensure()
    .defined() as yup.ArraySchema<string[], yup.AnyObject>

  // on create, enforce ≥1; on edit allow zero
  const imagesSchema: yup.ArraySchema<string[], yup.AnyObject> = isEdit
    ? stringArraySchema
    : stringArraySchema.min(1, 'Upload at least one image')

  const amenitiesSchema: yup.ArraySchema<string[], yup.AnyObject> = isEdit
    ? stringArraySchema
    : stringArraySchema.min(1, 'Select at least one amenity')

  // ————— full form schema —————
  const schema: yup.ObjectSchema<FormValues> = yup.object({
    title:        yup.string().required('Title is required'),
    description:  yup.string().required('Description is required'),
    price:        yup.number().min(0, 'Price must be ≥ 0').required('Price is required'),
    rooms:        yup.number().min(1, 'At least one room').required('Rooms is required'),
    propertyType: yup.string().required('Type is required'),
    images:       imagesSchema,
    amenities:    amenitiesSchema,
    location: yup.object({
      address:     yup.string().required(),
      city:        yup.string().required(),
      state:       yup.string().required(),
      zip:         yup.string().required(),
      country:     yup.string().required(),
      coordinates: coordinatesSchema,
    }).required(),
    hostId: yup.string().required(),
  }).required()

  // ————— hook‑form setup —————
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: initialValues ?? {
      title:        '',
      description:  '',
      price:        0,
      rooms:        1,
      propertyType: '',
      images:       [],  // strictly string[]
      amenities:    [],  // strictly string[]
      location:     {
        address:     '',
        city:        '',
        state:       '',
        zip:         '',
        country:     '',
        coordinates: [0,0],
      },
      hostId:       user?.id ?? '',
    },
    resolver: yupResolver(schema),
    mode:     'all',  // validate on mount so edit form is valid immediately
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-2">
      {/* — left column — */}
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block font-medium">Title</label>
          <input {...register('title')} className="input w-full" />
          {errors.title && <p className="text-red-500">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium">Description</label>
          <textarea {...register('description')} rows={4} className="input w-full" />
          {errors.description && <p className="text-red-500">{errors.description.message}</p>}
        </div>

        {/* Price & Rooms */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block font-medium">Price (USD)</label>
            <input type="number" {...register('price')} className="input w-full" />
            {errors.price && <p className="text-red-500">{errors.price.message}</p>}
          </div>
          <div className="w-32">
            <label className="block font-medium">Rooms</label>
            <input type="number" {...register('rooms')} className="input w-full" />
            {errors.rooms && <p className="text-red-500">{errors.rooms.message}</p>}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block font-medium">Property Type</label>
          <select {...register('propertyType')} className="input w-full">
            <option value="">Select…</option>
            {['House','Apartment','Cabin','Studio','Villa','Townhouse','Condo','Loft','Mansion','Other']
             .map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.propertyType && <p className="text-red-500">{errors.propertyType.message}</p>}
        </div>

        {/* Amenities */}
        <div>
          <label className="block font-medium mb-1">Amenities</label>
          <div className="grid grid-cols-2 gap-1">
            {['Wi‑Fi','Kitchen','Washer','Dryer','Free parking','Air conditioning','Pool','Hot tub','EV charger']
             .map(a => (
               <label key={a} className="flex items-center space-x-1 text-sm">
                 <input type="checkbox" value={a} {...register('amenities')} />
                 <span>{a}</span>
               </label>
             ))}
          </div>
          {errors.amenities && <p className="text-red-500">{errors.amenities.message}</p>}
        </div>
      </div>

      {/* — right column — */}
      <div className="space-y-6">
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <LocationPicker value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.location && <p className="text-red-500">Please complete the address</p>}

        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUploader
              propertyId={initialValues?._id}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.images && <p className="text-red-500">{errors.images.message}</p>}
      </div>

      {/* — submit — */}
      <div className="md:col-span-2">
        <button
          type="submit"
          // disabled={isSubmitting}
          className="btn-primary w-full md:w-auto"
        >
          {isSubmitting ? 'Saving…' : 'Save Listing'}
        </button>
      </div>
    </form>
  )
}