import React from 'react'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { yupResolver }  from '@hookform/resolvers/yup'
import * as yup         from 'yup'
import HostCalendar from 'src/features/host/components/HostCalendar'
import LocationPicker   from './LocationPicker'
import ImageUploader    from './ImageUploader'
import { useAuth }      from '../../auth/AuthContext'
import type { FormValues } from '../types'
import '../styles/property-forms.css'

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-grid">
        <div className="form-col">
          <div className="form-group">
            <label>Title</label>
            <input {...register('title')} type="text" />
            {errors.title && <p className="error">{errors.title.message}</p>}
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea {...register('description')} rows={4} />
            {errors.description && <p className="error">{errors.description.message}</p>}
          </div>
          <div className="form-group">
            <label>Price (USD)</label>
            <input {...register('price')} type="number" />
            {errors.price && <p className="error">{errors.price.message}</p>}
          </div>
          <div className="form-group">
            <label>Rooms</label>
            <input {...register('rooms')} type="number" />
            {errors.rooms && <p className="error">{errors.rooms.message}</p>}
          </div>
          <div className="form-group">
            <label>Property Type</label>
            <select {...register('propertyType')}>
              <option value="">Select…</option>
              {['House','Apartment','Cabin','Studio','Villa','Townhouse','Condo','Loft','Mansion','Other']
                .map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.propertyType && <p className="error">{errors.propertyType.message}</p>}
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
            {errors.amenities && <p className="error">{errors.amenities.message}</p>}
          </div>
        </div>

        <div className="form-col">
          <div className="form-group">
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <LocationPicker value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.location && <p className="error">Please complete the address</p>}
          </div>
          <div className="form-group">
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
            {errors.images && <p className="error">{errors.images.message}</p>}
          </div>
         <HostCalendar propertyId={initialValues?._id} />
        </div>
      </div>

      <div className="form-footer">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Listing'}
        </button>
      </div>
    </form>
  )
}