ALTER TABLE course ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;
ALTER TABLE course ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE course ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
-- The studio supplied this booking URL. Replace the previously empty fallback,
-- but preserve any other studio link that has already been configured.
INSERT INTO site_setting (setting_key, setting_value)
VALUES ('bookingUrl', 'https://find-your-flow.purpleslot.io/')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value
WHERE site_setting.setting_value = '';
