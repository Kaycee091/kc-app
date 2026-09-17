import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { Button } from '../ui/Button';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle2, Clock, Share2, Globe, Tag } from 'lucide-react';
import { router } from '../../router';
import { format } from 'date-fns';

interface EventDetailPageProps {
  eventId: string;
}

const safeFormatDate = (dateStr?: string) => {
  if (!dateStr) return { date: 'Upcoming', time: 'TBA' };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: 'Upcoming', time: 'TBA' };
    return {
      date: format(d, 'EEEE, MMMM d, yyyy'),
      time: format(d, 'h:mm a'),
    };
  } catch {
    return { date: 'Upcoming', time: 'TBA' };
  }
};

export const EventDetailPage: React.FC<EventDetailPageProps> = ({ eventId }) => {
  const { events, toggleRsvpEvent } = useSocial();
  const [copied, setCopied] = useState(false);

  const event = events.find((e) => e.id === eventId) || events[0];

  if (!event) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 max-w-xl mx-auto mt-8">
        <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h2 className="text-xl font-black text-slate-800 dark:text-white">Event Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The event you are looking for may have been deleted or expired.</p>
        <Button variant="outline" className="mt-5" onClick={() => router.navigate('/events')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  const title = event.title || event.name || 'Connecta Event';
  const coverUrl =
    event.cover_url ||
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80';
  const { date: formattedDate, time: formattedTime } = safeFormatDate(event.start_time || event.event_date);
  const attendeesCount = event.attendees_count ?? event.going_count ?? 0;
  const interestedCount = event.interested_count ?? 0;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16 animate-fade-in">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.navigate('/events')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all events
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-400" />
          {copied ? 'Link Copied!' : 'Share'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800">
        {/* Cover Banner */}
        <div className="h-60 sm:h-80 bg-cover bg-center relative bg-slate-200 dark:bg-slate-800" style={{ backgroundImage: `url(${coverUrl})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 text-white">
            {event.category && (
              <span className="inline-block px-3 py-1 rounded-lg bg-blue-600/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider mb-2">
                {event.category}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-black drop-shadow-md leading-tight">{title}</h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Event Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#2563EB] flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{formattedTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{event.location}</p>
              </div>
            </div>
          </div>

          {/* RSVP Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-slate-400" />
              <div>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {attendeesCount} {attendeesCount === 1 ? 'person' : 'people'} going
                </span>
                <span className="text-xs text-slate-500 ml-2">({interestedCount} interested)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={event.rsvp_status === 'going' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => toggleRsvpEvent(event.id, 'going')}
                className={event.rsvp_status === 'going' ? 'bg-[#2563EB] text-white' : ''}
              >
                {event.rsvp_status === 'going' ? '✓ You Are Going' : 'RSVP Going'}
              </Button>
              <Button
                variant={event.rsvp_status === 'interested' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => toggleRsvpEvent(event.id, 'interested')}
                className={event.rsvp_status === 'interested' ? 'bg-blue-50 text-[#2563EB] dark:bg-blue-900/40' : ''}
              >
                {event.rsvp_status === 'interested' ? '★ Interested' : 'Interested'}
              </Button>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-base font-black text-slate-900 dark:text-white">About this Event</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description || 'Join us for an exciting gathering! Connect with attendees and experience great activities.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
