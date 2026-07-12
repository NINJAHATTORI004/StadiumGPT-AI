CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE role_name AS ENUM ('ADMIN','FAN','ORGANIZER','SECURITY','MEDICAL','VOLUNTEER','STAFF','ACCESSIBILITY','SUSTAINABILITY');
CREATE TYPE severity AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');
CREATE TYPE incident_status AS ENUM ('OPEN','TRIAGED','RESOLVED','CLOSED');
CREATE TYPE order_status AS ENUM ('PENDING','PREPARING','READY','COMPLETE','CANCELLED');
CREATE TYPE request_status AS ENUM ('OPEN','ASSIGNED','IN_PROGRESS','RESOLVED','CANCELLED');
CREATE TYPE notification_channel AS ENUM ('IN_APP','SMS','EMAIL','PUSH');

CREATE TABLE users (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text NOT NULL,
  preferred_language text NOT NULL DEFAULT 'en-US',
  phone text,
  accessibility_needs text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE roles (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name role_name NOT NULL UNIQUE,
  description text NOT NULL
);

CREATE TABLE permissions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  action text NOT NULL UNIQUE,
  description text NOT NULL
);

CREATE TABLE user_roles (
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id text NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
  role_id text NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id text NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE teams (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  country_code text NOT NULL
);

CREATE TABLE players (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  team_id text NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  position text NOT NULL,
  shirt_number integer NOT NULL
);

CREATE TABLE stadiums (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  capacity integer NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL
);

CREATE TABLE matches (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  stadium_id text NOT NULL REFERENCES stadiums(id),
  home_team_id text NOT NULL REFERENCES teams(id),
  away_team_id text NOT NULL REFERENCES teams(id),
  kickoff_at timestamptz NOT NULL,
  round text NOT NULL,
  status text NOT NULL DEFAULT 'SCHEDULED'
);

CREATE TABLE seats (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  stadium_id text NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  section text NOT NULL,
  row text NOT NULL,
  number text NOT NULL,
  accessible boolean NOT NULL DEFAULT false,
  companion_seat boolean NOT NULL DEFAULT false,
  UNIQUE (stadium_id, section, row, number)
);

CREATE TABLE tickets (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id text NOT NULL REFERENCES users(id),
  match_id text NOT NULL REFERENCES matches(id),
  seat_id text NOT NULL REFERENCES seats(id),
  qr_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, seat_id)
);

CREATE TABLE gates (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  stadium_id text NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  accessible boolean NOT NULL DEFAULT false,
  open boolean NOT NULL DEFAULT true,
  queue_minute integer NOT NULL DEFAULT 0
);

CREATE TABLE parking_lots (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  stadium_id text NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  capacity integer NOT NULL,
  accessible boolean NOT NULL DEFAULT false,
  ev_chargers integer NOT NULL DEFAULT 0
);

CREATE TABLE parking_reservations (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id text NOT NULL REFERENCES users(id),
  lot_id text NOT NULL REFERENCES parking_lots(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  plate text
);

CREATE TABLE routes (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  stadium_id text NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  name text NOT NULL,
  from_label text NOT NULL,
  to_label text NOT NULL,
  distance_meters integer NOT NULL,
  duration_minutes integer NOT NULL,
  accessible boolean NOT NULL DEFAULT false,
  carbon_grams_saved integer NOT NULL DEFAULT 0
);

CREATE TABLE route_steps (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  route_id text NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  sequence integer NOT NULL,
  text text NOT NULL,
  latitude double precision,
  longitude double precision
);

CREATE TABLE food_vendors (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  stadium_id text NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  name text NOT NULL,
  section text NOT NULL,
  cuisine text NOT NULL,
  accessible boolean NOT NULL DEFAULT true,
  wait_minutes integer NOT NULL DEFAULT 0
);

CREATE TABLE menu_items (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vendor_id text NOT NULL REFERENCES food_vendors(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_cents integer NOT NULL,
  allergens text[] NOT NULL DEFAULT '{}',
  vegetarian boolean NOT NULL DEFAULT false
);

CREATE TABLE orders (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id text NOT NULL REFERENCES users(id),
  vendor_id text NOT NULL REFERENCES food_vendors(id),
  status order_status NOT NULL DEFAULT 'PENDING',
  total_cents integer NOT NULL,
  pickup_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id text NOT NULL REFERENCES menu_items(id),
  quantity integer NOT NULL CHECK (quantity > 0)
);

CREATE TABLE medical_requests (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  requester_id text NOT NULL REFERENCES users(id),
  match_id text REFERENCES matches(id),
  location text NOT NULL,
  latitude double precision,
  longitude double precision,
  description text NOT NULL,
  severity severity NOT NULL DEFAULT 'MEDIUM',
  status request_status NOT NULL DEFAULT 'OPEN',
  assigned_team text,
  response_due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE security_incidents (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reporter_id text NOT NULL REFERENCES users(id),
  match_id text REFERENCES matches(id),
  location text NOT NULL,
  latitude double precision,
  longitude double precision,
  category text NOT NULL,
  description text NOT NULL,
  severity severity NOT NULL DEFAULT 'MEDIUM',
  status incident_status NOT NULL DEFAULT 'OPEN',
  ai_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE crowd_sensors (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  stadium_id text NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  zone text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  sensor_type text NOT NULL
);

CREATE TABLE crowd_readings (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sensor_id text NOT NULL REFERENCES crowd_sensors(id) ON DELETE CASCADE,
  density double precision NOT NULL,
  flow_rate double precision NOT NULL,
  queue_minutes integer NOT NULL,
  risk severity NOT NULL DEFAULT 'LOW',
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ai_conversations (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id text NOT NULL REFERENCES users(id),
  module text NOT NULL,
  language text NOT NULL DEFAULT 'en-US',
  title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ai_messages (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id text NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  citations text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'IN_APP',
  severity severity NOT NULL DEFAULT 'LOW',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE volunteer_assignments (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL,
  location text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status request_status NOT NULL DEFAULT 'ASSIGNED',
  instructions text NOT NULL
);

CREATE TABLE transport_routes (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  stadium_id text NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  name text NOT NULL,
  mode text NOT NULL,
  provider text NOT NULL,
  headway_minutes integer NOT NULL,
  co2_grams_saved integer NOT NULL
);

CREATE TABLE transport_stops (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  route_id text NOT NULL REFERENCES transport_routes(id) ON DELETE CASCADE,
  name text NOT NULL,
  sequence integer NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL
);

CREATE TABLE accessibility_requests (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text NOT NULL,
  location text,
  status request_status NOT NULL DEFAULT 'OPEN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE carbon_tracking (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  stadium_id text NOT NULL REFERENCES stadiums(id) ON DELETE CASCADE,
  match_id text REFERENCES matches(id),
  category text NOT NULL,
  co2e_kg double precision NOT NULL,
  recommendation text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE analytics_metrics (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  match_id text REFERENCES matches(id),
  key text NOT NULL,
  value double precision NOT NULL,
  unit text NOT NULL,
  dimension text,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id text REFERENCES users(id),
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}',
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_matches_kickoff ON matches(kickoff_at);
CREATE INDEX idx_medical_severity_status ON medical_requests(severity, status);
CREATE INDEX idx_incidents_severity_status ON security_incidents(severity, status);
CREATE INDEX idx_crowd_recorded_at ON crowd_readings(recorded_at);
CREATE INDEX idx_analytics_key_time ON analytics_metrics(key, recorded_at);
CREATE INDEX idx_audit_action_time ON audit_logs(action, created_at);

