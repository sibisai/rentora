// src/features/property/propertyService.ts
import axios from "axios";
import type { FormValues, Property } from "./types";

// const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
const API = import.meta.env.VITE_API_URL;

export async function getHostProperties(hostId: string): Promise<Property[]> {
  const { data } = await axios.get<Property[]>(`${API}/properties?hostId=${hostId}`);
  return data;
}

export async function getProperty(id: string): Promise<Property> {
  const { data } = await axios.get<Property>(`${API}/properties/${id}`);
  return data;
}

export async function deleteProperty(id: string): Promise<void> {
  await axios.delete(`${API}/properties/${id}`);
}

export async function createProperty(payload: Omit<Property, "_id">): Promise<Property> {
  const { data } = await axios.post<Property>(`${API}/properties`, payload);
  return data;
}

export async function updateProperty(
  id: string,
  payload: Partial<FormValues>
): Promise<Property> {
  // wrap coords before sending
  const toSend = {
    ...payload,
    location: payload.location && {
      ...payload.location,
      coordinates: {
        type: 'Point',
        coordinates: payload.location.coordinates,
      },
    },
  };

  const { data } = await axios.put<Property>(
    `${API}/properties/${id}`,
    toSend
  );
  return data;
}