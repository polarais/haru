import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface WriteEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: number | null;
  onSave: (entry: {
    date: number;
    mood: string;
    title: string;
    content: string;
  }) => void;
}

export function WriteEntryModal({ isOpen, onClose, selectedDate, onSave }: WriteEntryModalProps) {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');

  const moodOptions = [
    { emoji: '😊', label: '행복해요' },
    { emoji: '😌', label: '평온해요' },
    { emoji: '🥰', label: '사랑스러워요' },
    { emoji: '😆', label: '즐거워요' },
    { emoji: '🤔', label: '생각이 많아요' },
    { emoji: '😢', label: '슬퍼요' },
    { emoji: '😔', label: '우울해요' },
    { emoji: '😤', label: '화나요' },
    { emoji: '😴', label: '피곤해요' },
    { emoji: '😐', label: '그저 그래요' }
  ];

  const handleSave = () => {
    if (!selectedDate || !selectedMood || !title.trim()) {
      return;
    }

    onSave({
      date: selectedDate,
      mood: selectedMood,
      title: title.trim(),
      content: content.trim()
    });

    // Reset form
    setSelectedMood('');
    setTitle('');
    setContent('');
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setSelectedMood('');
    setTitle('');
    setContent('');
    onClose();
  };

  const getDateString = () => {
    if (!selectedDate) return '';
    return `9월 ${selectedDate}일`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            <span className="text-pink-500">✨</span>
            {getDateString()} 일기 쓰기
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            오늘의 기분과 마음속 이야기를 자유롭게 기록해보세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mood Selection */}
          <div>
            <Label className="text-gray-700 mb-3 block">오늘의 기분은 어떠세요?</Label>
            <div className="grid grid-cols-5 gap-3">
              {moodOptions.map(mood => (
                <button
                  key={mood.emoji}
                  type="button"
                  onClick={() => setSelectedMood(mood.emoji)}
                  className={`
                    p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-2
                    hover:bg-pink-50 hover:scale-105
                    ${selectedMood === mood.emoji 
                      ? 'bg-pink-100 ring-2 ring-pink-300 scale-105' 
                      : 'bg-gray-50'
                    }
                  `}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs text-gray-600">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <Label htmlFor="title" className="text-gray-700 mb-2 block">
              제목 <span className="text-pink-400">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="오늘 하루를 한 줄로 표현해보세요..."
              className="rounded-xl border-pink-200 focus:border-pink-400 focus:ring-pink-200"
            />
          </div>

          {/* Content Textarea */}
          <div>
            <Label htmlFor="content" className="text-gray-700 mb-2 block">
              마음속 이야기
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 있었던 일, 느꼈던 감정들을 자유롭게 적어보세요. 이곳은 오직 당신만의 공간입니다..."
              className="rounded-xl border-pink-200 focus:border-pink-400 focus:ring-pink-200 min-h-[200px] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="rounded-xl border-gray-200 hover:bg-gray-50"
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!selectedMood || !title.trim()}
              className="rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-2">💕</span>
              저장하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}