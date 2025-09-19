-- Row Level Security 정책 설정 (실제 테이블 구조에 맞춤)
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 2. user_profiles 테이블 정책
-- 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can CRUD own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- 3. diaries 테이블 정책
-- 사용자는 자신의 일기만 조회/수정/삭제 가능
CREATE POLICY "Users can CRUD own diaries" ON diaries
    FOR ALL USING (auth.uid() = profile_id);

-- 4. Storage 정책은 여전히 필요 (Supabase Dashboard > Storage > Policies에서 설정)
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