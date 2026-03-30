-- SQL Schema for Avisomap

-- Table: avisos
CREATE TABLE IF NOT EXISTS avisos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    direccion TEXT NOT NULL,
    localidad TEXT NOT NULL,
    fecha_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    plaga TEXT NOT NULL,
    tipo_contacto TEXT NOT NULL, -- 'presencial' o 'telefono'
    notas TEXT,
    archivo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE avisos ENABLE CONTROL ROW LEVEL SECURITY;

-- Policy: Users can only see their own records
CREATE POLICY "Users can view own avisos" ON avisos
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own records
CREATE POLICY "Users can insert own avisos" ON avisos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own records
CREATE POLICY "Users can update own avisos" ON avisos
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own records
CREATE POLICY "Users can delete own avisos" ON avisos
    FOR DELETE USING (auth.uid() = user_id);

-- Create a storage bucket for attachments
-- Note: This is done in the Supabase UI usually, but good to note here.
-- Bucket name: 'avisomap_attachments'
