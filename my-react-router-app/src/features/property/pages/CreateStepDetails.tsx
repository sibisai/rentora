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
    <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
      {/* left column */}
      <div className="form-col">
        <div className="form-group">
          <label>Title</label>
          <input {...register('title')} />
          {errors.title  && <div className="error">{errors.title.message}</div>}
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea {...register('description')} rows={4} />
          {errors.description && <div className="error">{errors.description.message}</div>}
        </div>

        <div className="form-group">
          <label>Price (USD)</label>
          <input type="number" {...register('price')} />
          {errors.price && <div className="error">{errors.price.message}</div>}
        </div>

        <div className="form-group">
          <label>Rooms</label>
          <input type="number" {...register('rooms')} />
          {errors.rooms && <div className="error">{errors.rooms.message}</div>}
        </div>
      </div>

      {/* right column */}
      <div className="form-col">
        <div className="form-group">
          <label>Property Type</label>
          <select {...register('propertyType')}>
            <option value="">Select…</option>
            {['House','Apartment','Cabin','Studio','Villa','Townhouse','Condo','Loft','Mansion','Other']
              .map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.propertyType && <div className="error">{errors.propertyType.message}</div>}
        </div>

        <div className="form-group">
          <label>Amenities</label>
          <div className="checkbox-grid">
            {['Wi‑Fi','Kitchen','Washer','Dryer','Free parking','Air conditioning','Pool','Hot tub','EV charger']
              .map(a => (
                <label key={a}>
                  <input type="checkbox" value={a} {...register('amenities')} /> {a}
                </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Location</label>
          <Controller
            name="location"
            control={control}
            render={({ field }) =>
              <LocationPicker value={field.value} onChange={field.onChange} />
            }
          />
          {errors.location && <div className="error">Address required</div>}
        </div>
      </div>

      <div className="form-footer" style={{ flexBasis: '100%' }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!isValid || isSubmitting}
        >
          Continue to photos
        </button>
      </div>
    </form>
  )
}