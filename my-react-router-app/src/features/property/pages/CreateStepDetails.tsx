// src/features/property/components/CreateStepDetails.tsx
import React from 'react'
import {
  useForm,
  Controller,
  type SubmitHandler,
} from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import LocationPicker from '../components/LocationPicker'
import type { FormValues } from '../types'
import { useAuth } from '../../auth/AuthContext'

// Step1 values: everything except images
type Step1Values = Omit<FormValues, 'images'>

// helper schemas
const coordinatesSchema = yup
  .tuple([yup.number().required(), yup.number().required()])
  .required()

// **strict** string[] schema
const stringArraySchema = yup
  .array()
  .of(yup.string().required())   // each item must be a non-empty string
  .ensure()                      // cast undefined → []
  .required()                    // the field itself is required
  .default([])                   // default to empty array

const schema: yup.ObjectSchema<Step1Values> = yup
  .object({
    title:        yup.string().required('Title is required'),
    description:  yup.string().required('Description is required'),
    price:        yup.number().min(0, 'Price must be ≥ 0').required(),
    rooms:        yup.number().min(1, 'At least 1 room').required(),
    propertyType: yup.string().required('Type is required'),
    amenities:    stringArraySchema,    // now strictly string[]
    location: yup
      .object({
        address:     yup.string().required('Address is required'),
        city:        yup.string().required('City is required'),
        state:       yup.string().required('State is required'),
        zip:         yup.string().required('ZIP is required'),
        country:     yup.string().required('Country is required'),
        coordinates: coordinatesSchema,
      })
      // cast to the exact TS type of Step1Values.location
      .required() as yup.Schema<Step1Values['location']>,
    hostId:       yup.string().required(),
  })
  .required()

interface Props {
  /** Called when step1 form completes; receives values without images */
  onSubmit: SubmitHandler<Step1Values>
}

export default function CreateStepDetails({ onSubmit }: Props) {
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Step1Values>({
    defaultValues: {
      title:        '',
      description:  '',
      price:        0,
      rooms:        1,
      propertyType: '',
      amenities:    [],                // will pass through stringArraySchema
      location: {
        address:     '',
        city:        '',
        state:       '',
        zip:         '',
        country:     '',
        coordinates: [0, 0],
      },
      hostId: user?.id ?? '',
    },
    resolver: yupResolver(schema),
    mode:     'onChange',
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      
      className="space-y-4 max-w-2xl"
    >
      {/* Title */}
      <div>
        <label className="block font-medium">Title</label>
        <input {...register('title')} className="input w-full" />
        {errors.title && (
          <p className="text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block font-medium">Description</label>
        <textarea
          {...register('description')}
          rows={4}
          className="input w-full"
        />
        {errors.description && (
          <p className="text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Price & Rooms */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block font-medium">Price (USD)</label>
          <input type="number" {...register('price')} className="input w-full" />
          {errors.price && (
            <p className="text-red-500">{errors.price.message}</p>
          )}
        </div>
        <div className="w-28">
          <label className="block font-medium">Rooms</label>
          <input type="number" {...register('rooms')} className="input w-full" />
          {errors.rooms && (
            <p className="text-red-500">{errors.rooms.message}</p>
          )}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="block font-medium">Property Type</label>
        <select {...register('propertyType')} className="input w-full">
          <option value="">Select…</option>
          {[
            'House','Apartment','Cabin','Studio','Villa',
            'Townhouse','Condo','Loft','Mansion','Other',
          ].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {errors.propertyType && (
          <p className="text-red-500">{errors.propertyType.message}</p>
        )}
      </div>

      {/* Amenities */}
      <div>
        <label className="block font-medium mb-1">Amenities</label>
        <div className="grid grid-cols-2 gap-1">
          {[
            'Wi‑Fi','Kitchen','Washer','Dryer','Free parking',
            'Air conditioning','Pool','Hot tub','EV charger',
          ].map((a) => (
            <label key={a} className="flex items-center space-x-1 text-sm">
              <input type="checkbox" value={a} {...register('amenities')} />
              <span>{a}</span>
            </label>
          ))}
        </div>
        {errors.amenities && (
          <p className="text-red-500">{errors.amenities.message}</p>
        )}
      </div>

      {/* Location */}
      <Controller
        name="location"
        control={control}
        render={({ field }) => (
          <LocationPicker value={field.value} onChange={field.onChange} />
        )}
      />
      {errors.location && (
        <p className="text-red-500">Please complete the address</p>
      )}

      <button
        type="submit"
        className="btn-primary"
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? 'Saving…' : 'Continue to photos'}
      </button>
    </form>
  )
}