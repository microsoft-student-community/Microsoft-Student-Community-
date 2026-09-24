-- Keep event URLs readable and search-friendly.
-- Older event creation added a random suffix when a title slug was already in use.
-- This migration normalizes existing event slugs to a deterministic title slug.
-- If two events genuinely have the same title, the second receives a sequential
-- suffix such as "-2" rather than a random value.

DO $$
DECLARE
  event_row RECORD;
  base_slug TEXT;
  candidate_slug TEXT;
  suffix INTEGER;
BEGIN
  FOR event_row IN
    SELECT id, title
    FROM public.events
    ORDER BY date_start ASC NULLS LAST, id ASC
  LOOP
    base_slug := trim(
      both '-' from lower(
        regexp_replace(
          regexp_replace(coalesce(event_row.title, ''), '[^a-zA-Z0-9]+', '-', 'g'),
          '-+',
          '-',
          'g'
        )
      )
    );

    IF base_slug IS NULL OR base_slug = '' THEN
      base_slug := 'event';
    END IF;

    candidate_slug := base_slug;
    suffix := 2;

    WHILE EXISTS (
      SELECT 1
      FROM public.events AS other_event
      WHERE other_event.slug = candidate_slug
        AND other_event.id <> event_row.id
    ) LOOP
      candidate_slug := base_slug || '-' || suffix;
      suffix := suffix + 1;
    END LOOP;

    UPDATE public.events
    SET slug = candidate_slug
    WHERE id = event_row.id
      AND slug IS DISTINCT FROM candidate_slug;
  END LOOP;
END $$;
