export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export interface UserProfile extends User {
  createdAt: string
  lastLogin: string
}
