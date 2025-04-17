import React            from 'react';
import {
  useForm, Controller, type SubmitHandler,
}                       from 'react-hook-form';
import { yupResolver }  from '@hookform/resolvers/yup';
import * as yup         from 'yup';

import LocationPicker   from './LocationPicker';
import ImageUploader    from './ImageUploader';
import { useAuth } from 'src/features/auth/AuthContext';
import type { FormValues } from '../types';

/* ─────────────────── helpers ─────────────────── */
const coordinates = yup
  .tuple([yup.number().required(), yup.number().required()])
  .required()          as yup.Schema<[number, number]>;

const stringArray = yup
  .array()
  .of(yup.string().required())
  .default([])          // <= ensures [] instead of undefined
  .defined(); 

/* ─────────────────── schema ─────────────────────
   Images are **optional on create** but **required on edit**           */
export const schema: yup.ObjectSchema<FormValues> = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().min(0).required('Price is required'),

  location: yup.object({
    address: yup.string().required(),
    city:    yup.string().required(),
    state:   yup.string().required(),
    zip:     yup.string().required(),
    country: yup.string().required(),
    coordinates,
  }),

  images: stringArray.when('$isEdit', (isEdit, s) =>
           isEdit ? s.min(1, 'Upload at least one image') : s),

  amenities: stringArray,

  propertyType: yup.string().required(),
  rooms:        yup.number().min(1).required(),
  hostId:       yup.string().required(),
}).required();

/* ─────────────────── constants ────────────────── */
const PROPERTY_TYPES = [
  'House','Apartment','Cabin','Studio','Villa',
  'Townhouse','Condo','Loft','Mansion','Other',
] as const;

const AMENITIES = [
  'Wi‑Fi','Kitchen','Washer','Dryer','Free parking',
  'Air conditioning','Pool','Hot tub','EV charger',
];

/* ─────────────────── component ────────────────── */
type Props = {
  initialValues?: (FormValues & { _id?: string });
  onSubmit:       SubmitHandler<FormValues>;
};

export default function PropertyForm({ initialValues, onSubmit }: Props) {
  const { user } = useAuth();

  const isEdit = Boolean(initialValues?._id);

  const {
    register, handleSubmit, control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: initialValues ?? {
      title: '', description: '', price: 0,
      location:   { address:'', city:'', state:'', zip:'', country:'', coordinates:[0,0] },
      images:     [],            // ← REAL values, no schema here!
      amenities:  [],
      propertyType:'', rooms:1,
      hostId:      user?.id ?? '',
    },
    resolver: yupResolver(schema),
    context:  { isEdit },        // let Yup know which branch to use
    mode:     'onChange',
  });

  /* ----------- render (same layout as before) ----------- */
  return (
    <form onSubmit={handleSubmit(onSubmit)}
          className="grid gap-6 md:grid-cols-2">

      {/* ——— left column ——— */}
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
          <textarea {...register('description')}
                    rows={4} className="input w-full" />
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

        {/* Property type */}
        <div>
          <label className="block font-medium">Property Type</label>
          <select {...register('propertyType')} className="input w-full">
            <option value="">Select…</option>
            {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          {errors.propertyType && <p className="text-red-500">{errors.propertyType.message}</p>}
        </div>

        {/* Amenities */}
        <div>
          <label className="block font-medium mb-1">Amenities</label>
          <div className="grid grid-cols-2 gap-1">
            {AMENITIES.map(a => (
              <label key={a} className="flex items-center space-x-1 text-sm">
                <input type="checkbox" value={a} {...register('amenities')} />
                <span>{a}</span>
              </label>
            ))}
          </div>
          {errors.amenities && <p className="text-red-500">{errors.amenities.message}</p>}
        </div>
      </div>

      {/* ——— right column ——— */}
      <div className="space-y-6">
        <Controller
          name="location"
          control={control}
          render={({ field }) =>
            <LocationPicker value={field.value} onChange={field.onChange} />}
        />

        <Controller
          name="images"
          control={control}
          render={({ field }) =>
            <ImageUploader
              propertyId={initialValues?._id}  /* undefined on create */
              value={field.value}
              onChange={field.onChange}
            />}
        />

        {errors.images && <p className="text-red-500">{errors.images.message}</p>}
      </div>

      {/* ——— submit ——— */}
      <div className="md:col-span-2">
        <button type="submit"
                disabled={!isValid || isSubmitting}
                className="btn-primary w-full md:w-auto">
          {isSubmitting ? 'Saving…' : 'Save Listing'}
        </button>
      </div>
    </form>
  );
}