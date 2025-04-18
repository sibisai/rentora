import React, { useEffect, useState } from "react";
import { Calendar } from "@demark-pro/react-booking-calendar";
import "@demark-pro/react-booking-calendar/dist/react-booking-calendar.css";

export default function HostCalendar({ propertyId }: any) {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetch(`/api/bookings/${propertyId}`)
            .then(res => res.json())
            .then(data => {
                const formatted = data.map((b: any) => ({
                    startDate: new Date(b.startDate),
                    endDate: new Date(b.endDate)
                }));
                setBookings(formatted);
            });
    }, [propertyId]);

    return <Calendar reserved={bookings} />;
};