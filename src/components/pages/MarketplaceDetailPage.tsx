import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { useMessenger } from '../../context/MessengerContext';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Store, MapPin, Tag, MessageSquare, ArrowLeft, ShieldCheck, Share2 } from 'lucide-react';
import { router } from '../../router';

interface MarketplaceDetailPageProps {
  itemId: string;
}

export const MarketplaceDetailPage: React.FC<MarketplaceDetailPageProps> = ({ itemId }) => {
  const { marketplaceListings } = useSocial();
  const { openDockedChat } = useMessenger();
  const item = marketplaceListings.find((m) => m.id === itemId) || marketplaceListings[0];

  if (!item) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Item Not Found</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.navigate('/marketplace')}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const handleContactSeller = () => {
    if (item.seller) {
      openDockedChat(item.seller);
      router.navigate('/messages');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      <button
        onClick={() => router.navigate('/marketplace')}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 md:grid-cols-2">
        <div className="bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
          <img src={item.image_url} alt={item.title} className="w-full h-80 sm:h-96 object-contain rounded-2xl" />
        </div>

        <div className="p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">{item.category} • {item.condition}</span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{item.title}</h1>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">${item.price}</p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>{item.location}</span>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Description</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.description || 'No detailed description provided by seller.'}</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900">
              <Avatar src={item.seller?.avatar_url} name={item.seller?.full_name || 'Seller'} size="md" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{item.seller?.full_name}</p>
                <p className="text-[11px] text-slate-400">Seller Identity Verified</p>
              </div>
            </div>

            <Button variant="primary" className="w-full py-3" onClick={handleContactSeller} leftIcon={<MessageSquare className="w-4 h-4" />}>
              Message Seller
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
