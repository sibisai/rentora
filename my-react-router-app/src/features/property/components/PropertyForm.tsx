// src/features/property/components/PropertyForm.tsx
import React from 'react';
import {
  useForm,
  type SubmitHandler,
} from 'react-hook-form';
import { yupResolver }           from '@hookform/resolvers/yup';
import * as yup                  from 'yup';
import type { FormValues }       from '../types';

/* ──────────────── Yup helpers ──────────────── */

const coordinatesSchema = yup
  .tuple([yup.number().required(), yup.number().required()])
  .required() as yup.Schema<[number, number]>;

const stringArrayRequired = yup
  .array()
  .of(yup.string().required())
  .required() as yup.Schema<string[]>;

/* ──────────────── Schema ───────────────────── */

const schema: yup.ObjectSchema<FormValues> = yup
  .object({
    title:       yup.string().required('Title is required'),
    description: yup.string().required('Description is required'),
    price:       yup.number().min(0, 'Price must be ≥ 0').required(),

    location: yup.object({
      address:     yup.string().required(),
      city:        yup.string().required(),
      state:       yup.string().required(),
      zip:         yup.string().required(),
      country:     yup.string().required(),
      coordinates: coordinatesSchema,
    }),

    images:       stringArrayRequired,   // <-- REQUIRED now
    amenities:    stringArrayRequired,   // <-- REQUIRED now
    propertyType: yup.string().required(),
    rooms:        yup.number().min(1).required(),
    hostId:       yup.string().required(),
  })
  .required();

/* ──────────────── Component ────────────────── */

type Props = {
  initialValues?: FormValues;
  onSubmit:      SubmitHandler<FormValues>;
};

export default function PropertyForm({ initialValues, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: initialValues ?? {
      title:       '',
      description: '',
      price:       0,
      location: {
        address:     '',
        city:        '',
        state:       '',
        zip:         '',
        country:     '',
        coordinates: [0, 0],
      },
      images:       [],   // these keys are *always* present
      amenities:    [],
      propertyType: '',
      rooms:        1,
      hostId:       '',
    },
    resolver: yupResolver(schema),
    mode:     'onChange',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div>
        <label>Title</label>
        <input {...register('title')} className="input" />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label>Description</label>
        <textarea {...register('description')} className="input" />
        {errors.description && (
          <p className="text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Price */}
      <div>
        <label>Price</label>
        <input type="number" {...register('price')} className="input" />
        {errors.price && <p className="text-red-500">{errors.price.message}</p>}
      </div>

      {/* TODO: LocationPicker, ImageUploader, etc. */}

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="btn-primary"
      >
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}