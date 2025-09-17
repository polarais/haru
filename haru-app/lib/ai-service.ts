export type AIProvider = 'openai' | 'gemini'

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResponse {
  content: string
  provider: AIProvider
  error?: string
}

export interface SummaryRequest {
  content: string
  mood: string
  title?: string
}

// OpenAI API 설정
class OpenAIService {
  private apiKey: string
  private baseUrl = 'https://api.openai.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateSummary(request: SummaryRequest): Promise<AIResponse> {
    try {
      const prompt = `일기 내용을 기반으로 따뜻하고 공감적인 요약을 작성해주세요.

무드: ${request.mood}
제목: ${request.title || '제목 없음'}
내용: ${request.content}

요약은 다음 조건을 만족해야 합니다:
- 150자 이내
- 따뜻하고 공감적인 톤
- 작성자의 감정과 경험을 잘 반영
- 한국어로 작성`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: '당신은 따뜻하고 공감적인 일기 분석 전문가입니다. 사용자의 감정을 이해하고 지지하는 요약을 작성합니다.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        content: data.choices[0]?.message?.content || '요약을 생성할 수 없습니다.',
        provider: 'openai'
      }
    } catch (error) {
      console.error('OpenAI summary error:', error)
      return {
        content: '',
        provider: 'openai',
        error: error instanceof Error ? error.message : 'OpenAI 요약 생성 실패'
      }
    }
  }

  async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: '당신은 따뜻하고 공감적인 일기 상담사입니다. 사용자의 감정을 이해하고 지지하며, 깊이 있는 질문을 통해 자기 성찰을 도와주세요. 답변은 한국어로 해주세요.'
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          max_tokens: 300,
          temperature: 0.8
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        content: data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.',
        provider: 'openai'
      }
    } catch (error) {
      console.error('OpenAI response error:', error)
      return {
        content: '',
        provider: 'openai',
        error: error instanceof Error ? error.message : 'OpenAI 응답 생성 실패'
      }
    }
  }
}

// Google Gemini API 설정
class GeminiService {
  private apiKey: string
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateSummary(request: SummaryRequest): Promise<AIResponse> {
    try {
      const prompt = `일기 내용을 기반으로 따뜻하고 공감적인 요약을 작성해주세요.

무드: ${request.mood}
제목: ${request.title || '제목 없음'}
내용: ${request.content}

요약은 다음 조건을 만족해야 합니다:
- 150자 이내
- 따뜻하고 공감적인 톤
- 작성자의 감정과 경험을 잘 반영
- 한국어로 작성`

      const response = await fetch(`${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.7
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || '요약을 생성할 수 없습니다.',
        provider: 'gemini'
      }
    } catch (error) {
      console.error('Gemini summary error:', error)
      return {
        content: '',
        provider: 'gemini',
        error: error instanceof Error ? error.message : 'Gemini 요약 생성 실패'
      }
    }
  }

  async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
    try {
      // Gemini는 시스템 메시지가 없으므로 첫 메시지에 포함
      const systemPrompt = '당신은 따뜻하고 공감적인 일기 상담사입니다. 사용자의 감정을 이해하고 지지하며, 깊이 있는 질문을 통해 자기 성찰을 도와주세요. 답변은 한국어로 해주세요.\n\n'
      
      const userMessages = messages.filter(msg => msg.role === 'user')
      const lastUserMessage = userMessages[userMessages.length - 1]
      
      const prompt = systemPrompt + lastUserMessage?.content

      const response = await fetch(`${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.8
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || '응답을 생성할 수 없습니다.',
        provider: 'gemini'
      }
    } catch (error) {
      console.error('Gemini response error:', error)
      return {
        content: '',
        provider: 'gemini',
        error: error instanceof Error ? error.message : 'Gemini 응답 생성 실패'
      }
    }
  }
}

// AI 서비스 팩토리
export class AIService {
  private static openaiService: OpenAIService | null = null
  private static geminiService: GeminiService | null = null
  // 기본 프로바이더 설정 - 사용자 요청에 따라 변경 가능
  private static defaultProvider: AIProvider = 'openai'

  static initialize() {
    const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

    if (openaiKey) {
      this.openaiService = new OpenAIService(openaiKey)
    }

    if (geminiKey) {
      this.geminiService = new GeminiService(geminiKey)
    }

    if (!this.openaiService && !this.geminiService) {
      console.warn('No AI API keys configured')
    }
  }

  // 기본 프로바이더 설정 메서드
  static setDefaultProvider(provider: AIProvider) {
    this.defaultProvider = provider
    console.log(`AI 프로바이더가 ${provider}로 변경되었습니다.`)
  }

  static getDefaultProvider(): AIProvider {
    return this.defaultProvider
  }

  static async generateSummary(request: SummaryRequest, provider?: AIProvider): Promise<AIResponse> {
    // 사용자가 지정하지 않으면 설정된 기본 프로바이더 사용
    if (!provider) {
      provider = this.defaultProvider
    }

    if (provider === 'openai' && this.openaiService) {
      return this.openaiService.generateSummary(request)
    }

    if (provider === 'gemini' && this.geminiService) {
      return this.geminiService.generateSummary(request)
    }

    return {
      content: '',
      provider: provider,
      error: `${provider} 서비스가 설정되지 않았습니다.`
    }
  }

  static async generateResponse(messages: AIMessage[], provider?: AIProvider): Promise<AIResponse> {
    // 사용자가 지정하지 않으면 설정된 기본 프로바이더 사용
    if (!provider) {
      provider = this.defaultProvider
    }

    if (provider === 'openai' && this.openaiService) {
      return this.openaiService.generateResponse(messages)
    }

    if (provider === 'gemini' && this.geminiService) {
      return this.geminiService.generateResponse(messages)
    }

    return {
      content: '',
      provider: provider,
      error: `${provider} 서비스가 설정되지 않았습니다.`
    }
  }

  static getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = []
    if (this.openaiService) providers.push('openai')
    if (this.geminiService) providers.push('gemini')
    return providers
  }
}

// 앱 시작 시 초기화
if (typeof window !== 'undefined') {
  AIService.initialize()
}