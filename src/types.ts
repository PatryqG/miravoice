export type Page =
  | "home"
  | "videos"
  | "actors"
  | "history"
  | "lore"
  | "community"
  | "about"
  | "studio"
  | "profile"
  | "admin"
  | "security";

export type VideoCategory = "Odcinki" | "Analizy" | "Fan film" | "Kulisy" | "Lore";

export interface Video {
  id: string;
  title: string;
  category: VideoCategory;
  duration: string;
  views: number;
  likes: number;
  date: string;
  thumbnail: string;
  channelId: string;
  channelName: string;
  description: string;
  videoUrl?: string;
  official?: boolean;
  episode?: string;
}

export interface Actor {
  id: string;
  name: string;
  role: string;
  character: string;
  bio: string;
  image: string;
  tags: string[];
  city: string;
  socials?: { label: string; url: string }[];
}

export interface LoreEntry {
  id: string;
  name: string;
  category: "Bohaterowie" | "Kwami" | "Moce" | "Artefakty";
  kwami: string;
  power: string;
  holder: string;
  description: string;
  quote: string;
  color: string;
  accent: string;
  glyph: string;
  first: string;
  danger?: 1 | 2 | 3 | 4 | 5;
}

export interface TimelineEvent {
  id: string;
  year: string;
  era: string;
  title: string;
  description: string;
  accent?: boolean;
}

export interface Channel {
  id: string;
  ownerId: string;
  name: string;
  handle: string;
  description: string;
  avatar: string;
  cover: string;
  subscribers: number;
  verified?: boolean;
  category: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  provider: "google" | "email";
  channelId?: string;
}

export interface ChannelSubscription {
  notifications: boolean;
  since: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: "video" | "sub" | "lore" | "system";
  target?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  body: string;
  date: string;
}

export interface Appearance {
  siteName: string;
  tagline: string;
  brand: string;
  brand2: string;
  accent: string;
  accentInk: string;
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  line: string;
  radius: number;
  headingFont: "Bricolage Grotesque" | "Space Grotesk" | "Permanent Marker";
  mode: "jasny" | "kremowy" | "ciemny";
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroImage: string;
  heroPrimaryCta: string;
  graffiti: boolean;
  announcement: string;
}

export interface SiteContent {
  appearance: Appearance;
  videos: Video[];
  actors: Actor[];
  lore: LoreEntry[];
  history: TimelineEvent[];
  channels: Channel[];
  aboutTitle: string;
  aboutBody: string;
  mission: string;
  email: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  at: string;
}

export interface PersistedState {
  version: number;
  content: SiteContent;
  users: User[];
  currentUserId: string | null;
  subscriptions: Record<string, ChannelSubscription>;
  savedVideos: string[];
  likedVideos: string[];
  notifications: AppNotification[];
  comments: Record<string, Comment[]>;
  followingUsers: string[];
  audit: AuditEntry[];
}

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}
