-- SQL Schema for Avisomap

-- 1. Create the 'avisos' table
CREATE TABLE IF NOT EXISTS avisos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    direccion TEXT NOT NULL,
    localidad TEXT NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    hora TIME NOT NULL DEFAULT CURRENT_TIME,
    plaga TEXT NOT NULL,
    tipo_contacto TEXT NOT NULL DEFAULT 'Presencial',
    notas TEXT,
    archivo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE avisos ENABLE ROW LEVEL SECURITY;

-- 3. Create Security Policies
-- (Copia estas líneas en la pestaña SQL Editor de Supabase)
CREATE POLICY "Usuarios pueden ver sus propios avisos" ON avisos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar sus propios avisos" ON avisos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios avisos" ON avisos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden borrar sus propios avisos" ON avisos
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Storage Bucket Setup
-- Create the bucket for files if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avisomap_files', 'avisomap_files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'avisomap_files'
CREATE POLICY "Permitir subida a usuarios autenticados" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avisomap_files' AND auth.role() = 'authenticated');

CREATE POLICY "Permitir lectura pública de archivos" ON storage.objects
    FOR SELECT USING (bucket_id = 'avisomap_files');

CREATE POLICY "Permitir borrar sus propios archivos" ON storage.objects
    FOR DELETE USING (bucket_id = 'avisomap_files' AND auth.uid() = owner);
