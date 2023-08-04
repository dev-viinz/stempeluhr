// src/app.d.ts
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

// make pwa generator happy
/// <reference types="vite-plugin-pwa/svelte" />
/// <reference types="vite-plugin-pwa/info" />

import { SupabaseClient, Session } from '@supabase/supabase-js'
import type { Database } from './types/supabase'

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>
      getSession(): Promise<Session | null>
    }
    interface PageData {
      session: Session | null
    }
    // interface Error {}
    // interface Platform {}
  }
}
