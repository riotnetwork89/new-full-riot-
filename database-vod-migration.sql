ALTER TABLE fan_uploads RENAME TO vod_edits;

ALTER TABLE vod_edits ADD COLUMN IF NOT EXISTS stream_timestamp TIMESTAMPTZ;
ALTER TABLE vod_edits ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE vod_edits ADD COLUMN IF NOT EXISTS is_live_edit BOOLEAN DEFAULT false;
ALTER TABLE vod_edits ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false;
ALTER TABLE vod_edits ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

DROP POLICY IF EXISTS "fan_uploads_read_all" ON vod_edits;
DROP POLICY IF EXISTS "fan_uploads_insert_authed" ON vod_edits;
DROP POLICY IF EXISTS "fan_uploads_update_admin" ON vod_edits;

CREATE POLICY "vod_edits_read_all" ON vod_edits FOR SELECT USING (true);
CREATE POLICY "vod_edits_insert_authed" ON vod_edits FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = submitted_by::text);
CREATE POLICY "vod_edits_update_admin" ON vod_edits FOR UPDATE USING (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role='admin'));
