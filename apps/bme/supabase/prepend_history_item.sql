-- Create Postgres Function for prepending history item to user data
CREATE OR REPLACE FUNCTION prepend_history_item(user_id_param UUID, new_item JSONB)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.bme_user_data (user_id, history, updated_at)
    VALUES (
        user_id_param, 
        jsonb_build_array(new_item), 
        timezone('utc', now())
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
        history = jsonb_build_array(new_item) || COALESCE(public.bme_user_data.history, '[]'::jsonb),
        updated_at = timezone('utc', now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
