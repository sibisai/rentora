export interface Location {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  coordinates: [number, number];
}

/** Mongo‑persisted property */
export interface Property {
  _id?: string;      // present after a save
  title: string;
  description: string;
  location: Location;
  price: number;
  images: string[];
  amenities: string[];
  propertyType: string;
  rooms: number;
  hostId: string;
}

/** The exact shape your form works with
 *  (= everything except Mongo’s _id) */
export type FormValues = Omit<Property, '_id'>;