// src/features/property/propertyService.ts
import axios from "axios";
import type { FormValues, Property } from "./types";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export async function getHostProperties(hostId: string): Promise<Property[]> {
  const { data } = await axios.get<Property[]>(`${BASE}/properties?hostId=${hostId}`);
  return data;
}

export async function getProperty(id: string): Promise<Property> {
  const { data } = await axios.get<Property>(`${BASE}/properties/${id}`);
  return data;
}

export async function deleteProperty(id: string): Promise<void> {
  await axios.delete(`${BASE}/properties/${id}`);
}

export async function createProperty(payload: Omit<Property, "_id">): Promise<Property> {
  const { data } = await axios.post<Property>(`${BASE}/properties`, payload);
  return data;
}

export async function updateProperty(
  id: string,
  payload: Partial<FormValues>
): Promise<Property> {
  const { data } = await axios.put<Property>(`${BASE}/properties/${id}`, payload);
  return data;
}