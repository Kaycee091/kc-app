import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { Button } from '../ui/Button';
import { Calendar, MapPin, Plus, Check } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { format } from 'date-fns';

export const EventsView: React.FC = () => {
  const { events, toggleRsvpEvent } = useSocial();

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Upcoming Events</h2>
          <p className="text-xs text-slate-500">Discover meetups, developer conferences, and social gatherings.</p>
        </div>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row">
            <img src={event.cover_url} alt={event.title} className="w-full sm:w-64 h-48 object-cover flex-shrink-0" />
            
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#2563EB] font-bold">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(event.start_time), 'EEEE, MMMM d, yyyy · h:mm a')}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{event.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{event.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{event.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-xs font-bold text-slate-500">{event.attendees_count} attending</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={event.rsvp_status === 'going' ? 'primary' : 'outline'}
                    onClick={() => toggleRsvpEvent(event.id, 'going')}
                  >
                    {event.rsvp_status === 'going' ? '✓ Going' : 'Going'}
                  </Button>
                  <Button
                    size="sm"
                    variant={event.rsvp_status === 'interested' ? 'secondary' : 'ghost'}
                    onClick={() => toggleRsvpEvent(event.id, 'interested')}
                  >
                    Interested
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
