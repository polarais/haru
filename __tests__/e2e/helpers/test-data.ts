export interface TestEntry {
  title: string
  content: string
  mood: string
  date?: number
}

export const testEntries: TestEntry[] = [
  {
    title: 'Morning Sunshine',
    content: 'Woke up to beautiful sunlight streaming through my window. Started the day with gratitude and a warm cup of coffee.',
    mood: '☀️'
  },
  {
    title: 'Productive Work Session',
    content: 'Had an incredibly focused work session today. Completed three major tasks and felt really accomplished.',
    mood: '💪'
  },
  {
    title: 'Coffee with Friends',
    content: 'Met with old friends at our favorite coffee shop. We laughed so much and caught up on life. Grateful for these connections.',
    mood: '😊'
  },
  {
    title: 'Challenging Day',
    content: 'Today was tough. Had some difficult conversations and felt overwhelmed. But I managed to get through it and learned something.',
    mood: '😔'
  },
  {
    title: 'Evening Reflection',
    content: 'Taking time to reflect on the week. There were ups and downs, but overall I feel like I\'m growing and learning.',
    mood: '🤔'
  },
  {
    title: 'Creative Breakthrough',
    content: 'Had an amazing creative session today! Ideas were flowing and I made significant progress on my personal project.',
    mood: '🎨'
  },
  {
    title: 'Nature Walk',
    content: 'Spent the afternoon walking in the park. The fresh air and greenery really helped clear my mind and boost my mood.',
    mood: '🌿'
  },
  {
    title: 'Celebration Time',
    content: 'Celebrating a small but meaningful victory today! Sometimes it\'s the little wins that matter most.',
    mood: '🎉'
  }
]

export const aiConversationStarters = [
  'How am I feeling today?',
  'What can I learn from my recent entries?',
  'Help me identify patterns in my mood.',
  'What should I focus on for my personal growth?',
  'Can you summarize my week?',
  'What are some positive themes in my entries?',
  'How can I improve my daily routine?',
  'What insights do you have about my emotional journey?'
]

export function getRandomEntry(): TestEntry {
  return testEntries[Math.floor(Math.random() * testEntries.length)]
}

export function getEntriesForTesting(count: number): TestEntry[] {
  const entries = [...testEntries]
  const selected: TestEntry[] = []
  
  for (let i = 0; i < Math.min(count, entries.length); i++) {
    const randomIndex = Math.floor(Math.random() * entries.length)
    selected.push(entries.splice(randomIndex, 1)[0])
  }
  
  return selected
}

export function getRandomConversationStarter(): string {
  return aiConversationStarters[Math.floor(Math.random() * aiConversationStarters.length)]
}