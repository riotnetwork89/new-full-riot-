import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mjxfmvfpocfhxpazgren.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qeGZtdmZwb2NmaHhwYXpncmVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Nzc5NDgsImV4cCI6MjA2MzI1Mzk0OH0.Z8gfGgGgDZA5vOccdnzsmMsjoxN8A3CGETpL6BlCz_k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
