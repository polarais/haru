-- Row Level Security 정책 설정
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. RLS 활성화
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. diaries 테이블 정책
-- 사용자는 자신의 일기만 조회/수정/삭제 가능
CREATE POLICY "Users can manage own diary entries" ON diaries
    FOR ALL USING (auth.uid() = profile_id);

-- 3. entry_photos 테이블 정책  
-- 사용자는 자신의 일기에 속한 사진만 조회/수정/삭제 가능
CREATE POLICY "Users can manage own entry photos" ON entry_photos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM diaries 
            WHERE diaries.id = entry_photos.entry_id 
            AND diaries.profile_id = auth.uid()
        )
    );

-- 4. user_profiles 테이블 정책
-- 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can manage own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- 5. Storage 정책 (diary-photos 버킷)
-- 사용자는 자신의 폴더에만 업로드 가능
-- 이 정책은 Supabase Dashboard > Storage > Policies에서 설정해야 합니다:

-- INSERT 정책:
-- 정책명: "Users can upload own photos"
-- 타겟 역할: authenticated  
-- USING 표현식: bucket_id = 'diary-photos' AND (storage.foldername(name))[1] = auth.uid()::text

-- SELECT 정책:
-- 정책명: "Users can view own photos"  
-- 타겟 역할: authenticated
-- USING 표현식: bucket_id = 'diary-photos' AND (storage.foldername(name))[1] = auth.uid()::text

-- UPDATE 정책:
-- 정책명: "Users can update own photos"
-- 타겟 역할: authenticated
-- USING 표현식: bucket_id = 'diary-photos' AND (storage.foldername(name))[1] = auth.uid()::text

-- DELETE 정책:
-- 정책명: "Users can delete own photos"
-- 타겟 역할: authenticated
-- USING 표현식: bucket_id = 'diary-photos' AND (storage.foldername(name))[1] = auth.uid()::text