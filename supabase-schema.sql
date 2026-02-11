-- FOR ALL HOME CARE - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop and recreate tables to fix schema
DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;

-- Create appointments table with UUID
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluator_name TEXT NOT NULL,
    evaluator_signature TEXT,
    parent_guardian_name TEXT,
    client_name TEXT,
    service_provider_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    appointment_date TEXT,
    appointment_time TEXT,
    service_type TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create evaluations table with UUID
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    evaluation_type TEXT,
    evaluator_name TEXT,
    parent_guardian_name TEXT,
    client_name TEXT,
    service_provider_name TEXT,
    service_type TEXT,
    email TEXT,
    responses JSONB,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Enable insert for all users" ON appointments;
DROP POLICY IF EXISTS "Enable insert for all users" ON evaluations;
DROP POLICY IF EXISTS "Enable read for all users" ON appointments;
DROP POLICY IF EXISTS "Enable read for all users" ON evaluations;
DROP POLICY IF EXISTS "Enable update for all users" ON appointments;
DROP POLICY IF EXISTS "Enable delete for all users" ON appointments;
DROP POLICY IF EXISTS "Enable delete for all users" ON evaluations;

-- Create policies for public access (since this is a public form)
-- Anyone can insert
CREATE POLICY "Enable insert for all users" ON appointments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON evaluations
    FOR INSERT WITH CHECK (true);

-- Anyone can read
CREATE POLICY "Enable read for all users" ON appointments
    FOR SELECT USING (true);

CREATE POLICY "Enable read for all users" ON evaluations
    FOR SELECT USING (true);

-- Anyone can update
CREATE POLICY "Enable update for all users" ON appointments
    FOR UPDATE USING (true);

-- Anyone can delete
CREATE POLICY "Enable delete for all users" ON appointments
    FOR DELETE USING (true);

CREATE POLICY "Enable delete for all users" ON evaluations
    FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_evaluations_appointment_id ON evaluations(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointments_submitted_at ON appointments(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_evaluations_submitted_at ON evaluations(submitted_at DESC);
