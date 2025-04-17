// src/features/property/components/LocationPicker.tsx
import React, { useRef } from 'react';
import { StandaloneSearchBox, useJsApiLoader } from '@react-google-maps/api';
import type { Location } from '../types';

type Props = {
  value: Location;
  onChange: (loc: Location) => void;
};

export default function LocationPicker({ value, onChange }: Props) {
  /* load the **Places** library only – no Maps JavaScript */
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: ['places'],
    id: 'places-only', 
    version: 'weekly'
  });

  const searchRef = useRef<google.maps.places.SearchBox | null>(null);

  const onPlacesChanged = () => {
    if (!searchRef.current) return;
    const [place] = searchRef.current.getPlaces() ?? [];
    if (!place?.geometry?.location) return;

    const loc  = place.geometry.location;
    const comps = place.address_components ?? [];
    const get = (t: string) =>
      comps.find(c => c.types.includes(t))?.long_name ?? '';

    onChange({
      address:  `${get('street_number')} ${get('route')}`.trim(),
      city:     get('locality'),
      state:    get('administrative_area_level_1'),
      zip:      get('postal_code'),
      country:  get('country'),
      coordinates: [loc.lng(), loc.lat()],
    });
  };

  if (!isLoaded) return <p>Loading address picker…</p>;

  return (
    <StandaloneSearchBox
      onLoad={ref => (searchRef.current = ref)}
      onPlacesChanged={onPlacesChanged}
    >
      <input
        className="input w-full"
        placeholder="Start typing an address…"
        defaultValue={value.address}
      />
    </StandaloneSearchBox>
  );
}