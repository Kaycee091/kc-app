import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { Button } from '../ui/Button';
import { ThumbsUp, ArrowLeft, Globe, Share2 } from 'lucide-react';
import { router } from '../../router';
import { PostCard } from '../feed/PostCard';

interface PageDetailPageProps {
  pageId: string;
}

export const PageDetailPage: React.FC<PageDetailPageProps> = ({ pageId }) => {
  const { pages, toggleFollowPage, posts } = useSocial();
  const page = pages.find((p) => p.id === pageId) || pages[0];

  if (!page) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Page Not Found</h2>
        <Button variant="outline" className="mt-4" onClick={() => router.navigate('/pages')}>
          Back to Pages
        </Button>
      </div>
    );
  }

  const pagePosts = posts.filter((p) => p.author?.full_name === page.name);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-700/80">
        <div className="h-48 sm:h-64 bg-cover bg-center relative" style={{ backgroundImage: `url(${page.cover_url})` }}>
          <button
            onClick={() => router.navigate('/pages')}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{page.name}</h1>
            <p className="text-xs text-slate-500 font-bold mt-0.5">{page.category} • {page.followers_count} Followers</p>
          </div>

          <Button
            variant={page.is_following ? 'outline' : 'primary'}
            onClick={() => toggleFollowPage(page.id)}
            leftIcon={<ThumbsUp className="w-4 h-4" />}
          >
            {page.is_following ? 'Following Page' : 'Follow Page'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 px-1">Official Posts</h3>
        {pagePosts.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500">No official page posts yet.</p>
          </div>
        ) : (
          pagePosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};
