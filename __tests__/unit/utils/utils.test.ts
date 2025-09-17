import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge classnames correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })
    
    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })
    
    it('should handle empty input', () => {
      expect(cn()).toBe('')
    })
    
    it('should handle Tailwind class conflicts', () => {
      // twMerge should resolve conflicts between Tailwind classes
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })
    
    it('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end')
    })
    
    it('should merge array of classes', () => {
      expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
    })
    
    it('should handle object syntax', () => {
      expect(cn({
        'active': true,
        'inactive': false,
        'base': true
      })).toBe('active base')
    })
  })
})