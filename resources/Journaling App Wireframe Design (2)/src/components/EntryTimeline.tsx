import React from 'react';

interface DiaryEntry {
  id: string;
  date: number;
  mood: string;
  title: string;
  preview: string;
  hasPhoto?: boolean;
}

interface EntryTimelineProps {
  entries: DiaryEntry[];
  onEntryClick?: (entry: DiaryEntry) => void;
}

export function EntryTimeline({ entries, onEntryClick }: EntryTimelineProps) {
  const sortedEntries = entries.sort((a, b) => b.date - a.date); // Sort by date, newest first

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-gray-600 mb-2">All Journal Entries</h2>
        <p className="text-sm text-gray-500">
          {entries.length > 0 
            ? `${entries.length} entries in September 2025 • Your emotional journey, one entry at a time`
            : 'No entries yet this month'
          }
        </p>
      </div>
      
      <div className="space-y-6">
        {sortedEntries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-gray-500 mb-2">No entries yet this month</p>
            <p className="text-sm text-gray-400">Click the + button to start your journaling journey</p>
          </div>
        ) : (
          sortedEntries.map(entry => (
            <div
              key={entry.id}
              onClick={() => onEntryClick?.(entry)}
              className="bg-gradient-to-r from-gray-50 to-pink-50 rounded-2xl p-6 shadow-sm border border-pink-100 hover:shadow-md hover:border-pink-200 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{entry.mood}</span>
                  <div>
                    <p className="text-sm text-gray-500">September {entry.date}, 2025</p>
                    <h3 className="text-gray-800 group-hover:text-pink-600 transition-colors">
                      {entry.title}
                    </h3>
                  </div>
                </div>
                {entry.hasPhoto && (
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-200 to-rose-200 rounded-lg flex items-center justify-center">
                    <span className="text-sm">📸</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 leading-relaxed line-clamp-2">
                {entry.preview}
              </p>
              
              <div className="mt-3 flex items-center text-sm text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Read more →</span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Spacer for floating button */}
      <div className="h-20"></div>
    </div>
  );
}