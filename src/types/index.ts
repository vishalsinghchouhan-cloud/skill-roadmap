export interface RoadmapNode {
  id: string;
  title: string;
  description?: string;
  children: RoadmapNode[];
  optional?: boolean;
  choices?: string[];
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  children: RoadmapNode[];
  created_at: string;
  user_id?: string;
}

export interface Resource {
  title: string;
  url: string;
  type: string;
}

export interface NodeResources {
  summary: string;
  theoretical: Resource[];
  practical: Resource[];
  practice: Resource[];
}

export interface UserProgress {
  id: string;
  user_id: string;
  node_id: string;
  skill_slug: string;
  completed: boolean;
  completed_at: string | null;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  criteria: {
    type: "node_count" | "skill_complete" | "streak";
    threshold: number;
  };
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  icon: string;
  category: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  xp: number;
  created_at: string;
}
