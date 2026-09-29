-- Script SQL para criar o Admin na base do Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Certifique-se de ter a extensão pgcrypto instalada (geralmente padrão no Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_user_id UUID := gen_random_uuid();
BEGIN
  -- 2. Insere o usuário na tabela oficial auth.users do Supabase
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_user_id,
    'authenticated',
    'authenticated',
    'admin@ingrid123',
    crypt('87594291', gen_salt('bf')),
    now(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- 3. Insere a identidade de autenticação para o usuário
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    admin_user_id,
    admin_user_id::text,
    format('{"sub":"%s","email":"%s"}', admin_user_id, 'admin@ingrid123')::jsonb,
    'email',
    now(),
    now(),
    now()
  );

  RAISE NOTICE 'Admin user criado com sucesso!';
END $$;
