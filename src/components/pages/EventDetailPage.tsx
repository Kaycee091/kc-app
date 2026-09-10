import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { Button } from '../ui/Button';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { router } from '../../router';

interface EventDetailPageProps {
  eventId: string;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({ eventId }) => {
  const { events, toggleRsvpEvent } = useSocial();
  const event = events.find((e) => e.id === eventId) || events[0];

  if (!event) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Event Not Found</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.navigate('/events')}>
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-700/80">
        <div className="h-48 sm:h-64 bg-cover bg-center relative" style={{ backgroundImage: `url(${event.cover_url})` }}>
          <button
            onClick={() => router.navigate('/events')}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <span className="text-xs font-black uppercase text-[#2563EB] tracking-wider">{event.category}</span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{event.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 mt-3">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-500" /> {new Date(event.start_time).toLocaleDateString()}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" /> {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-500" /> {event.location}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <Button
              variant={event.rsvp_status === 'going' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => toggleRsvpEvent(event.id, 'going')}
            >
              Going ({event.attendees_count})
            </Button>
            <Button
              variant={event.rsvp_status === 'interested' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => toggleRsvpEvent(event.id, 'interested')}
            >
              Interested ({event.interested_count})
            </Button>
          </div>

          <div className="pt-2 text-xs text-slate-600 dark:text-slate-300">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">About this event</h4>
            <p>{event.description || 'Join us for an exciting gathering! Connect with attendees and experience great activities.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
