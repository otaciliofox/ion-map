-- ================================================================
-- ion-map: Seed de dados para testes
-- Cole TODO o conteúdo no Supabase SQL Editor e clique Run
-- ================================================================

-- ── 1. USUÁRIOS (auth.users) ─────────────────────────────────────
-- Admin: Gustavo (otaciliofox) | senha: Admin@2026!
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1a1a1a1-0000-4000-a000-000000000001',
  'authenticated', 'authenticated',
  'gustavo@ionmap.com.br',
  crypt('Admin@2026!', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}',
  '{"full_name":"Gustavo (Admin)"}',
  now(), now(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- Supervisor | senha: Super@2026!
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b2b2b2b2-0000-4000-b000-000000000002',
  'authenticated', 'authenticated',
  'supervisor@ionmap.com.br',
  crypt('Super@2026!', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}',
  '{"full_name":"Supervisor Ion-Map"}',
  now(), now(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- Cliente: Otacílio (vai logar com Google depois) | senha: Client@2026!
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'c3c3c3c3-0000-4000-c000-000000000003',
  'authenticated', 'authenticated',
  'otaciliomanoel.neto@gmail.com',
  crypt('Client@2026!', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}',
  '{"full_name":"Otacílio Manoel"}',
  now(), now(), '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- ── 2. PROFILES COM ROLES ─────────────────────────────────────────
INSERT INTO profiles (id, name, role) VALUES
  ('a1a1a1a1-0000-4000-a000-000000000001', 'Gustavo (Admin)',    'admin'),
  ('b2b2b2b2-0000-4000-b000-000000000002', 'Supervisor Ion-Map', 'supervisor'),
  ('c3c3c3c3-0000-4000-c000-000000000003', 'Otacílio Manoel',    'client')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, name = EXCLUDED.name;

-- ── 3. ESTABELECIMENTOS (10 ativos + 2 pendentes) ─────────────────
-- Região: Piedade / Prazeres / Candeias — Jaboatão dos Guararapes, PE

INSERT INTO establishments (
  id, user_id, name, description,
  address, city, state, zip_code,
  latitude, longitude,
  status, approved_by, approved_at
) VALUES

-- ATIVOS ──────────────────────────────────────────────────────────

('e0000001-0000-4000-e000-000000000001',
 'c3c3c3c3-0000-4000-c000-000000000003',
 'Shopping Guararapes',
 'O maior shopping do Norte-Nordeste. DEA i.on disponível na administração e praça de alimentação.',
 'Av. Barreto de Menezes, 300 - Piedade', 'Jaboatão dos Guararapes', 'PE', '54410-150',
 -8.16192, -34.90034, 'active',
 'b2b2b2b2-0000-4000-b000-000000000002', now() - interval '12 days'),

('e0000002-0000-4000-e000-000000000002',
 'c3c3c3c3-0000-4000-c000-000000000003',
 'Smart Fit Piedade',
 'Unidade Smart Fit em Piedade. Equipamento DEA i.on na recepção para a segurança dos alunos.',
 'R. Bom Pastor, 720 - Piedade', 'Jaboatão dos Guararapes', 'PE', '54410-030',
 -8.16872, -34.90553, 'active',
 'b2b2b2b2-0000-4000-b000-000000000002', now() - interval '10 days'),

('e0000003-0000-4000-e000-000000000003',
 'c3c3c3c3-0000-4000-c000-000000000003',
 'Academia Alto Impacto Piedade',
 'Musculação, lutas e cardio. Segurança garantida com DEA i.on na entrada da academia.',
 'R. Padre Anchieta, 215 - Piedade', 'Jaboatão dos Guararapes', 'PE', '54410-060',
 -8.17013, -34.90712, 'active',
 'b2b2b2b2-0000-4000-b000-000000000002', now() - interval '9 days'),

('e0000004-0000-4000-e000-000000000004',
 'c3c3c3c3-0000-4000-c000-000000000003',
 'UPA 24h Piedade',
 'Unidade de Pronto Atendimento 24 horas. DEA i.on como suporte adicional ao pronto-socorro.',
 'R. Itamaracá, 100 - Piedade', 'Jaboatão dos Guararapes', 'PE', '54410-080',
 -8.16552, -34.90401, 'active',
 'b2b2b2b2-0000-4000-b000-000000000002', now() - interval '8 days'),

('e0000005-0000-4000-e000-000000000005',
 'c3c3c3c3-0000-4000-c000-000000000003',
 'Drogasil Piedade',
 'Farmácia Drogasil em frente ao Shopping Guararapes. DEA i.on no balcão de atendimento.',
 'Av. Barreto de Menezes, 502 - Piedade', 'Jaboatão dos Guararapes', 'PE', '54410-150',
 -8.16348, -34.90182, 'active',
 'b2b2b2b2-0000-4000-b000-000000000002', now() - interval '7 days'),

('e0000006-0000-4000-e000-000000000006',
 'c3c3c3c3-0000-4000-c000-000000000003',
 'Academia Bodytech Prazeres',
 'Academia premium em Prazeres. DEA i.on posicionado próximo à área de musculação.',
 'R. dos Prazeres, 340 - Prazeres', 'Jaboatão dos Guararapes', 'PE', '54330-060',
 -8.18231, -34.91124, 'active',
 'b2b2b2b2-0000-4000-b000-000000000002', now() - interval '6 days'),

('e0000007-0000-4000-e000-000000000007',
 'c3c3c3c3-0000-4000-c000-000000000003',
 'Farmácia Pague Menos Prazeres',
 'Unidade Pague Menos em Prazeres. Equipamento DEA i.on disponível para emergências.',
 'Av. Central, 891 - Prazeres', 'Jaboatão dos Guararapes', 'PE', '54330-020',
 -8.18452, -34.91301, 'active',
 'b2b2b2b2-0000-4000-b000-000000000002', now() - interval '5 days'),

('e0000008-0000-4000-e000-000000000008',
 'c3c3c3c3-0000-4000-c000-000000000003',
 'Clínica São José Prazeres',
 'Clínica médica com especialidades. DEA i.on na sala de espera principal.',
 'R. São José, 156 - Prazeres', 'Jaboatão dos Guararapes', 'PE', '54330-080',
 -8.18624, -34.91483, 'active',
 'b2b2b2b2-0000-4000-b000-000000000002', now() - interval '4 days'),

('e0000009-0000-4000-e000-000000000009',
 'c3c3c3c3-0000-4000-c000-000000000003',
 'Academia Sport Life Candeias',
 'Academia em Candeias com DEA i.on na recepção. Segurança para todos os alunos.',
 'R. Candeias, 420 - Candeias', 'Jaboatão dos Guararapes', 'PE', '54460-030',
 -8.19851, -34.92631, 'active',
 'b2b2b2b2-0000-4000-b000-000000000002', now() - interval '3 days'),

('e0000010-0000-4000-e000-000000000010',
 'c3c3c3c3-0000-4000-c000-000000000003',
 'GBarbosa Candeias',
 'Supermercado GBarbosa em Candeias. DEA i.on instalado no corredor principal da loja.',
 'Av. Candeias, 1200 - Candeias', 'Jaboatão dos Guararapes', 'PE', '54460-010',
 -8.20104, -34.92903, 'active',
 'b2b2b2b2-0000-4000-b000-000000000002', now() - interval '2 days'),

-- PENDENTES ───────────────────────────────────────────────────────

('e0000011-0000-4000-e000-000000000011',
 'c3c3c3c3-0000-4000-c000-000000000003',
 'Coco Bambu Guararapes',
 'Restaurante Coco Bambu próximo ao Shopping Guararapes. Aguardando aprovação.',
 'Av. Barreto de Menezes, 678 - Piedade', 'Jaboatão dos Guararapes', 'PE', '54410-150',
 -8.16284, -34.90122, 'pending', NULL, NULL),

('e0000012-0000-4000-e000-000000000012',
 'c3c3c3c3-0000-4000-c000-000000000003',
 'Academia Total Fitness Candeias',
 'Academia Total Fitness em Candeias. Cadastro aguardando revisão das fotos.',
 'R. das Flores, 89 - Candeias', 'Jaboatão dos Guararapes', 'PE', '54460-050',
 -8.20258, -34.93052, 'pending', NULL, NULL);

-- ── 4. FOTOS (equipamento DEA i.on + placeholder do local) ────────
-- Foto do equipamento = imagem oficial DEA i.on (Instramed CDN)
-- Foto do local = placeholder via picsum

INSERT INTO establishment_photos (id, establishment_id, photo_type, url) VALUES
('f0000001-0000-4000-f000-000000000001', 'e0000001-0000-4000-e000-000000000001', 'place',     'https://picsum.photos/seed/shopping1/600/400'),
('f0000002-0000-4000-f000-000000000002', 'e0000001-0000-4000-e000-000000000001', 'equipment', 'https://acdn-us.mitiendanube.com/stores/001/563/250/products/i-on-led-frontal-loja-394d3edeb5ec0b315517531291201591-480-0.webp'),

('f0000003-0000-4000-f000-000000000003', 'e0000002-0000-4000-e000-000000000002', 'place',     'https://picsum.photos/seed/smartfit1/600/400'),
('f0000004-0000-4000-f000-000000000004', 'e0000002-0000-4000-e000-000000000002', 'equipment', 'https://acdn-us.mitiendanube.com/stores/001/563/250/products/i-on-led-frontal-loja-394d3edeb5ec0b315517531291201591-480-0.webp'),

('f0000005-0000-4000-f000-000000000005', 'e0000003-0000-4000-e000-000000000003', 'place',     'https://picsum.photos/seed/altoimpacto/600/400'),
('f0000006-0000-4000-f000-000000000006', 'e0000003-0000-4000-e000-000000000003', 'equipment', 'https://acdn-us.mitiendanube.com/stores/001/563/250/products/i-on-led-frontal-loja-394d3edeb5ec0b315517531291201591-480-0.webp'),

('f0000007-0000-4000-f000-000000000007', 'e0000004-0000-4000-e000-000000000004', 'place',     'https://picsum.photos/seed/upa24h/600/400'),
('f0000008-0000-4000-f000-000000000008', 'e0000004-0000-4000-e000-000000000004', 'equipment', 'https://acdn-us.mitiendanube.com/stores/001/563/250/products/i-on-led-frontal-loja-394d3edeb5ec0b315517531291201591-480-0.webp'),

('f0000009-0000-4000-f000-000000000009', 'e0000005-0000-4000-e000-000000000005', 'place',     'https://picsum.photos/seed/drogasil1/600/400'),
('f0000010-0000-4000-f000-000000000010', 'e0000005-0000-4000-e000-000000000005', 'equipment', 'https://acdn-us.mitiendanube.com/stores/001/563/250/products/i-on-led-frontal-loja-394d3edeb5ec0b315517531291201591-480-0.webp'),

('f0000011-0000-4000-f000-000000000011', 'e0000006-0000-4000-e000-000000000006', 'place',     'https://picsum.photos/seed/bodytech1/600/400'),
('f0000012-0000-4000-f000-000000000012', 'e0000006-0000-4000-e000-000000000006', 'equipment', 'https://acdn-us.mitiendanube.com/stores/001/563/250/products/i-on-led-frontal-loja-394d3edeb5ec0b315517531291201591-480-0.webp'),

('f0000013-0000-4000-f000-000000000013', 'e0000007-0000-4000-e000-000000000007', 'place',     'https://picsum.photos/seed/paguemenos1/600/400'),
('f0000014-0000-4000-f000-000000000014', 'e0000007-0000-4000-e000-000000000007', 'equipment', 'https://acdn-us.mitiendanube.com/stores/001/563/250/products/i-on-led-frontal-loja-394d3edeb5ec0b315517531291201591-480-0.webp'),

('f0000015-0000-4000-f000-000000000015', 'e0000008-0000-4000-e000-000000000008', 'place',     'https://picsum.photos/seed/clinica1/600/400'),
('f0000016-0000-4000-f000-000000000016', 'e0000008-0000-4000-e000-000000000008', 'equipment', 'https://acdn-us.mitiendanube.com/stores/001/563/250/products/i-on-led-frontal-loja-394d3edeb5ec0b315517531291201591-480-0.webp'),

('f0000017-0000-4000-f000-000000000017', 'e0000009-0000-4000-e000-000000000009', 'place',     'https://picsum.photos/seed/sportlife1/600/400'),
('f0000018-0000-4000-f000-000000000018', 'e0000009-0000-4000-e000-000000000009', 'equipment', 'https://acdn-us.mitiendanube.com/stores/001/563/250/products/i-on-led-frontal-loja-394d3edeb5ec0b315517531291201591-480-0.webp'),

('f0000019-0000-4000-f000-000000000019', 'e0000010-0000-4000-e000-000000000010', 'place',     'https://picsum.photos/seed/gbarbosa1/600/400'),
('f0000020-0000-4000-f000-000000000020', 'e0000010-0000-4000-e000-000000000010', 'equipment', 'https://acdn-us.mitiendanube.com/stores/001/563/250/products/i-on-led-frontal-loja-394d3edeb5ec0b315517531291201591-480-0.webp');

-- ── 5. LOGS DE APROVAÇÃO ──────────────────────────────────────────
INSERT INTO approval_logs (establishment_id, actor_id, action, comment) VALUES
('e0000001-0000-4000-e000-000000000001', 'b2b2b2b2-0000-4000-b000-000000000002', 'approved', 'Fotos verificadas. Estabelecimento aprovado.'),
('e0000002-0000-4000-e000-000000000002', 'b2b2b2b2-0000-4000-b000-000000000002', 'approved', 'Documentação completa. Aprovado.'),
('e0000003-0000-4000-e000-000000000003', 'b2b2b2b2-0000-4000-b000-000000000002', 'approved', 'Fotos ok. Aprovado.'),
('e0000004-0000-4000-e000-000000000004', 'b2b2b2b2-0000-4000-b000-000000000002', 'approved', 'Aprovado.'),
('e0000005-0000-4000-e000-000000000005', 'b2b2b2b2-0000-4000-b000-000000000002', 'approved', 'Aprovado.'),
('e0000006-0000-4000-e000-000000000006', 'b2b2b2b2-0000-4000-b000-000000000002', 'approved', 'Aprovado.'),
('e0000007-0000-4000-e000-000000000007', 'b2b2b2b2-0000-4000-b000-000000000002', 'approved', 'Aprovado.'),
('e0000008-0000-4000-e000-000000000008', 'b2b2b2b2-0000-4000-b000-000000000002', 'approved', 'Aprovado.'),
('e0000009-0000-4000-e000-000000000009', 'b2b2b2b2-0000-4000-b000-000000000002', 'approved', 'Aprovado.'),
('e0000010-0000-4000-e000-000000000010', 'b2b2b2b2-0000-4000-b000-000000000002', 'approved', 'Aprovado.');
