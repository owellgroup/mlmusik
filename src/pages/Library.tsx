import { Library as LibraryIcon, Disc3, Music, Heart, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const libraryItems = [
  {
    name: 'Liked Songs',
    description: 'Your favorite tracks',
    icon: Heart,
    path: '/liked',
    color: 'from-purple-500 to-blue-500',
  },
  {
    name: 'All Songs',
    description: 'Browse all tracks',
    icon: Music,
    path: '/songs',
    color: 'from-orange-500 to-pink-500',
  },
  {
    name: 'Albums',
    description: 'Browse albums',
    icon: Disc3,
    path: '/albums',
    color: 'from-green-500 to-teal-500',
  },
];

export default function Library() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10">
              <LibraryIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Your Library</h1>
              <p className="text-muted-foreground">Access your music collection</p>
            </div>
          </div>
        </div>

        {/* Library Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraryItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group relative h-48 rounded-xl overflow-hidden",
                "transition-all duration-300 hover:scale-105 hover:shadow-xl",
                "opacity-0 animate-fade-in"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br",
                item.color
              )} />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="relative h-full flex flex-col justify-end p-6">
                <item.icon className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white">{item.name}</h3>
                <p className="text-white/80 text-sm">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recently Played */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-bold">Recently Played</h2>
          </div>
          <div className="text-center py-12 bg-card rounded-xl">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your recently played songs will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
