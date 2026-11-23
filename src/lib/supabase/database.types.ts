
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "about_sections": {
                  Row: {
                    "body": string,"key": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string,"key": string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "body"?: string,"key"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"announcements": {
                  Row: {
                    "body": string,"created_at": string,"id": string,"is_published": boolean,"published_at": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string,"created_at"?: string,"id"?: string,"is_published"?: boolean,"published_at"?: string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"id"?: string,"is_published"?: boolean,"published_at"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"audit_log": {
                  Row: {
                    "at": string,"id": number,"op": string,"record_id": string | null,"summary": string | null,"table_name": string,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "at"?: string,"id"?: never,"op": string,"record_id"?: string | null,"summary"?: string | null,"table_name": string,"user_id"?: string | null
                  }
                  Update: {
                    "at"?: string,"id"?: never,"op"?: string,"record_id"?: string | null,"summary"?: string | null,"table_name"?: string,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"clubs": {
                  Row: {
                    "center_address": string | null,"created_at": string,"description": string | null,"id": string,"leader_name": string | null,"members_count": number | null,"name": string,"photo_path": string | null,"room": string | null,"schedule": NonNullable<Json>,"school_students_count": number | null,"slug": string,"sort_order": number,"thumb_path": string | null,"type": Database["public"]['Enums']["club_type"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "center_address"?: string | null,"created_at"?: string,"description"?: string | null,"id"?: string,"leader_name"?: string | null,"members_count"?: number | null,"name": string,"photo_path"?: string | null,"room"?: string | null,"schedule"?: NonNullable<Json>,"school_students_count"?: number | null,"slug": string,"sort_order"?: number,"thumb_path"?: string | null,"type": Database["public"]['Enums']["club_type"],"updated_at"?: string
                  }
                  Update: {
                    "center_address"?: string | null,"created_at"?: string,"description"?: string | null,"id"?: string,"leader_name"?: string | null,"members_count"?: number | null,"name"?: string,"photo_path"?: string | null,"room"?: string | null,"schedule"?: NonNullable<Json>,"school_students_count"?: number | null,"slug"?: string,"sort_order"?: number,"thumb_path"?: string | null,"type"?: Database["public"]['Enums']["club_type"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"council_members": {
                  Row: {
                    "created_at": string,"direction_description": string | null,"direction_name": string | null,"first_name": string,"grade": string | null,"id": string,"is_active": boolean,"last_name": string,"photo_path": string | null,"role": Database["public"]['Enums']["council_role"],"slug": string,"sort_order": number,"thumb_path": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"direction_description"?: string | null,"direction_name"?: string | null,"first_name": string,"grade"?: string | null,"id"?: string,"is_active"?: boolean,"last_name"?: string,"photo_path"?: string | null,"role": Database["public"]['Enums']["council_role"],"slug": string,"sort_order"?: number,"thumb_path"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"direction_description"?: string | null,"direction_name"?: string | null,"first_name"?: string,"grade"?: string | null,"id"?: string,"is_active"?: boolean,"last_name"?: string,"photo_path"?: string | null,"role"?: Database["public"]['Enums']["council_role"],"slug"?: string,"sort_order"?: number,"thumb_path"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"event_files": {
                  Row: {
                    "event_id": string,"id": string,"mime": string | null,"name": string,"path": string,"size_bytes": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "event_id": string,"id"?: string,"mime"?: string | null,"name": string,"path": string,"size_bytes"?: number | null
                  }
                  Update: {
                    "event_id"?: string,"id"?: string,"mime"?: string | null,"name"?: string,"path"?: string,"size_bytes"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_files_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"event_images": {
                  Row: {
                    "alt": string | null,"event_id": string,"id": string,"path": string,"sort_order": number,"thumb_path": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "alt"?: string | null,"event_id": string,"id"?: string,"path": string,"sort_order"?: number,"thumb_path"?: string | null
                  }
                  Update: {
                    "alt"?: string | null,"event_id"?: string,"id"?: string,"path"?: string,"sort_order"?: number,"thumb_path"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_images_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"events": {
                  Row: {
                    "cover_path": string | null,"cover_thumb_path": string | null,"created_at": string,"description": string,"event_date": string,"event_time": string | null,"id": string,"is_published": boolean,"location": string | null,"published_at": string,"slug": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cover_path"?: string | null,"cover_thumb_path"?: string | null,"created_at"?: string,"description"?: string,"event_date": string,"event_time"?: string | null,"id"?: string,"is_published"?: boolean,"location"?: string | null,"published_at"?: string,"slug": string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "cover_path"?: string | null,"cover_thumb_path"?: string | null,"created_at"?: string,"description"?: string,"event_date"?: string,"event_time"?: string | null,"id"?: string,"is_published"?: boolean,"location"?: string | null,"published_at"?: string,"slug"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"gallery_images": {
                  Row: {
                    "caption": string | null,"created_at": string,"id": string,"path": string,"sort_order": number,"thumb_path": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "caption"?: string | null,"created_at"?: string,"id"?: string,"path": string,"sort_order"?: number,"thumb_path"?: string | null
                  }
                  Update: {
                    "caption"?: string | null,"created_at"?: string,"id"?: string,"path"?: string,"sort_order"?: number,"thumb_path"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"hero_slides": {
                  Row: {
                    "created_at": string,"id": string,"image_path": string,"is_active": boolean,"link_url": string | null,"sort_order": number,"thumb_path": string | null,"title": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"image_path": string,"is_active"?: boolean,"link_url"?: string | null,"sort_order"?: number,"thumb_path"?: string | null,"title"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"image_path"?: string,"is_active"?: boolean,"link_url"?: string | null,"sort_order"?: number,"thumb_path"?: string | null,"title"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"inquiries": {
                  Row: {
                    "created_at": string,"id": string,"message": string,"name": string,"phone": string,"status": Database["public"]['Enums']["inquiry_status"],"subject": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"message": string,"name": string,"phone": string,"status"?: Database["public"]['Enums']["inquiry_status"],"subject": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"message"?: string,"name"?: string,"phone"?: string,"status"?: Database["public"]['Enums']["inquiry_status"],"subject"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"leaders": {
                  Row: {
                    "bio": string | null,"created_at": string,"email": string | null,"full_name": string,"id": string,"phone": string | null,"photo_path": string | null,"position": string,"reception_days": string | null,"sort_order": number,"thumb_path": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "bio"?: string | null,"created_at"?: string,"email"?: string | null,"full_name": string,"id"?: string,"phone"?: string | null,"photo_path"?: string | null,"position": string,"reception_days"?: string | null,"sort_order"?: number,"thumb_path"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "bio"?: string | null,"created_at"?: string,"email"?: string | null,"full_name"?: string,"id"?: string,"phone"?: string | null,"photo_path"?: string | null,"position"?: string,"reception_days"?: string | null,"sort_order"?: number,"thumb_path"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"partners": {
                  Row: {
                    "created_at": string,"id": string,"logo_path": string | null,"name": string,"sort_order": number,"url": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"logo_path"?: string | null,"name": string,"sort_order"?: number,"url"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"logo_path"?: string | null,"name"?: string,"sort_order"?: number,"url"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"post_files": {
                  Row: {
                    "id": string,"mime": string | null,"name": string,"path": string,"post_id": string,"size_bytes": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"mime"?: string | null,"name": string,"path": string,"post_id": string,"size_bytes"?: number | null
                  }
                  Update: {
                    "id"?: string,"mime"?: string | null,"name"?: string,"path"?: string,"post_id"?: string,"size_bytes"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "post_files_post_id_fkey"
      columns: ["post_id"]
isOneToOne: false
      referencedRelation: "posts"
      referencedColumns: ["id"]
    }
                  ]
                },"post_images": {
                  Row: {
                    "alt": string | null,"id": string,"path": string,"post_id": string,"sort_order": number,"thumb_path": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "alt"?: string | null,"id"?: string,"path": string,"post_id": string,"sort_order"?: number,"thumb_path"?: string | null
                  }
                  Update: {
                    "alt"?: string | null,"id"?: string,"path"?: string,"post_id"?: string,"sort_order"?: number,"thumb_path"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "post_images_post_id_fkey"
      columns: ["post_id"]
isOneToOne: false
      referencedRelation: "posts"
      referencedColumns: ["id"]
    }
                  ]
                },"posts": {
                  Row: {
                    "author_id": string,"body": string,"cover_path": string | null,"cover_thumb_path": string | null,"created_at": string,"created_by": string | null,"excerpt": string | null,"id": string,"published_at": string | null,"reject_reason": string | null,"slug": string,"status": Database["public"]['Enums']["post_status"],"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id": string,"body"?: string,"cover_path"?: string | null,"cover_thumb_path"?: string | null,"created_at"?: string,"created_by"?: string | null,"excerpt"?: string | null,"id"?: string,"published_at"?: string | null,"reject_reason"?: string | null,"slug": string,"status"?: Database["public"]['Enums']["post_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "author_id"?: string,"body"?: string,"cover_path"?: string | null,"cover_thumb_path"?: string | null,"created_at"?: string,"created_by"?: string | null,"excerpt"?: string | null,"id"?: string,"published_at"?: string | null,"reject_reason"?: string | null,"slug"?: string,"status"?: Database["public"]['Enums']["post_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "posts_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "council_members"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "blocked": boolean,"council_member_id": string | null,"created_at": string,"full_name": string,"id": string,"role": Database["public"]['Enums']["user_role"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "blocked"?: boolean,"council_member_id"?: string | null,"created_at"?: string,"full_name"?: string,"id": string,"role"?: Database["public"]['Enums']["user_role"],"updated_at"?: string
                  }
                  Update: {
                    "blocked"?: boolean,"council_member_id"?: string | null,"created_at"?: string,"full_name"?: string,"id"?: string,"role"?: Database["public"]['Enums']["user_role"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_council_member_id_fkey"
      columns: ["council_member_id"]
isOneToOne: true
      referencedRelation: "council_members"
      referencedColumns: ["id"]
    }
                  ]
                },"rate_limits": {
                  Row: {
                    "hits": number,"key": string,"window_start": string
                  }
                  ComputedFields: never
                  Insert: {
                    "hits"?: number,"key": string,"window_start"?: string
                  }
                  Update: {
                    "hits"?: number,"key"?: string,"window_start"?: string
                  }
                  Relationships: [
                    
                  ]
                },"registry_files": {
                  Row: {
                    "created_at": string,"id": string,"mime": string | null,"name": string,"path": string,"size_bytes": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"mime"?: string | null,"name": string,"path": string,"size_bytes"?: number | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"mime"?: string | null,"name"?: string,"path"?: string,"size_bytes"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"registry_students": {
                  Row: {
                    "club_id": string | null,"created_at": string,"full_name": string,"grade": string | null,"id": string,"note": string | null,"status": Database["public"]['Enums']["participation"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "club_id"?: string | null,"created_at"?: string,"full_name": string,"grade"?: string | null,"id"?: string,"note"?: string | null,"status"?: Database["public"]['Enums']["participation"],"updated_at"?: string
                  }
                  Update: {
                    "club_id"?: string | null,"created_at"?: string,"full_name"?: string,"grade"?: string | null,"id"?: string,"note"?: string | null,"status"?: Database["public"]['Enums']["participation"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "registry_students_club_id_fkey"
      columns: ["club_id"]
isOneToOne: false
      referencedRelation: "clubs"
      referencedColumns: ["id"]
    }
                  ]
                },"site_settings": {
                  Row: {
                    "about_short": string | null,"address": string | null,"anthem_url": string | null,"class_count": number | null,"club_count": number | null,"email": string | null,"emblem_url": string | null,"facebook_url": string | null,"flag_url": string | null,"founded_year": number | null,"hero_path": string | null,"hero_thumb_path": string | null,"id": number,"instagram_url": string | null,"logo_path": string | null,"map_embed_url": string | null,"phone": string | null,"require_approval": boolean,"school_name": string,"student_count": number | null,"tagline": string | null,"teacher_count": number | null,"telegram_url": string | null,"transport": string | null,"updated_at": string,"work_hours": string | null,"youtube_url": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "about_short"?: string | null,"address"?: string | null,"anthem_url"?: string | null,"class_count"?: number | null,"club_count"?: number | null,"email"?: string | null,"emblem_url"?: string | null,"facebook_url"?: string | null,"flag_url"?: string | null,"founded_year"?: number | null,"hero_path"?: string | null,"hero_thumb_path"?: string | null,"id"?: number,"instagram_url"?: string | null,"logo_path"?: string | null,"map_embed_url"?: string | null,"phone"?: string | null,"require_approval"?: boolean,"school_name"?: string,"student_count"?: number | null,"tagline"?: string | null,"teacher_count"?: number | null,"telegram_url"?: string | null,"transport"?: string | null,"updated_at"?: string,"work_hours"?: string | null,"youtube_url"?: string | null
                  }
                  Update: {
                    "about_short"?: string | null,"address"?: string | null,"anthem_url"?: string | null,"class_count"?: number | null,"club_count"?: number | null,"email"?: string | null,"emblem_url"?: string | null,"facebook_url"?: string | null,"flag_url"?: string | null,"founded_year"?: number | null,"hero_path"?: string | null,"hero_thumb_path"?: string | null,"id"?: number,"instagram_url"?: string | null,"logo_path"?: string | null,"map_embed_url"?: string | null,"phone"?: string | null,"require_approval"?: boolean,"school_name"?: string,"student_count"?: number | null,"tagline"?: string | null,"teacher_count"?: number | null,"telegram_url"?: string | null,"transport"?: string | null,"updated_at"?: string,"work_hours"?: string | null,"youtube_url"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"teachers": {
                  Row: {
                    "achievements": string | null,"bio": string | null,"category": string | null,"created_at": string,"experience_years": number | null,"full_name": string,"id": string,"photo_path": string | null,"sort_order": number,"subject": string,"thumb_path": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "achievements"?: string | null,"bio"?: string | null,"category"?: string | null,"created_at"?: string,"experience_years"?: number | null,"full_name": string,"id"?: string,"photo_path"?: string | null,"sort_order"?: number,"subject": string,"thumb_path"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "achievements"?: string | null,"bio"?: string | null,"category"?: string | null,"created_at"?: string,"experience_years"?: number | null,"full_name"?: string,"id"?: string,"photo_path"?: string | null,"sort_order"?: number,"subject"?: string,"thumb_path"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "app_role":
{ Args: Record<PropertyKey, never>; Returns: Database["public"]['Enums']["user_role"]
                           },
"can_edit_post":
{ Args: { "pid": string }; Returns: boolean
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_council_staff":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"my_council_member":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"rate_limit_hit":
{ Args: { "p_key": string,"p_max": number,"p_window": number }; Returns: boolean
                           },
"registry_stats":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"search_site":
{ Args: { "q": string }; Returns: {
              "at": string,"kind": string,"snippet": string,"title": string,"url": string
            }[]
                           },
"show_limit":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"show_trgm":
{ Args: { "": string }; Returns: (string)[]
                           },
"storage_usage":
{ Args: Record<PropertyKey, never>; Returns: Json
                           }
          }
          Enums: {
            "club_type": "ichki"|"tashqi","council_role": "maslahatchi"|"lider"|"koordinator","inquiry_status": "yangi"|"korib_chiqilmoqda"|"javob_berildi","participation": "qatnashmoqda"|"qatnashmayapti"|"kutilmoqda","post_status": "draft"|"review"|"published"|"rejected","user_role": "superadmin"|"admin"|"maslahatchi"|"koordinator"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "club_type": ["ichki", "tashqi"],"council_role": ["maslahatchi", "lider", "koordinator"],"inquiry_status": ["yangi", "korib_chiqilmoqda", "javob_berildi"],"participation": ["qatnashmoqda", "qatnashmayapti", "kutilmoqda"],"post_status": ["draft", "review", "published", "rejected"],"user_role": ["superadmin", "admin", "maslahatchi", "koordinator"]
          }
        }
} as const
