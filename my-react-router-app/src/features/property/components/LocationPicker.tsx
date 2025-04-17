// src/features/property/components/LocationPicker.tsx
import React, { useRef } from 'react';
import {
  GoogleMap,
  Marker,
  StandaloneSearchBox,
  useJsApiLoader,
} from '@react-google-maps/api';
import type { Location } from '../types';

type Props = {
  value: Location;
  onChange: (loc: Location) => void;
};

const containerStyle = { width: '100%', height: '250px' };

export default function LocationPicker({ value, onChange }: Props) {
  /* -------------------------------------------------- */
  /*  load Maps JS API + Places library                 */
  /* -------------------------------------------------- */
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY!,
    libraries: ['places'],
  });

  /* reference to the <StandaloneSearchBox /> instance */
  const searchRef = useRef<google.maps.places.SearchBox | null>(null);

  /* -------------------------------------------------- */
  /*  when the user selects an address                  */
  /* -------------------------------------------------- */
  const onPlacesChanged = () => {
    if (!searchRef.current) return;

    const places = searchRef.current.getPlaces();           // PlaceResult[] | undefined
    if (!places || !places.length) return;

    const place = places[0];                                // safe to index now
    const loc   = place.geometry?.location;
    if (!loc) return;

    const [lng, lat] = [loc.lng(), loc.lat()];

    const comps = place.address_components ?? [];

    const get = (type: string) =>
      comps.find((c: google.maps.GeocoderAddressComponent) =>
        c.types.includes(type),
      )?.long_name ?? '';

    onChange({
      address:  `${get('street_number')} ${get('route')}`.trim(),
      city:     get('locality'),
      state:    get('administrative_area_level_1'),
      zip:      get('postal_code'),
      country:  get('country'),
      coordinates: [lng, lat],
    });
  };

  /* -------------------------------------------------- */
  /*  render                                            */
  /* -------------------------------------------------- */
  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <div className="space-y-2">
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

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat: value.coordinates[1], lng: value.coordinates[0] }}
        zoom={13}
        onClick={e =>
          onChange({
            ...value,
            coordinates: [e.latLng!.lng(), e.latLng!.lat()],
          })
        }
      >
        <Marker
          position={{ lat: value.coordinates[1], lng: value.coordinates[0] }}
        />
      </GoogleMap>
    </div>
  );
}