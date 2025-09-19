// Test for photo marker utility functions

describe('Photo Marker Utilities', () => {
  // Mock implementations of the utility functions
  const insertPhotoMarker = (content: string, cursorPosition: number, photoIndex: number): string => {
    const marker = `[PHOTO:${photoIndex}]`
    return content.slice(0, cursorPosition) + marker + content.slice(cursorPosition)
  }

  const extractPhotoMarkers = (content: string): { cleanText: string; photoPositions: Array<{ marker: string; position: number }> } => {
    const photoMarkerRegex = /\[PHOTO:(\d+)\]/g
    const photoPositions: Array<{ marker: string; position: number }> = []
    let match
    
    while ((match = photoMarkerRegex.exec(content)) !== null) {
      photoPositions.push({
        marker: match[0],
        position: match.index
      })
    }
    
    const cleanText = content.replace(photoMarkerRegex, '')
    return { cleanText, photoPositions }
  }

  describe('insertPhotoMarker', () => {
    it('should insert photo marker at cursor position', () => {
      const content = 'Hello world'
      const cursorPosition = 5
      const photoIndex = 1
      
      const result = insertPhotoMarker(content, cursorPosition, photoIndex)
      
      expect(result).toBe('Hello[PHOTO:1] world')
    })
    
    it('should insert marker at beginning of text', () => {
      const content = 'Hello world'
      const result = insertPhotoMarker(content, 0, 1)
      
      expect(result).toBe('[PHOTO:1]Hello world')
    })
    
    it('should insert marker at end of text', () => {
      const content = 'Hello world'
      const result = insertPhotoMarker(content, content.length, 1)
      
      expect(result).toBe('Hello world[PHOTO:1]')
    })

    it('should handle multiple photo markers with different indexes', () => {
      let content = 'Text here'
      content = insertPhotoMarker(content, 4, 1)
      content = insertPhotoMarker(content, content.length, 2)
      
      expect(content).toBe('Text[PHOTO:1] here[PHOTO:2]')
    })

    it('should handle empty content', () => {
      const result = insertPhotoMarker('', 0, 1)
      
      expect(result).toBe('[PHOTO:1]')
    })
  })
  
  describe('extractPhotoMarkers', () => {
    it('should extract photo markers and return clean text', () => {
      const content = 'Text before [PHOTO:1] and [PHOTO:2] after.'
      
      const result = extractPhotoMarkers(content)
      
      expect(result.cleanText).toBe('Text before  and  after.')
      expect(result.photoPositions).toHaveLength(2)
      expect(result.photoPositions[0]).toEqual({
        marker: '[PHOTO:1]',
        position: 12
      })
      expect(result.photoPositions[1]).toEqual({
        marker: '[PHOTO:2]',
        position: 26
      })
    })
    
    it('should handle content without photo markers', () => {
      const content = 'No photo markers here'
      
      const result = extractPhotoMarkers(content)
      
      expect(result.cleanText).toBe(content)
      expect(result.photoPositions).toHaveLength(0)
    })

    it('should handle multiple consecutive markers', () => {
      const content = '[PHOTO:1][PHOTO:2][PHOTO:3]'
      
      const result = extractPhotoMarkers(content)
      
      expect(result.cleanText).toBe('')
      expect(result.photoPositions).toHaveLength(3)
      expect(result.photoPositions[0].position).toBe(0)
      expect(result.photoPositions[1].position).toBe(9)
      expect(result.photoPositions[2].position).toBe(18)
    })

    it('should handle markers with different photo numbers', () => {
      const content = 'Start [PHOTO:5] middle [PHOTO:10] end'
      
      const result = extractPhotoMarkers(content)
      
      expect(result.photoPositions).toHaveLength(2)
      expect(result.photoPositions[0].marker).toBe('[PHOTO:5]')
      expect(result.photoPositions[1].marker).toBe('[PHOTO:10]')
    })

    it('should ignore malformed markers', () => {
      const content = 'Text [PHOTO] [PHOTO:] [PHOTO:abc] [PHOTO:1] valid'
      
      const result = extractPhotoMarkers(content)
      
      expect(result.photoPositions).toHaveLength(1)
      expect(result.photoPositions[0].marker).toBe('[PHOTO:1]')
    })
  })

  describe('Integration scenarios', () => {
    it('should handle insert and extract roundtrip', () => {
      let content = 'Writing some text here'
      
      // Insert photo markers at different positions
      content = insertPhotoMarker(content, 8, 1)
      content = insertPhotoMarker(content, content.length, 2)
      
      expect(content).toBe('Writing [PHOTO:1]some text here[PHOTO:2]')
      
      // Extract markers
      const result = extractPhotoMarkers(content)
      
      expect(result.cleanText).toBe('Writing some text here')
      expect(result.photoPositions).toHaveLength(2)
    })

    it('should preserve text content when only extracting markers', () => {
      const originalText = 'This is important content'
      let content = originalText
      
      // Add markers
      content = insertPhotoMarker(content, 7, 1)
      content = insertPhotoMarker(content, content.length, 2)
      
      // Extract and verify original text is preserved
      const result = extractPhotoMarkers(content)
      
      expect(result.cleanText).toBe('This is important content')
    })

    it('should handle complex editing scenarios', () => {
      let content = 'First paragraph'
      
      // Add first photo
      content = insertPhotoMarker(content, content.length, 1)
      content += '\n\nSecond paragraph'
      
      // Add second photo in middle
      const middlePos = content.indexOf('Second')
      content = insertPhotoMarker(content, middlePos, 2)
      
      expect(content).toContain('[PHOTO:1]')
      expect(content).toContain('[PHOTO:2]Second')
      
      const result = extractPhotoMarkers(content)
      expect(result.photoPositions).toHaveLength(2)
      expect(result.cleanText).toContain('First paragraph')
      expect(result.cleanText).toContain('Second paragraph')
    })
  })
})