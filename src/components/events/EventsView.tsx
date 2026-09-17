import React, { useState, useMemo } from 'react';
import { useSocial } from '../../context/SocialContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Calendar, MapPin, Plus, Search, Filter, Sparkles, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { router } from '../../router';

const formatEventDate = (dateStr?: string) => {
  if (!dateStr) return 'Upcoming Event';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Upcoming Event';
    return format(d, 'EEEE, MMMM d, yyyy · h:mm a');
  } catch {
    return 'Upcoming Event';
  }
};

const CATEGORIES = ['All', 'Tech & Culture', 'Summit', 'Workshop', 'Networking', 'Social'];

export const EventsView: React.FC = () => {
  const { events, toggleRsvpEvent, createEvent } = useSocial();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state for creating an event
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_time: '',
    category: 'Tech & Culture',
    cover_url: '',
  });

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const title = (e.title || e.name || '').toLowerCase();
      const desc = (e.description || '').toLowerCase();
      const loc = (e.location || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesQuery = !q || title.includes(q) || desc.includes(q) || loc.includes(q);
      const matchesCategory = selectedCategory === 'All' || (e.category || '').toLowerCase() === selectedCategory.toLowerCase();

      return matchesQuery && matchesCategory;
    });
  }, [events, searchQuery, selectedCategory]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    createEvent({
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim() || 'Online',
      start_time: formData.start_time || new Date(Date.now() + 86400000 * 7).toISOString(),
      category: formData.category,
      cover_url: formData.cover_url.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    });

    setIsCreateOpen(false);
    setFormData({
      title: '',
      description: '',
      location: '',
      start_time: '',
      category: 'Tech & Culture',
      cover_url: '',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Events</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400">
              {events.length} upcoming
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Discover tech summits, community gatherings, and interactive workshops.</p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 self-start sm:self-auto bg-[#2563EB] hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Event</span>
        </Button>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search events by name, topic, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No events found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No events matching "${searchQuery}". Try a different keyword or category filter.`
              : 'No upcoming events currently scheduled in this category.'}
          </p>
          {(searchQuery || selectedCategory !== 'All') && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const title = event.title || event.name || 'Connecta Event';
            const dateStr = formatEventDate(event.start_time || event.event_date);
            const coverUrl =
              event.cover_url ||
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80';
            const attendees = event.attendees_count || event.going_count || 0;
            const interested = event.interested_count || 0;

            return (
              <div
                key={event.id}
                onClick={() => router.navigate(`/events/${event.id}`)}
                className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer flex flex-col sm:flex-row"
              >
                <div className="w-full sm:w-64 h-48 sm:h-auto relative overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  <img
                    src={coverUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {event.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white">
                      {event.category}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#2563EB] font-bold">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{dateStr}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#2563EB] transition-colors mt-1">
                      {title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{attendees} attending</span>
                      {interested > 0 && <span className="text-slate-400">· {interested} interested</span>}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={event.rsvp_status === 'going' ? 'primary' : 'outline'}
                        onClick={() => toggleRsvpEvent(event.id, 'going')}
                        className={event.rsvp_status === 'going' ? 'bg-[#2563EB] text-white' : ''}
                      >
                        {event.rsvp_status === 'going' ? '✓ Going' : 'Going'}
                      </Button>
                      <Button
                        size="sm"
                        variant={event.rsvp_status === 'interested' ? 'secondary' : 'ghost'}
                        onClick={() => toggleRsvpEvent(event.id, 'interested')}
                        className={event.rsvp_status === 'interested' ? 'bg-blue-50 text-[#2563EB] dark:bg-blue-900/40' : ''}
                      >
                        {event.rsvp_status === 'interested' ? '★ Interested' : 'Interested'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Event"
        description="Host a community meetup, conference, or workshop."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Event Title *
            </label>
            <Input
              required
              placeholder="e.g. Fullstack React & Django Summit"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Location *
            </label>
            <Input
              required
              placeholder="e.g. San Francisco Tech Hub or Virtual Link"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              leftIcon={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Cover Image URL (Optional)
            </label>
            <Input
              placeholder="https://images.unsplash.com/..."
              value={formData.cover_url}
              onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Tell people what this event is about..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#2563EB] hover:bg-blue-700 text-white">
              Publish Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
