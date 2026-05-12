import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Book() {
  const { salonId, serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>('10:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase.from('salon_services').select('*, businesses(name)').eq('id', serviceId).single();
      if (error) throw error;
      return data;
    }
  });

  const handleBook = async () => {
    if (!date || !service || !user) return;
    setIsSubmitting(true);

    const { error } = await supabase.from('bookings').insert({
      customer_id: user.id,
      business_id: salonId,
      service_id: serviceId,
      booking_date: format(date, 'yyyy-MM-dd'),
      start_time: `${time}:00`,
      end_time: `${time}:00`,
      total_price: service.price,
      status: 'pending'
    });

    setIsSubmitting(false);

    if (error) {
      alert("Booking failed: " + error.message);
    } else {
      alert("Booking confirmed!");
      navigate('/profile');
    }
  };

  if (isLoading) {
    return <div className="flex min-h-dvh items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-4 pb-[calc(9rem+env(safe-area-inset-bottom))] sm:pb-8">
      <h2 className="mb-6 text-2xl font-bold">Book Appointment</h2>

      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-bold">{service?.businesses?.name}</h3>
        <p className="text-gray-600">{service?.name}</p>
        <p className="mt-2 font-bold text-primary">Rs. {service?.price}</p>
      </div>

      <h4 className="mb-3 font-semibold">Select Date</h4>
      <div className="mb-6 flex justify-center overflow-x-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border-0"
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
        />
      </div>

      <h4 className="mb-3 font-semibold">Select Time</h4>
      <div className="mb-8 grid grid-cols-2 gap-3 min-[420px]:grid-cols-3">
        {['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map((slot) => (
          <button
            key={slot}
            onClick={() => setTime(slot)}
            className={`rounded-xl py-2 text-sm font-semibold transition-colors ${time === slot ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {slot}
          </button>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 border-t border-gray-100 bg-white p-4 sm:static sm:mt-8 sm:rounded-2xl sm:border">
        <Button onClick={handleBook} disabled={isSubmitting || !date} className="h-12 w-full rounded-xl text-base shadow-lg sm:text-lg">
          {isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : `Confirm Booking - Rs. ${service?.price}`}
        </Button>
      </div>
    </div>
  );
}
