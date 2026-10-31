-- Photobook v20: run once in the Photobook Supabase project's SQL Editor.
-- Adds only one thumbnail flag and two read-only functions. No originals or photo rows are deleted.
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS has_thumbnail boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS photobook_photos_created_idx ON public.photos(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS photobook_photos_incomplete_idx ON public.photos(is_complete, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS photobook_photo_tags_tag_photo_idx ON public.photo_tags(tag_id, photo_id);

CREATE OR REPLACE FUNCTION public.photobook_gallery_page(
 p_people uuid[] DEFAULT '{}', p_themes uuid[] DEFAULT '{}', p_events uuid[] DEFAULT '{}',
 p_people_mode text DEFAULT 'or', p_year integer DEFAULT NULL, p_month integer DEFAULT NULL,
 p_sort text DEFAULT 'newest', p_offset integer DEFAULT 0, p_limit integer DEFAULT 40
) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS (SELECT 1 FROM public.photobook_members WHERE user_id=auth.uid()) THEN
   RAISE EXCEPTION 'Not authorized';
 END IF;
 IF p_limit NOT BETWEEN 1 AND 40 OR p_offset < 0 THEN RAISE EXCEPTION 'Invalid page'; END IF;
 WITH matching AS (
   SELECT p.* FROM public.photos p
   WHERE (p_year IS NULL OR p.photo_year=p_year)
     AND (p_month IS NULL OR p.photo_month=p_month)
     AND (coalesce(cardinality(p_people),0)=0 OR
          (p_people_mode='and' AND NOT EXISTS (
             SELECT 1 FROM unnest(p_people) wanted WHERE NOT EXISTS
               (SELECT 1 FROM public.photo_tags pt WHERE pt.photo_id=p.id AND pt.tag_id=wanted)
           )) OR
          (p_people_mode<>'and' AND EXISTS
               (SELECT 1 FROM public.photo_tags pt WHERE pt.photo_id=p.id AND pt.tag_id=ANY(p_people))))
     AND NOT EXISTS (SELECT 1 FROM unnest(coalesce(p_themes,'{}'::uuid[])) wanted
                     WHERE NOT EXISTS (SELECT 1 FROM public.photo_tags pt WHERE pt.photo_id=p.id AND pt.tag_id=wanted))
     AND NOT EXISTS (SELECT 1 FROM unnest(coalesce(p_events,'{}'::uuid[])) wanted
                     WHERE NOT EXISTS (SELECT 1 FROM public.photo_tags pt WHERE pt.photo_id=p.id AND pt.tag_id=wanted))
 ), page AS (
   SELECT * FROM matching
   ORDER BY
     CASE WHEN p_sort='random' THEN random() END,
     CASE WHEN p_sort='oldest' THEN created_at END ASC NULLS LAST,
     CASE WHEN p_sort='dateNewest' THEN
       CASE WHEN photo_year IS NOT NULL AND photo_month IS NOT NULL THEN photo_year*12+photo_month END
     END DESC NULLS LAST,
     CASE WHEN p_sort='dateOldest' THEN photo_year*12+photo_month END ASC NULLS LAST,
     CASE WHEN p_sort NOT IN ('oldest','random','dateOldest','dateNewest') THEN created_at END DESC NULLS LAST,
     id DESC
   OFFSET p_offset LIMIT p_limit
 )
 SELECT jsonb_build_object(
   'total',(SELECT count(*) FROM matching),
   'rows',coalesce((SELECT jsonb_agg(to_jsonb(page) || jsonb_build_object('tag_ids',
         coalesce((SELECT jsonb_agg(pt.tag_id) FROM public.photo_tags pt WHERE pt.photo_id=page.id),'[]'::jsonb)))
       FROM page),'[]'::jsonb)
 ) INTO result;
 RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.photobook_years() RETURNS integer[]
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
DECLARE years integer[];
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS (SELECT 1 FROM public.photobook_members WHERE user_id=auth.uid()) THEN
   RAISE EXCEPTION 'Not authorized';
 END IF;
 SELECT coalesce(array_agg(DISTINCT photo_year ORDER BY photo_year DESC),'{}'::integer[])
 INTO years FROM public.photos WHERE photo_year IS NOT NULL;
 RETURN years;
END $$;
REVOKE ALL ON FUNCTION public.photobook_gallery_page(uuid[],uuid[],uuid[],text,integer,integer,text,integer,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.photobook_years() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.photobook_gallery_page(uuid[],uuid[],uuid[],text,integer,integer,text,integer,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.photobook_years() TO authenticated;
