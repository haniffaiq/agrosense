/*
  # AgroSense IoT Dashboard - Sensor Data Schema

  1. New Tables
    - `sensors`
      - `id` (uuid, primary key) - Unique sensor identifier
      - `name` (text) - Sensor display name
      - `type` (text) - Sensor type (temperature, humidity, soil_moisture, light)
      - `location_lat` (numeric) - Latitude coordinate
      - `location_lng` (numeric) - Longitude coordinate
      - `status` (text) - Current status (optimal, warning, critical, offline)
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `sensor_readings`
      - `id` (uuid, primary key) - Reading identifier
      - `sensor_id` (uuid, foreign key) - Reference to sensor
      - `value` (numeric) - Sensor reading value
      - `unit` (text) - Unit of measurement
      - `timestamp` (timestamptz) - Reading timestamp
      - `created_at` (timestamptz) - Record creation time

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (dashboard is publicly viewable)
    - Add policies for authenticated insert (for data ingestion)

  3. Indexes
    - Index on sensor_id and timestamp for efficient time-series queries
    - Index on sensor status for filtering
*/

-- Create sensors table
CREATE TABLE IF NOT EXISTS sensors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('temperature', 'humidity', 'soil_moisture', 'light')),
  location_lat numeric(10, 6) NOT NULL,
  location_lng numeric(10, 6) NOT NULL,
  status text NOT NULL DEFAULT 'optimal' CHECK (status IN ('optimal', 'warning', 'critical', 'offline')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sensor_readings table
CREATE TABLE IF NOT EXISTS sensor_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id uuid NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  value numeric(10, 2) NOT NULL,
  unit text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensors_status ON sensors(status);

-- Enable Row Level Security
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

-- Public read access for dashboard (sensors)
CREATE POLICY "Public users can view sensors"
  ON sensors FOR SELECT
  TO anon
  USING (true);

-- Public read access for dashboard (readings)
CREATE POLICY "Public users can view sensor readings"
  ON sensor_readings FOR SELECT
  TO anon
  USING (true);

-- Authenticated users can insert sensor data
CREATE POLICY "Authenticated users can insert sensors"
  ON sensors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sensors"
  ON sensors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert readings"
  ON sensor_readings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert sample sensors for the dashboard
INSERT INTO sensors (name, type, location_lat, location_lng, status) VALUES
  ('Greenhouse A - Temp', 'temperature', -8.650000, 115.220000, 'optimal'),
  ('Greenhouse A - Humidity', 'humidity', -8.650000, 115.220000, 'optimal'),
  ('Greenhouse A - Soil', 'soil_moisture', -8.650000, 115.220000, 'warning'),
  ('Greenhouse A - Light', 'light', -8.650000, 115.220000, 'optimal'),
  ('Greenhouse B - Temp', 'temperature', -8.651500, 115.221500, 'optimal'),
  ('Greenhouse B - Humidity', 'humidity', -8.651500, 115.221500, 'optimal'),
  ('Greenhouse B - Soil', 'soil_moisture', -8.651500, 115.221500, 'optimal'),
  ('Greenhouse B - Light', 'light', -8.651500, 115.221500, 'critical')
ON CONFLICT DO NOTHING;