export type UserRole = 'client' | 'admin' | 'supervisor'
export type EstablishmentStatus = 'pending' | 'active' | 'inactive'
export type PhotoType = 'place' | 'equipment'

export interface Profile {
  id: string
  name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface EstablishmentPhoto {
  id: string
  establishment_id: string
  photo_type: PhotoType
  url: string
  created_at: string
}

export interface Establishment {
  id: string
  user_id: string
  name: string
  description: string | null
  logo_url: string | null
  contact_phone: string | null
  contact_email: string | null
  address: string
  city: string | null
  state: string | null
  zip_code: string | null
  latitude: number
  longitude: number
  status: EstablishmentStatus
  approved_by: string | null
  approved_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
  profiles?: Profile
  establishment_photos?: EstablishmentPhoto[]
}

export interface ApprovalLog {
  id: string
  establishment_id: string
  actor_id: string
  action: 'approved' | 'rejected'
  comment: string | null
  created_at: string
}
