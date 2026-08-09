export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          active: boolean
          auth_subject: string
          created_at: string
          id: string
          last_access_at: string | null
          role: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          auth_subject: string
          created_at?: string
          id?: string
          last_access_at?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          auth_subject?: string
          created_at?: string
          id?: string
          last_access_at?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage_records: {
        Row: {
          correlation_id: string
          currency_code: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          estimated_cost: number
          failure_category: string | null
          id: string
          input_unit_estimate: number
          model_identifier: string
          output_unit_estimate: number
          quota_bucket: string
          request_category: string
          requested_at: string
          retention_expires_at: string
          status: string
          traveler_session_id: string
          trip_id: string | null
        }
        Insert: {
          correlation_id?: string
          currency_code?: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          estimated_cost?: number
          failure_category?: string | null
          id?: string
          input_unit_estimate?: number
          model_identifier: string
          output_unit_estimate?: number
          quota_bucket: string
          request_category: string
          requested_at?: string
          retention_expires_at: string
          status: string
          traveler_session_id: string
          trip_id?: string | null
        }
        Update: {
          correlation_id?: string
          currency_code?: string
          data_classification?: Database["public"]["Enums"]["data_classification"]
          estimated_cost?: number
          failure_category?: string | null
          id?: string
          input_unit_estimate?: number
          model_identifier?: string
          output_unit_estimate?: number
          quota_bucket?: string
          request_category?: string
          requested_at?: string
          retention_expires_at?: string
          status?: string
          traveler_session_id?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_records_traveler_session_id_fkey"
            columns: ["traveler_session_id"]
            isOneToOne: false
            referencedRelation: "traveler_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_records_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      attraction_profiles: {
        Row: {
          accessibility_notes: string | null
          admission_information: string | null
          attraction_categories: string[]
          created_at: string
          entrance_fee_information: string | null
          place_id: string
          recommended_visit_minutes: number | null
          updated_at: string
          visitor_restrictions: string | null
        }
        Insert: {
          accessibility_notes?: string | null
          admission_information?: string | null
          attraction_categories?: string[]
          created_at?: string
          entrance_fee_information?: string | null
          place_id: string
          recommended_visit_minutes?: number | null
          updated_at?: string
          visitor_restrictions?: string | null
        }
        Update: {
          accessibility_notes?: string | null
          admission_information?: string | null
          attraction_categories?: string[]
          created_at?: string
          entrance_fee_information?: string | null
          place_id?: string
          recommended_visit_minutes?: number | null
          updated_at?: string
          visitor_restrictions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attraction_profiles_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: true
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_admin_id: string | null
          after_summary: Json | null
          before_summary: Json | null
          data_classification: Database["public"]["Enums"]["data_classification"]
          id: string
          occurred_at: string
          reason: string | null
          request_correlation_id: string
          subject_id: string
          subject_table: string
        }
        Insert: {
          action: string
          actor_admin_id?: string | null
          after_summary?: Json | null
          before_summary?: Json | null
          data_classification: Database["public"]["Enums"]["data_classification"]
          id?: string
          occurred_at?: string
          reason?: string | null
          request_correlation_id: string
          subject_id: string
          subject_table: string
        }
        Update: {
          action?: string
          actor_admin_id?: string | null
          after_summary?: Json | null
          before_summary?: Json | null
          data_classification?: Database["public"]["Enums"]["data_classification"]
          id?: string
          occurred_at?: string
          reason?: string | null
          request_correlation_id?: string
          subject_id?: string
          subject_table?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_admin_id_fkey"
            columns: ["actor_admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_methods: {
        Row: {
          active: boolean
          contact_type: string
          created_at: string
          display_value: string
          id: string
          last_checked_at: string | null
          normalized_value: string
          place_id: string
          publication_permitted: boolean
          source_assertion_id: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          active?: boolean
          contact_type: string
          created_at?: string
          display_value: string
          id?: string
          last_checked_at?: string | null
          normalized_value: string
          place_id: string
          publication_permitted?: boolean
          source_assertion_id: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          active?: boolean
          contact_type?: string
          created_at?: string
          display_value?: string
          id?: string
          last_checked_at?: string | null
          normalized_value?: string
          place_id?: string
          publication_permitted?: boolean
          source_assertion_id?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "contact_methods_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_methods_source_assertion_id_fkey"
            columns: ["source_assertion_id"]
            isOneToOne: false
            referencedRelation: "source_assertions"
            referencedColumns: ["id"]
          },
        ]
      }
      content_internal_notes: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string
          entity_id: string
          entity_kind: string
          id: string
          note: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by: string
          entity_id: string
          entity_kind: string
          id?: string
          note: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string
          entity_id?: string
          entity_kind?: string
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_internal_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          activated_at: string | null
          activation_status: string
          archived_at: string | null
          area_square_km: number | null
          boundary_geojson: Json | null
          boundary_source_id: string | null
          capital_district_english_name: string | null
          capital_district_thai_name: string | null
          climate_summary: string | null
          created_at: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          future_map_configuration: Json
          geography_id: string
          geography_summary: string | null
          hero_media_id: string | null
          history_summary: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          normalized_name: string
          population: number | null
          profile_confidence: number | null
          profile_last_checked_at: string | null
          profile_source_id: string | null
          profile_verification_status: Database["public"]["Enums"]["verification_status"]
          profile_verified_at: string | null
          province_motto: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          tags: string[]
          traveler_description: string | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          activation_status?: string
          archived_at?: string | null
          area_square_km?: number | null
          boundary_geojson?: Json | null
          boundary_source_id?: string | null
          capital_district_english_name?: string | null
          capital_district_thai_name?: string | null
          climate_summary?: string | null
          created_at?: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          future_map_configuration?: Json
          geography_id: string
          geography_summary?: string | null
          hero_media_id?: string | null
          history_summary?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          normalized_name: string
          population?: number | null
          profile_confidence?: number | null
          profile_last_checked_at?: string | null
          profile_source_id?: string | null
          profile_verification_status?: Database["public"]["Enums"]["verification_status"]
          profile_verified_at?: string | null
          province_motto?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          tags?: string[]
          traveler_description?: string | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          activation_status?: string
          archived_at?: string | null
          area_square_km?: number | null
          boundary_geojson?: Json | null
          boundary_source_id?: string | null
          capital_district_english_name?: string | null
          capital_district_thai_name?: string | null
          climate_summary?: string | null
          created_at?: string
          data_classification?: Database["public"]["Enums"]["data_classification"]
          future_map_configuration?: Json
          geography_id?: string
          geography_summary?: string | null
          hero_media_id?: string | null
          history_summary?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          normalized_name?: string
          population?: number | null
          profile_confidence?: number | null
          profile_last_checked_at?: string | null
          profile_source_id?: string | null
          profile_verification_status?: Database["public"]["Enums"]["verification_status"]
          profile_verified_at?: string | null
          province_motto?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          tags?: string[]
          traveler_description?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "destinations_boundary_source_fk"
            columns: ["boundary_source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "destinations_geography_id_fkey"
            columns: ["geography_id"]
            isOneToOne: false
            referencedRelation: "geographies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "destinations_hero_media_id_fkey"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "destinations_profile_source_id_fkey"
            columns: ["profile_source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_incidents: {
        Row: {
          created_at: string
          emergency_place_id: string
          id: string
          incident_type: string
          notes: string
          reported_by_admin_id: string
          resolved_at: string | null
        }
        Insert: {
          created_at?: string
          emergency_place_id: string
          id?: string
          incident_type: string
          notes: string
          reported_by_admin_id: string
          resolved_at?: string | null
        }
        Update: {
          created_at?: string
          emergency_place_id?: string
          id?: string
          incident_type?: string
          notes?: string
          reported_by_admin_id?: string
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_incidents_emergency_place_id_fkey"
            columns: ["emergency_place_id"]
            isOneToOne: false
            referencedRelation: "emergency_service_profiles"
            referencedColumns: ["place_id"]
          },
          {
            foreignKeyName: "emergency_incidents_emergency_place_id_fkey"
            columns: ["emergency_place_id"]
            isOneToOne: false
            referencedRelation: "public_emergency_catalog"
            referencedColumns: ["place_id"]
          },
          {
            foreignKeyName: "emergency_incidents_reported_by_admin_id_fkey"
            columns: ["reported_by_admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_service_profiles: {
        Row: {
          authoritative_source_id: string
          created_at: string
          emergency_category: string
          incident_notes: string | null
          next_verification_at: string
          official_thai_name: string
          operating_status: string
          place_id: string
          primary_verification_id: string
          publication_eligible: boolean | null
          reviewed_english_name: string
          safety_reviewer_id: string
          secondary_verification_id: string | null
          stale_at: string
          suppression_reason: string | null
          suppression_status: string
          updated_at: string
          verified_at: string
          verified_phone_contact_id: string | null
        }
        Insert: {
          authoritative_source_id: string
          created_at?: string
          emergency_category: string
          incident_notes?: string | null
          next_verification_at: string
          official_thai_name: string
          operating_status: string
          place_id: string
          primary_verification_id: string
          publication_eligible?: boolean | null
          reviewed_english_name: string
          safety_reviewer_id: string
          secondary_verification_id?: string | null
          stale_at: string
          suppression_reason?: string | null
          suppression_status?: string
          updated_at?: string
          verified_at: string
          verified_phone_contact_id?: string | null
        }
        Update: {
          authoritative_source_id?: string
          created_at?: string
          emergency_category?: string
          incident_notes?: string | null
          next_verification_at?: string
          official_thai_name?: string
          operating_status?: string
          place_id?: string
          primary_verification_id?: string
          publication_eligible?: boolean | null
          reviewed_english_name?: string
          safety_reviewer_id?: string
          secondary_verification_id?: string | null
          stale_at?: string
          suppression_reason?: string | null
          suppression_status?: string
          updated_at?: string
          verified_at?: string
          verified_phone_contact_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_service_profiles_authoritative_source_id_fkey"
            columns: ["authoritative_source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_service_profiles_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: true
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_service_profiles_primary_verification_id_fkey"
            columns: ["primary_verification_id"]
            isOneToOne: false
            referencedRelation: "verifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_service_profiles_safety_reviewer_id_fkey"
            columns: ["safety_reviewer_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_service_profiles_secondary_verification_id_fkey"
            columns: ["secondary_verification_id"]
            isOneToOne: false
            referencedRelation: "verifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_service_profiles_verified_phone_contact_id_fkey"
            columns: ["verified_phone_contact_id"]
            isOneToOne: false
            referencedRelation: "contact_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      event_assertions: {
        Row: {
          assertion_id: string
          event_id: string
        }
        Insert: {
          assertion_id: string
          event_id: string
        }
        Update: {
          assertion_id?: string
          event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_assertions_assertion_id_fkey"
            columns: ["assertion_id"]
            isOneToOne: true
            referencedRelation: "source_assertions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_assertions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_occurrences: {
        Row: {
          cancellation_reason: string | null
          created_at: string
          destination_id: string
          ends_at: string | null
          event_id: string
          id: string
          last_checked_at: string | null
          occurrence_status: string
          publication_status: Database["public"]["Enums"]["publication_status"]
          stale_at: string | null
          starts_at: string
          timezone: string
          updated_at: string
          venue_place_id: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          cancellation_reason?: string | null
          created_at?: string
          destination_id: string
          ends_at?: string | null
          event_id: string
          id?: string
          last_checked_at?: string | null
          occurrence_status?: string
          publication_status?: Database["public"]["Enums"]["publication_status"]
          stale_at?: string | null
          starts_at: string
          timezone?: string
          updated_at?: string
          venue_place_id?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          cancellation_reason?: string | null
          created_at?: string
          destination_id?: string
          ends_at?: string | null
          event_id?: string
          id?: string
          last_checked_at?: string | null
          occurrence_status?: string
          publication_status?: Database["public"]["Enums"]["publication_status"]
          stale_at?: string | null
          starts_at?: string
          timezone?: string
          updated_at?: string
          venue_place_id?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "event_occurrences_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_occurrences_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_occurrences_venue_place_id_fkey"
            columns: ["venue_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      event_translations: {
        Row: {
          accessibility_information: string | null
          event_id: string
          id: string
          instructions: string | null
          language_code: string
          long_description: string | null
          machine_generated: boolean
          name: string
          publication_status: Database["public"]["Enums"]["publication_status"]
          reviewed_at: string | null
          reviewer_id: string | null
          short_description: string | null
          source_language_code: string
          translation_status: string
          warnings: string | null
        }
        Insert: {
          accessibility_information?: string | null
          event_id: string
          id?: string
          instructions?: string | null
          language_code: string
          long_description?: string | null
          machine_generated?: boolean
          name: string
          publication_status?: Database["public"]["Enums"]["publication_status"]
          reviewed_at?: string | null
          reviewer_id?: string | null
          short_description?: string | null
          source_language_code: string
          translation_status?: string
          warnings?: string | null
        }
        Update: {
          accessibility_information?: string | null
          event_id?: string
          id?: string
          instructions?: string | null
          language_code?: string
          long_description?: string | null
          machine_generated?: boolean
          name?: string
          publication_status?: Database["public"]["Enums"]["publication_status"]
          reviewed_at?: string | null
          reviewer_id?: string | null
          short_description?: string | null
          source_language_code?: string
          translation_status?: string
          warnings?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_translations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_translations_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_verifications: {
        Row: {
          event_id: string
          verification_id: string
        }
        Insert: {
          event_id: string
          verification_id: string
        }
        Update: {
          event_id?: string
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_verifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_verifications_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: true
            referencedRelation: "verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          archived_at: string | null
          canonical_thai_name: string
          confidence_score: number | null
          created_at: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          destination_id: string
          event_category: string
          history_summary: string | null
          host_place_id: string | null
          id: string
          last_checked_at: string | null
          normalized_name: string
          publication_status: Database["public"]["Enums"]["publication_status"]
          recurrence_source_metadata: Json | null
          stale_at: string | null
          tags: string[]
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          archived_at?: string | null
          canonical_thai_name: string
          confidence_score?: number | null
          created_at?: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          destination_id: string
          event_category: string
          history_summary?: string | null
          host_place_id?: string | null
          id?: string
          last_checked_at?: string | null
          normalized_name: string
          publication_status?: Database["public"]["Enums"]["publication_status"]
          recurrence_source_metadata?: Json | null
          stale_at?: string | null
          tags?: string[]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          archived_at?: string | null
          canonical_thai_name?: string
          confidence_score?: number | null
          created_at?: string
          data_classification?: Database["public"]["Enums"]["data_classification"]
          destination_id?: string
          event_category?: string
          history_summary?: string | null
          host_place_id?: string | null
          id?: string
          last_checked_at?: string | null
          normalized_name?: string
          publication_status?: Database["public"]["Enums"]["publication_status"]
          recurrence_source_metadata?: Json | null
          stale_at?: string | null
          tags?: string[]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "events_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_host_place_id_fkey"
            columns: ["host_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      external_references: {
        Row: {
          active: boolean
          created_at: string
          external_identifier: string | null
          id: string
          place_id: string | null
          provider_name: string | null
          reference_type: string
          reference_url: string | null
          restrictions: string | null
          retrieved_at: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          external_identifier?: string | null
          id?: string
          place_id?: string | null
          provider_name?: string | null
          reference_type: string
          reference_url?: string | null
          restrictions?: string | null
          retrieved_at?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          external_identifier?: string | null
          id?: string
          place_id?: string | null
          provider_name?: string | null
          reference_type?: string
          reference_url?: string | null
          restrictions?: string | null
          retrieved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_references_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      food_specialties: {
        Row: {
          allergen_notes: string | null
          archived_at: string | null
          authentic_production_area: string | null
          canonical_thai_name: string
          category: string
          community_enterprise: string | null
          confidence_score: number | null
          created_at: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          dietary_notes: string | null
          history_summary: string | null
          id: string
          last_checked_at: string | null
          local_producer: string | null
          normalized_name: string
          production_area: string | null
          publication_status: Database["public"]["Enums"]["publication_status"]
          tags: string[]
          traveler_description: string | null
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          allergen_notes?: string | null
          archived_at?: string | null
          authentic_production_area?: string | null
          canonical_thai_name: string
          category: string
          community_enterprise?: string | null
          confidence_score?: number | null
          created_at?: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          dietary_notes?: string | null
          history_summary?: string | null
          id?: string
          last_checked_at?: string | null
          local_producer?: string | null
          normalized_name: string
          production_area?: string | null
          publication_status?: Database["public"]["Enums"]["publication_status"]
          tags?: string[]
          traveler_description?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          allergen_notes?: string | null
          archived_at?: string | null
          authentic_production_area?: string | null
          canonical_thai_name?: string
          category?: string
          community_enterprise?: string | null
          confidence_score?: number | null
          created_at?: string
          data_classification?: Database["public"]["Enums"]["data_classification"]
          dietary_notes?: string | null
          history_summary?: string | null
          id?: string
          last_checked_at?: string | null
          local_producer?: string | null
          normalized_name?: string
          production_area?: string | null
          publication_status?: Database["public"]["Enums"]["publication_status"]
          tags?: string[]
          traveler_description?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      food_specialty_assertions: {
        Row: {
          assertion_id: string
          food_specialty_id: string
        }
        Insert: {
          assertion_id: string
          food_specialty_id: string
        }
        Update: {
          assertion_id?: string
          food_specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_specialty_assertions_assertion_id_fkey"
            columns: ["assertion_id"]
            isOneToOne: true
            referencedRelation: "source_assertions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_specialty_assertions_food_specialty_id_fkey"
            columns: ["food_specialty_id"]
            isOneToOne: false
            referencedRelation: "food_specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_specialty_assertions_food_specialty_id_fkey"
            columns: ["food_specialty_id"]
            isOneToOne: false
            referencedRelation: "public_food_specialty_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      food_specialty_destinations: {
        Row: {
          destination_id: string
          food_specialty_id: string
        }
        Insert: {
          destination_id: string
          food_specialty_id: string
        }
        Update: {
          destination_id?: string
          food_specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_specialty_destinations_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_specialty_destinations_food_specialty_id_fkey"
            columns: ["food_specialty_id"]
            isOneToOne: false
            referencedRelation: "food_specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_specialty_destinations_food_specialty_id_fkey"
            columns: ["food_specialty_id"]
            isOneToOne: false
            referencedRelation: "public_food_specialty_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      food_specialty_translations: {
        Row: {
          accessibility_information: string | null
          food_specialty_id: string
          id: string
          instructions: string | null
          language_code: string
          long_description: string | null
          machine_generated: boolean
          name: string
          publication_status: Database["public"]["Enums"]["publication_status"]
          reviewed_at: string | null
          reviewer_id: string | null
          short_description: string | null
          source_language_code: string
          translation_status: string
          warnings: string | null
        }
        Insert: {
          accessibility_information?: string | null
          food_specialty_id: string
          id?: string
          instructions?: string | null
          language_code: string
          long_description?: string | null
          machine_generated?: boolean
          name: string
          publication_status?: Database["public"]["Enums"]["publication_status"]
          reviewed_at?: string | null
          reviewer_id?: string | null
          short_description?: string | null
          source_language_code: string
          translation_status?: string
          warnings?: string | null
        }
        Update: {
          accessibility_information?: string | null
          food_specialty_id?: string
          id?: string
          instructions?: string | null
          language_code?: string
          long_description?: string | null
          machine_generated?: boolean
          name?: string
          publication_status?: Database["public"]["Enums"]["publication_status"]
          reviewed_at?: string | null
          reviewer_id?: string | null
          short_description?: string | null
          source_language_code?: string
          translation_status?: string
          warnings?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_specialty_translations_food_specialty_id_fkey"
            columns: ["food_specialty_id"]
            isOneToOne: false
            referencedRelation: "food_specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_specialty_translations_food_specialty_id_fkey"
            columns: ["food_specialty_id"]
            isOneToOne: false
            referencedRelation: "public_food_specialty_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_specialty_translations_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      food_specialty_verifications: {
        Row: {
          food_specialty_id: string
          verification_id: string
        }
        Insert: {
          food_specialty_id: string
          verification_id: string
        }
        Update: {
          food_specialty_id?: string
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_specialty_verifications_food_specialty_id_fkey"
            columns: ["food_specialty_id"]
            isOneToOne: false
            referencedRelation: "food_specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_specialty_verifications_food_specialty_id_fkey"
            columns: ["food_specialty_id"]
            isOneToOne: false
            referencedRelation: "public_food_specialty_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_specialty_verifications_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: true
            referencedRelation: "verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      geographies: {
        Row: {
          archived_at: string | null
          canonical_thai_name: string
          centroid_latitude: number | null
          centroid_longitude: number | null
          country_code: string
          created_at: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          default_english_name: string | null
          geography_type: string
          id: string
          normalized_name: string
          official_code: string | null
          parent_id: string | null
          region_code: string | null
          region_name: string | null
          slug: string | null
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          canonical_thai_name: string
          centroid_latitude?: number | null
          centroid_longitude?: number | null
          country_code?: string
          created_at?: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          default_english_name?: string | null
          geography_type: string
          id?: string
          normalized_name: string
          official_code?: string | null
          parent_id?: string | null
          region_code?: string | null
          region_name?: string | null
          slug?: string | null
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          canonical_thai_name?: string
          centroid_latitude?: number | null
          centroid_longitude?: number | null
          country_code?: string
          created_at?: string
          data_classification?: Database["public"]["Enums"]["data_classification"]
          default_english_name?: string | null
          geography_type?: string
          id?: string
          normalized_name?: string
          official_code?: string | null
          parent_id?: string | null
          region_code?: string | null
          region_name?: string | null
          slug?: string | null
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geographies_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "geographies"
            referencedColumns: ["id"]
          },
        ]
      }
      incorrect_information_reports: {
        Row: {
          assigned_admin_id: string | null
          category: string
          created_at: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          description: string
          event_id: string | null
          food_specialty_id: string | null
          id: string
          place_id: string | null
          priority: string
          report_status: string
          reporter_session_id: string
          resolution: string | null
          resolved_at: string | null
        }
        Insert: {
          assigned_admin_id?: string | null
          category: string
          created_at?: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          description: string
          event_id?: string | null
          food_specialty_id?: string | null
          id?: string
          place_id?: string | null
          priority?: string
          report_status?: string
          reporter_session_id: string
          resolution?: string | null
          resolved_at?: string | null
        }
        Update: {
          assigned_admin_id?: string | null
          category?: string
          created_at?: string
          data_classification?: Database["public"]["Enums"]["data_classification"]
          description?: string
          event_id?: string | null
          food_specialty_id?: string | null
          id?: string
          place_id?: string | null
          priority?: string
          report_status?: string
          reporter_session_id?: string
          resolution?: string | null
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incorrect_information_reports_assigned_admin_id_fkey"
            columns: ["assigned_admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incorrect_information_reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incorrect_information_reports_food_specialty_id_fkey"
            columns: ["food_specialty_id"]
            isOneToOne: false
            referencedRelation: "food_specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incorrect_information_reports_food_specialty_id_fkey"
            columns: ["food_specialty_id"]
            isOneToOne: false
            referencedRelation: "public_food_specialty_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incorrect_information_reports_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incorrect_information_reports_reporter_session_id_fkey"
            columns: ["reporter_session_id"]
            isOneToOne: false
            referencedRelation: "traveler_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_days: {
        Row: {
          day_order: number
          id: string
          notes: string | null
          planned_date: string
          trip_id: string
        }
        Insert: {
          day_order: number
          id?: string
          notes?: string | null
          planned_date: string
          trip_id: string
        }
        Update: {
          day_order?: number
          id?: string
          notes?: string | null
          planned_date?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_days_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_items: {
        Row: {
          ai_generated: boolean
          data_classification: Database["public"]["Enums"]["data_classification"]
          event_occurrence_id: string | null
          external_navigation_label: string | null
          external_navigation_latitude: number | null
          external_navigation_longitude: number | null
          id: string
          item_order: number
          item_status: string
          itinerary_day_id: string
          notes: string | null
          place_id: string | null
          planned_at: string | null
          traveler_modified_at: string | null
        }
        Insert: {
          ai_generated?: boolean
          data_classification: Database["public"]["Enums"]["data_classification"]
          event_occurrence_id?: string | null
          external_navigation_label?: string | null
          external_navigation_latitude?: number | null
          external_navigation_longitude?: number | null
          id?: string
          item_order: number
          item_status?: string
          itinerary_day_id: string
          notes?: string | null
          place_id?: string | null
          planned_at?: string | null
          traveler_modified_at?: string | null
        }
        Update: {
          ai_generated?: boolean
          data_classification?: Database["public"]["Enums"]["data_classification"]
          event_occurrence_id?: string | null
          external_navigation_label?: string | null
          external_navigation_latitude?: number | null
          external_navigation_longitude?: number | null
          id?: string
          item_order?: number
          item_status?: string
          itinerary_day_id?: string
          notes?: string | null
          place_id?: string | null
          planned_at?: string | null
          traveler_modified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_items_event_occurrence_id_fkey"
            columns: ["event_occurrence_id"]
            isOneToOne: false
            referencedRelation: "event_occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_items_itinerary_day_id_fkey"
            columns: ["itinerary_day_id"]
            isOneToOne: false
            referencedRelation: "itinerary_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_items_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          approval_status: string
          attribution_required: boolean
          attribution_text: string | null
          commercial_use_permitted: boolean
          created_at: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          evidence_reference: string
          expires_at: string | null
          id: string
          license_category: string
          modification_permitted: boolean
          name: string
          redistribution_permitted: boolean
          rights_holder: string
          storage_permitted: boolean
          terms_url: string | null
          updated_at: string
        }
        Insert: {
          approval_status?: string
          attribution_required?: boolean
          attribution_text?: string | null
          commercial_use_permitted?: boolean
          created_at?: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          evidence_reference: string
          expires_at?: string | null
          id?: string
          license_category: string
          modification_permitted?: boolean
          name: string
          redistribution_permitted?: boolean
          rights_holder: string
          storage_permitted?: boolean
          terms_url?: string | null
          updated_at?: string
        }
        Update: {
          approval_status?: string
          attribution_required?: boolean
          attribution_text?: string | null
          commercial_use_permitted?: boolean
          created_at?: string
          data_classification?: Database["public"]["Enums"]["data_classification"]
          evidence_reference?: string
          expires_at?: string | null
          id?: string
          license_category?: string
          modification_permitted?: boolean
          name?: string
          redistribution_permitted?: boolean
          rights_holder?: string
          storage_permitted?: boolean
          terms_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          acquired_at: string
          ai_generated_decorative: boolean
          approved_display_contexts: string[]
          asset_type: string
          created_at: string
          creator_name: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          depicts_real_place: boolean
          expires_at: string | null
          id: string
          license_id: string
          publication_status: Database["public"]["Enums"]["publication_status"]
          rights_holder: string
          source_id: string
          storage_key: string
          takedown_status: string
          updated_at: string
        }
        Insert: {
          acquired_at: string
          ai_generated_decorative?: boolean
          approved_display_contexts?: string[]
          asset_type: string
          created_at?: string
          creator_name: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          depicts_real_place?: boolean
          expires_at?: string | null
          id?: string
          license_id: string
          publication_status?: Database["public"]["Enums"]["publication_status"]
          rights_holder: string
          source_id: string
          storage_key: string
          takedown_status?: string
          updated_at?: string
        }
        Update: {
          acquired_at?: string
          ai_generated_decorative?: boolean
          approved_display_contexts?: string[]
          asset_type?: string
          created_at?: string
          creator_name?: string
          data_classification?: Database["public"]["Enums"]["data_classification"]
          depicts_real_place?: boolean
          expires_at?: string | null
          id?: string
          license_id?: string
          publication_status?: Database["public"]["Enums"]["publication_status"]
          rights_holder?: string
          source_id?: string
          storage_key?: string
          takedown_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_hour_rules: {
        Row: {
          appointment_only: boolean
          closed: boolean
          closes_at: string | null
          day_of_week: number | null
          id: string
          open_24_hours: boolean
          opening_hour_set_id: string
          opens_at: string | null
          overnight: boolean
          specific_date: string | null
        }
        Insert: {
          appointment_only?: boolean
          closed?: boolean
          closes_at?: string | null
          day_of_week?: number | null
          id?: string
          open_24_hours?: boolean
          opening_hour_set_id: string
          opens_at?: string | null
          overnight?: boolean
          specific_date?: string | null
        }
        Update: {
          appointment_only?: boolean
          closed?: boolean
          closes_at?: string | null
          day_of_week?: number | null
          id?: string
          open_24_hours?: boolean
          opening_hour_set_id?: string
          opens_at?: string | null
          overnight?: boolean
          specific_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opening_hour_rules_opening_hour_set_id_fkey"
            columns: ["opening_hour_set_id"]
            isOneToOne: false
            referencedRelation: "opening_hour_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_hour_sets: {
        Row: {
          active: boolean
          created_at: string
          id: string
          place_id: string
          source_assertion_id: string | null
          temporarily_closed: boolean
          timezone: string
          valid_from: string | null
          valid_until: string | null
          verified_at: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          place_id: string
          source_assertion_id?: string | null
          temporarily_closed?: boolean
          timezone?: string
          valid_from?: string | null
          valid_until?: string | null
          verified_at?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          place_id?: string
          source_assertion_id?: string | null
          temporarily_closed?: boolean
          timezone?: string
          valid_from?: string | null
          valid_until?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opening_hour_sets_assertion_fk"
            columns: ["source_assertion_id"]
            isOneToOne: false
            referencedRelation: "source_assertions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opening_hour_sets_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_assertions: {
        Row: {
          assertion_id: string
          place_id: string
        }
        Insert: {
          assertion_id: string
          place_id: string
        }
        Update: {
          assertion_id?: string
          place_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_assertions_assertion_id_fkey"
            columns: ["assertion_id"]
            isOneToOne: true
            referencedRelation: "source_assertions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_assertions_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_media: {
        Row: {
          display_context: string
          display_order: number
          media_asset_id: string
          place_id: string
        }
        Insert: {
          display_context?: string
          display_order?: number
          media_asset_id: string
          place_id: string
        }
        Update: {
          display_context?: string
          display_order?: number
          media_asset_id?: string
          place_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_media_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      place_translations: {
        Row: {
          accessibility_information: string | null
          created_at: string
          id: string
          instructions: string | null
          language_code: string
          long_description: string | null
          machine_generated: boolean
          name: string
          place_id: string
          publication_status: Database["public"]["Enums"]["publication_status"]
          reviewed_at: string | null
          reviewer_id: string | null
          short_description: string | null
          source_language_code: string
          translation_status: string
          updated_at: string
          warnings: string | null
        }
        Insert: {
          accessibility_information?: string | null
          created_at?: string
          id?: string
          instructions?: string | null
          language_code: string
          long_description?: string | null
          machine_generated?: boolean
          name: string
          place_id: string
          publication_status?: Database["public"]["Enums"]["publication_status"]
          reviewed_at?: string | null
          reviewer_id?: string | null
          short_description?: string | null
          source_language_code: string
          translation_status?: string
          updated_at?: string
          warnings?: string | null
        }
        Update: {
          accessibility_information?: string | null
          created_at?: string
          id?: string
          instructions?: string | null
          language_code?: string
          long_description?: string | null
          machine_generated?: boolean
          name?: string
          place_id?: string
          publication_status?: Database["public"]["Enums"]["publication_status"]
          reviewed_at?: string | null
          reviewer_id?: string | null
          short_description?: string | null
          source_language_code?: string
          translation_status?: string
          updated_at?: string
          warnings?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_translations_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_translations_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      place_verifications: {
        Row: {
          place_id: string
          verification_id: string
        }
        Insert: {
          place_id: string
          verification_id: string
        }
        Update: {
          place_id?: string
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_verifications_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_verifications_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: true
            referencedRelation: "verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          address_summary: string
          archived_at: string | null
          canonical_thai_name: string
          confidence_score: number | null
          created_at: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          default_english_name: string | null
          destination_id: string
          district_geography_id: string | null
          geography_id: string
          highlights: string[]
          history_summary: string | null
          id: string
          last_checked_at: string | null
          latitude: number
          longitude: number
          normalized_search_name: string
          operating_status: string
          place_category: string
          publication_status: Database["public"]["Enums"]["publication_status"]
          stale_at: string | null
          suppressed_at: string | null
          suppression_reason: string | null
          tags: string[]
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          website_url: string | null
        }
        Insert: {
          address_summary: string
          archived_at?: string | null
          canonical_thai_name: string
          confidence_score?: number | null
          created_at?: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          default_english_name?: string | null
          destination_id: string
          district_geography_id?: string | null
          geography_id: string
          highlights?: string[]
          history_summary?: string | null
          id?: string
          last_checked_at?: string | null
          latitude: number
          longitude: number
          normalized_search_name: string
          operating_status?: string
          place_category: string
          publication_status?: Database["public"]["Enums"]["publication_status"]
          stale_at?: string | null
          suppressed_at?: string | null
          suppression_reason?: string | null
          tags?: string[]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website_url?: string | null
        }
        Update: {
          address_summary?: string
          archived_at?: string | null
          canonical_thai_name?: string
          confidence_score?: number | null
          created_at?: string
          data_classification?: Database["public"]["Enums"]["data_classification"]
          default_english_name?: string | null
          destination_id?: string
          district_geography_id?: string | null
          geography_id?: string
          highlights?: string[]
          history_summary?: string | null
          id?: string
          last_checked_at?: string | null
          latitude?: number
          longitude?: number
          normalized_search_name?: string
          operating_status?: string
          place_category?: string
          publication_status?: Database["public"]["Enums"]["publication_status"]
          stale_at?: string | null
          suppressed_at?: string | null
          suppression_reason?: string | null
          tags?: string[]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_district_geography_id_fkey"
            columns: ["district_geography_id"]
            isOneToOne: false
            referencedRelation: "geographies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_geography_id_fkey"
            columns: ["geography_id"]
            isOneToOne: false
            referencedRelation: "geographies"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_food_specialties: {
        Row: {
          food_specialty_id: string
          restaurant_place_id: string
          source_assertion_id: string | null
        }
        Insert: {
          food_specialty_id: string
          restaurant_place_id: string
          source_assertion_id?: string | null
        }
        Update: {
          food_specialty_id?: string
          restaurant_place_id?: string
          source_assertion_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_food_specialties_assertion_fk"
            columns: ["source_assertion_id"]
            isOneToOne: false
            referencedRelation: "source_assertions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_food_specialties_food_specialty_id_fkey"
            columns: ["food_specialty_id"]
            isOneToOne: false
            referencedRelation: "food_specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_food_specialties_food_specialty_id_fkey"
            columns: ["food_specialty_id"]
            isOneToOne: false
            referencedRelation: "public_food_specialty_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_food_specialties_restaurant_place_id_fkey"
            columns: ["restaurant_place_id"]
            isOneToOne: false
            referencedRelation: "restaurant_profiles"
            referencedColumns: ["place_id"]
          },
        ]
      }
      restaurant_profiles: {
        Row: {
          created_at: string
          cuisine_categories: string[]
          dietary_information: string[]
          operating_notes: string | null
          place_id: string
          price_range: number | null
          recommended_menu: string[]
          reservation_requirement: string | null
          service_modes: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          cuisine_categories?: string[]
          dietary_information?: string[]
          operating_notes?: string | null
          place_id: string
          price_range?: number | null
          recommended_menu?: string[]
          reservation_requirement?: string | null
          service_modes?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          cuisine_categories?: string[]
          dietary_information?: string[]
          operating_notes?: string | null
          place_id?: string
          price_range?: number | null
          recommended_menu?: string[]
          reservation_requirement?: string | null
          service_modes?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_profiles_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: true
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_places: {
        Row: {
          id: string
          note: string | null
          place_id: string
          saved_at: string
          traveler_session_id: string
          trip_id: string | null
        }
        Insert: {
          id?: string
          note?: string | null
          place_id: string
          saved_at?: string
          traveler_session_id: string
          trip_id?: string | null
        }
        Update: {
          id?: string
          note?: string | null
          place_id?: string
          saved_at?: string
          traveler_session_id?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_places_traveler_session_id_fkey"
            columns: ["traveler_session_id"]
            isOneToOne: false
            referencedRelation: "traveler_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_places_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      source_assertions: {
        Row: {
          claimed_value: Json
          confidence: number | null
          created_at: string
          effective_from: string | null
          evidence_notes: string | null
          expires_at: string | null
          field_key: string
          id: string
          observed_at: string | null
          recheck_at: string | null
          reviewer_id: string | null
          source_id: string
          subject_id: string
          subject_kind: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          claimed_value: Json
          confidence?: number | null
          created_at?: string
          effective_from?: string | null
          evidence_notes?: string | null
          expires_at?: string | null
          field_key: string
          id?: string
          observed_at?: string | null
          recheck_at?: string | null
          reviewer_id?: string | null
          source_id: string
          subject_id: string
          subject_kind: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          claimed_value?: Json
          confidence?: number | null
          created_at?: string
          effective_from?: string | null
          evidence_notes?: string | null
          expires_at?: string | null
          field_key?: string
          id?: string
          observed_at?: string | null
          recheck_at?: string | null
          reviewer_id?: string | null
          source_id?: string
          subject_id?: string
          subject_kind?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "source_assertions_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_assertions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          accessed_at: string
          created_at: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          document_reference: string | null
          evidence_locator: string | null
          evidence_notes: string | null
          id: string
          license_id: string | null
          owner_name: string
          ownership_status: string
          provenance_verification_status: Database["public"]["Enums"]["verification_status"]
          provenance_verified_at: string | null
          provenance_verifier_id: string | null
          source_type: string
          source_url: string | null
          title: string
          updated_at: string
          usage_rights_status: string
        }
        Insert: {
          accessed_at: string
          created_at?: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          document_reference?: string | null
          evidence_locator?: string | null
          evidence_notes?: string | null
          id?: string
          license_id?: string | null
          owner_name: string
          ownership_status?: string
          provenance_verification_status?: Database["public"]["Enums"]["verification_status"]
          provenance_verified_at?: string | null
          provenance_verifier_id?: string | null
          source_type: string
          source_url?: string | null
          title: string
          updated_at?: string
          usage_rights_status?: string
        }
        Update: {
          accessed_at?: string
          created_at?: string
          data_classification?: Database["public"]["Enums"]["data_classification"]
          document_reference?: string | null
          evidence_locator?: string | null
          evidence_notes?: string | null
          id?: string
          license_id?: string | null
          owner_name?: string
          ownership_status?: string
          provenance_verification_status?: Database["public"]["Enums"]["verification_status"]
          provenance_verified_at?: string | null
          provenance_verifier_id?: string | null
          source_type?: string
          source_url?: string | null
          title?: string
          updated_at?: string
          usage_rights_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sources_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sources_provenance_verifier_id_fkey"
            columns: ["provenance_verifier_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      traveler_profiles: {
        Row: {
          activity_level: string | null
          budget_style: string | null
          companions: string | null
          correlation_id: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          mobility_needs: string | null
          preferred_interests: string[]
          profile_name: string
          transportation: string | null
          travel_style: string | null
          traveler_session_id: string
          updated_at: string
        }
        Insert: {
          activity_level?: string | null
          budget_style?: string | null
          companions?: string | null
          correlation_id?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          mobility_needs?: string | null
          preferred_interests?: string[]
          profile_name: string
          transportation?: string | null
          travel_style?: string | null
          traveler_session_id: string
          updated_at?: string
        }
        Update: {
          activity_level?: string | null
          budget_style?: string | null
          companions?: string | null
          correlation_id?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          mobility_needs?: string | null
          preferred_interests?: string[]
          profile_name?: string
          transportation?: string | null
          travel_style?: string | null
          traveler_session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "traveler_profiles_traveler_session_id_fkey"
            columns: ["traveler_session_id"]
            isOneToOne: false
            referencedRelation: "traveler_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      traveler_sessions: {
        Row: {
          created_at: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          deleted_at: string | null
          destination_id: string | null
          expires_at: string
          id: string
          last_activity_at: string
          locale: string
          privacy_consent_state: Json
          revoked_at: string | null
          session_secret_hash: string
          traveler_preferences: Json
        }
        Insert: {
          created_at?: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          deleted_at?: string | null
          destination_id?: string | null
          expires_at: string
          id?: string
          last_activity_at?: string
          locale?: string
          privacy_consent_state?: Json
          revoked_at?: string | null
          session_secret_hash: string
          traveler_preferences?: Json
        }
        Update: {
          created_at?: string
          data_classification?: Database["public"]["Enums"]["data_classification"]
          deleted_at?: string | null
          destination_id?: string | null
          expires_at?: string
          id?: string
          last_activity_at?: string
          locale?: string
          privacy_consent_state?: Json
          revoked_at?: string | null
          session_secret_hash?: string
          traveler_preferences?: Json
        }
        Relationships: [
          {
            foreignKeyName: "traveler_sessions_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          deleted_at: string | null
          destination: string | null
          end_date: string | null
          id: string
          notes: string | null
          start_date: string | null
          timezone: string
          title: string
          traveler_profile_id: string | null
          traveler_session_id: string
          trip_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_classification: Database["public"]["Enums"]["data_classification"]
          deleted_at?: string | null
          destination?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          timezone?: string
          title: string
          traveler_profile_id?: string | null
          traveler_session_id: string
          trip_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_classification?: Database["public"]["Enums"]["data_classification"]
          deleted_at?: string | null
          destination?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          timezone?: string
          title?: string
          traveler_profile_id?: string | null
          traveler_session_id?: string
          trip_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_traveler_profile_id_fkey"
            columns: ["traveler_profile_id"]
            isOneToOne: false
            referencedRelation: "traveler_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_traveler_session_id_fkey"
            columns: ["traveler_session_id"]
            isOneToOne: false
            referencedRelation: "traveler_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      verifications: {
        Row: {
          created_at: string
          evidence_assertion_id: string | null
          id: string
          next_review_at: string | null
          notes: string | null
          reviewer_id: string | null
          stale_at: string | null
          status: Database["public"]["Enums"]["verification_status"]
          verification_type: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          evidence_assertion_id?: string | null
          id?: string
          next_review_at?: string | null
          notes?: string | null
          reviewer_id?: string | null
          stale_at?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          verification_type: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          evidence_assertion_id?: string | null
          id?: string
          next_review_at?: string | null
          notes?: string | null
          reviewer_id?: string | null
          stale_at?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          verification_type?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verifications_evidence_assertion_id_fkey"
            columns: ["evidence_assertion_id"]
            isOneToOne: false
            referencedRelation: "source_assertions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verifications_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_emergency_catalog: {
        Row: {
          address_summary: string | null
          destination_id: string | null
          emergency_category: string | null
          latitude: number | null
          longitude: number | null
          official_thai_name: string | null
          place_id: string | null
          reviewed_english_name: string | null
          stale_at: string | null
          verified_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_service_profiles_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: true
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      public_food_specialty_catalog: {
        Row: {
          canonical_thai_name: string | null
          category: string | null
          destination_id: string | null
          id: string | null
          last_checked_at: string | null
          normalized_name: string | null
          traveler_description: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_specialty_destinations_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_content_mutate: {
        Args: { p_command: Json; p_correlation_id: string }
        Returns: Json
      }
      admin_evidence_mutate: {
        Args: { p_command: Json; p_correlation_id: string }
        Returns: Json
      }
      current_traveler_session_id: { Args: never; Returns: string }
      delete_traveler_profile: {
        Args: {
          linked_trip_action?: string
          replacement_profile_id?: string
          target_profile_id: string
          target_session_id: string
        }
        Returns: undefined
      }
      destination_profile_has_approved_source: {
        Args: { target_destination_id: string }
        Returns: boolean
      }
      is_active_admin: { Args: never; Returns: boolean }
      is_founder: { Args: never; Returns: boolean }
      media_has_current_rights: {
        Args: { target_media_id: string }
        Returns: boolean
      }
      place_has_current_evidence: {
        Args: { target_place_id: string }
        Returns: boolean
      }
      reorder_itinerary_items: {
        Args: {
          ordered_item_ids: string[]
          target_day_id: string
          target_session_id: string
          target_trip_id: string
        }
        Returns: {
          ai_generated: boolean
          data_classification: Database["public"]["Enums"]["data_classification"]
          event_occurrence_id: string | null
          external_navigation_label: string | null
          external_navigation_latitude: number | null
          external_navigation_longitude: number | null
          id: string
          item_order: number
          item_status: string
          itinerary_day_id: string
          notes: string | null
          place_id: string | null
          planned_at: string | null
          traveler_modified_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "itinerary_items"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      set_active_traveler_profile: {
        Args: { target_profile_id: string; target_session_id: string }
        Returns: {
          activity_level: string | null
          budget_style: string | null
          companions: string | null
          correlation_id: string
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          mobility_needs: string | null
          preferred_interests: string[]
          profile_name: string
          transportation: string | null
          travel_style: string | null
          traveler_session_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "traveler_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      data_classification: "real" | "synthetic"
      publication_status:
        | "draft"
        | "evidence_pending"
        | "review_pending"
        | "approved"
        | "published"
        | "suppressed"
        | "archived"
      verification_status:
        | "unverified"
        | "pending"
        | "verified"
        | "disputed"
        | "expired"
        | "rejected"
        | "suppressed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      data_classification: ["real", "synthetic"],
      publication_status: [
        "draft",
        "evidence_pending",
        "review_pending",
        "approved",
        "published",
        "suppressed",
        "archived",
      ],
      verification_status: [
        "unverified",
        "pending",
        "verified",
        "disputed",
        "expired",
        "rejected",
        "suppressed",
      ],
    },
  },
} as const

