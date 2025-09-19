-- Storage 버킷 및 정책 설정
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. diary-photos 버킷 생성 (이미 존재하면 무시됨)
INSERT INTO storage.buckets (id, name, public)
VALUES ('diary-photos', 'diary-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage 정책 생성
-- 사용자는 자신의 user_id 폴더에만 접근 가능

-- SELECT 정책 (파일 조회)
CREATE POLICY "Users can view own photos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'diary-photos' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- INSERT 정책 (파일 업로드)  
CREATE POLICY "Users can upload own photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'diary-photos' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- UPDATE 정책 (파일 수정)
CREATE POLICY "Users can update own photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'diary-photos' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- DELETE 정책 (파일 삭제)
CREATE POLICY "Users can delete own photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'diary-photos' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );