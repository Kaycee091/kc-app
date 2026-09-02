import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Store, Plus, MapPin, Tag } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { uploadFile } from '../../services/storageService';

export const MarketplaceView: React.FC = () => {
  const { marketplaceListings, createListing } = useSocial();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Listing Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [condition, setCondition] = useState('New');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const filtered = categoryFilter === 'all'
    ? marketplaceListings
    : marketplaceListings.filter((item) => item.category.toLowerCase() === categoryFilter.toLowerCase());

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadFile(file);
      setImageUrl(res.url);
    } catch (e) {}
    setIsUploading(false);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return;
    createListing({
      title,
      price: parseFloat(price),
      category,
      condition,
      description,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
    });
    setTitle('');
    setPrice('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">KC Marketplace</h2>
          <p className="text-xs text-slate-500">Buy & sell items locally with trusted network members.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Create Listing
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm group">
            <div className="h-48 overflow-hidden relative">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/80 text-white font-black text-xs backdrop-blur-md">
                ${item.price.toLocaleString()}
              </span>
            </div>

            <div className="p-4 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{item.location}</span>
                <span>·</span>
                <span className="font-semibold text-[#2563EB]">{item.condition}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
              
              <div className="pt-2 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar src={item.seller?.avatar_url} name={item.seller?.full_name || 'Seller'} size="xs" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{item.seller?.first_name}</span>
                </div>
                <Button size="sm" variant="outline">
                  Contact Seller
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Marketplace Listing">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Product Title" placeholder="e.g. MacBook Pro M2" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="Price ($)" type="number" placeholder="1850" value={price} onChange={(e) => setPrice(e.target.value)} required />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-800">
                <option value="Electronics">Electronics</option>
                <option value="Cameras">Cameras</option>
                <option value="Home & Office">Home & Office</option>
                <option value="Vehicles">Vehicles</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Condition</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full p-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-800">
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Upload Product Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs text-slate-500" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isUploading}>
              Publish Listing
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
