import { DiaryEntry, CreateDiaryEntryData, UpdateDiaryEntryData, Result } from '@/lib/types/diary'

export interface IDiaryRepository {
  /**
   * 사용자의 모든 일기 조회 (삭제되지 않은 것만)
   */
  getEntries(): Promise<Result<DiaryEntry[]>>
  
  /**
   * 특정 일기 조회
   */
  getEntryById(id: string): Promise<Result<DiaryEntry>>
  
  /**
   * 특정 날짜의 일기들 조회
   */
  getEntriesByDate(date: string): Promise<Result<DiaryEntry[]>>
  
  /**
   * 새로운 일기 생성
   */
  createEntry(data: CreateDiaryEntryData): Promise<Result<DiaryEntry>>
  
  /**
   * 일기 수정
   */
  updateEntry(id: string, data: UpdateDiaryEntryData): Promise<Result<DiaryEntry>>
  
  /**
   * 일기 삭제 (소프트 삭제)
   */
  deleteEntry(id: string): Promise<Result<void>>
  
  /**
   * 특정 날짜의 일기 개수 확인 (하루 3개 제한 검증용)
   */
  getEntryCountByDate(date: string): Promise<Result<number>>
}