import axios from "axios";
import MicroserviceUrls from "@/constants/Microservices";
import authService from "./authService";

// Create API client for Adaptive Narrative Engine
const narrativeApiClient = axios.create({
  baseURL: MicroserviceUrls.narrativeEngine,
});

// Add auth interceptor
narrativeApiClient.interceptors.request.use(
  async (config) => {
    const token = await authService.refreshToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface Story {
  id: string;
  title: string;
  description: string;
  min_age: number;
  max_age: number;
  tags: string[];
  estimated_duration_minutes: number;
  total_xp: number;
  total_nodes: number;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Node {
  id: string;
  story_id: string;
  prompt: string;
  options: NodeOption[];
  node_type: "choice" | "completion" | "checkpoint";
  xp_reward: number;
  payout_eligible: boolean;
  payout_amount?: number;
  age_variants?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface NodeOption {
  id: string;
  text: string;
  next_node_id: string | null;
  is_correct?: boolean;
}

export interface StoryProgress {
  id: string;
  user_id: string;
  story_id: string;
  current_node_id: string;
  completed_node_ids: string[];
  total_xp_earned: number;
  status: "in_progress" | "completed" | "abandoned";
  started_at: string;
  completed_at?: string;
  last_activity_at: string;
}

export interface AdvanceProgressRequest {
  user_id: string;
  story_id: string;
  current_node_id: string;
  selected_option_id: string;
}

export interface AdvanceProgressResponse {
  next_node: Node;
  xp_earned: number;
  payout_earned?: number;
  story_completed: boolean;
  progress: StoryProgress;
}

export interface PayoutRequest {
  user_id: string;
  story_id: string;
  node_id: string;
  amount: number;
}

export interface PayoutResponse {
  request_id: string;
  status: "pending" | "approved" | "rejected" | "completed";
  message: string;
}

// Parent-specific types
export interface ParentNarrativeSettings {
  kid_id: string;
  payouts_enabled: boolean;
  parent_wallet_address?: string;
  daily_payout_limit: number;
  max_payouts_per_day: number;
  require_manual_approval: boolean;
  allowed_topics: string[];
  blocked_topics: string[];
  min_age_content?: number;
  max_age_content?: number;
  notification_on_progress: boolean;
  notification_on_payout: boolean;
  updated_at?: string;
  updated_by?: string;
}

export interface KidProgressSummary {
  kid_id: string;
  kid_name?: string;
  stories_started: number;
  stories_completed: number;
  total_xp_earned: number;
  total_payouts: number;
  total_payout_amount: number;
  last_activity_at?: string;
  current_stories: Array<{
    story_id: string;
    title: string;
    progress: number;
    total: number;
  }>;
}

export interface KidNarrativeProgress {
  progress_id: string;
  user_id: string;
  story_id: string;
  story_title?: string;
  story_description?: string;
  story_tags?: string[];
  current_node: string;
  completed_nodes: string[];
  total_xp: number;
  completion_percent: number;
  status: string;
  last_updated: string;
}

export interface PendingPayout {
  request_id: string;
  user_id: string;
  kid_name?: string;
  wallet_address: string;
  token: string;
  amount: number;
  reason: string;
  story_id?: string;
  node_id?: string;
  created_at: string;
  status: string;
}

export interface PayoutApprovalResponse {
  request_id: string;
  status: string;
  message: string;
  transaction_hash?: string;
}

export interface NarrativeAnalytics {
  period_days: number;
  total_xp_earned: number;
  stories_completed: number;
  nodes_completed: number;
  xp_per_day: number;
  total_payouts: number;
  total_earned: number;
  topic_preferences: Record<string, number>;
  daily_activity: Record<string, number>;
  engagement_score: number;
}

export const narrativeService = {
  // Get all available stories for a user
  getStories: async (userId: string, age?: number): Promise<Story[]> => {
    try {
      const params = new URLSearchParams({ user_id: userId });
      if (age) {
        params.append("age", age.toString());
      }
      const response = await narrativeApiClient.get(`/stories?${params}`);
      return response.data.stories || response.data;
    } catch (error) {
      console.error("Get stories error:", error);
      throw new Error("Failed to get stories");
    }
  },

  // Get a specific story by ID
  getStory: async (storyId: string): Promise<Story> => {
    try {
      const response = await narrativeApiClient.get(`/stories/${storyId}`);
      return response.data;
    } catch (error) {
      console.error("Get story error:", error);
      throw new Error("Failed to get story");
    }
  },

  // Get a specific node
  getNode: async (storyId: string, nodeId: string): Promise<Node> => {
    try {
      const response = await narrativeApiClient.get(
        `/stories/${storyId}/nodes/${nodeId}`
      );
      return response.data;
    } catch (error) {
      console.error("Get node error:", error);
      throw new Error("Failed to get node");
    }
  },

  // Get user's story progress
  getProgress: async (
    userId: string,
    storyId?: string
  ): Promise<StoryProgress[]> => {
    try {
      const params = new URLSearchParams({ user_id: userId });
      if (storyId) {
        params.append("story_id", storyId);
      }
      const response = await narrativeApiClient.get(`/progress?${params}`);
      return response.data.progress || response.data;
    } catch (error) {
      console.error("Get progress error:", error);
      throw new Error("Failed to get progress");
    }
  },

  // Start a new story
  startStory: async (
    userId: string,
    storyId: string
  ): Promise<{ node: Node; progress: StoryProgress }> => {
    try {
      const response = await narrativeApiClient.post("/progress/start", {
        user_id: userId,
        story_id: storyId,
      });
      return response.data;
    } catch (error) {
      console.error("Start story error:", error);
      throw new Error("Failed to start story");
    }
  },

  // Advance progress (make a choice)
  advanceProgress: async (
    data: AdvanceProgressRequest
  ): Promise<AdvanceProgressResponse> => {
    try {
      const response = await narrativeApiClient.post("/progress/advance", data);
      return response.data;
    } catch (error) {
      console.error("Advance progress error:", error);
      throw new Error("Failed to advance progress");
    }
  },

  // Request a payout
  requestPayout: async (data: PayoutRequest): Promise<PayoutResponse> => {
    try {
      const response = await narrativeApiClient.post("/payouts/request", data);
      return response.data;
    } catch (error) {
      console.error("Request payout error:", error);
      throw new Error("Failed to request payout");
    }
  },

  // Get payout status
  getPayoutStatus: async (requestId: string): Promise<PayoutResponse> => {
    try {
      const response = await narrativeApiClient.get(`/payouts/${requestId}`);
      return response.data;
    } catch (error) {
      console.error("Get payout status error:", error);
      throw new Error("Failed to get payout status");
    }
  },

  // Parent Methods

  // Get narrative progress for a specific kid
  getKidNarrativeProgress: async (
    kidId: string
  ): Promise<KidNarrativeProgress[]> => {
    try {
      const response = await narrativeApiClient.get(
        `/parent/kids/${kidId}/progress`
      );
      return response.data;
    } catch (error) {
      console.error("Get kid narrative progress error:", error);
      throw new Error("Failed to get kid narrative progress");
    }
  },

  // Get progress summary for all linked kids
  getAllKidsProgressSummary: async (): Promise<KidProgressSummary[]> => {
    try {
      const response = await narrativeApiClient.get(
        "/parent/kids/progress/summary"
      );
      return response.data;
    } catch (error) {
      console.error("Get all kids progress summary error:", error);
      throw new Error("Failed to get kids progress summary");
    }
  },

  // Get pending payout requests
  getPendingPayouts: async (kidId?: string): Promise<PendingPayout[]> => {
    try {
      const params = kidId ? { kid_id: kidId } : {};
      const response = await narrativeApiClient.get("/parent/payouts/pending", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Get pending payouts error:", error);
      throw new Error("Failed to get pending payouts");
    }
  },

  // Approve a payout request
  approvePayout: async (
    requestId: string
  ): Promise<PayoutApprovalResponse> => {
    try {
      const response = await narrativeApiClient.post(
        `/parent/payouts/${requestId}/approve`
      );
      return response.data;
    } catch (error) {
      console.error("Approve payout error:", error);
      throw new Error("Failed to approve payout");
    }
  },

  // Reject a payout request
  rejectPayout: async (
    requestId: string,
    reason?: string
  ): Promise<PayoutApprovalResponse> => {
    try {
      const response = await narrativeApiClient.post(
        `/parent/payouts/${requestId}/reject`,
        { reason }
      );
      return response.data;
    } catch (error) {
      console.error("Reject payout error:", error);
      throw new Error("Failed to reject payout");
    }
  },

  // Get narrative settings for a kid
  getNarrativeSettings: async (
    kidId: string
  ): Promise<ParentNarrativeSettings> => {
    try {
      const response = await narrativeApiClient.get(
        `/parent/settings/${kidId}`
      );
      return response.data;
    } catch (error) {
      console.error("Get narrative settings error:", error);
      throw new Error("Failed to get narrative settings");
    }
  },

  // Update narrative settings for a kid
  updateNarrativeSettings: async (
    kidId: string,
    settings: ParentNarrativeSettings
  ): Promise<ParentNarrativeSettings> => {
    try {
      const response = await narrativeApiClient.put(
        `/parent/settings/${kidId}`,
        settings
      );
      return response.data;
    } catch (error) {
      console.error("Update narrative settings error:", error);
      throw new Error("Failed to update narrative settings");
    }
  },

  // Get narrative analytics for a kid
  getNarrativeAnalytics: async (
    kidId: string,
    days: number = 30
  ): Promise<NarrativeAnalytics> => {
    try {
      const response = await narrativeApiClient.get(
        `/parent/analytics/${kidId}`,
        {
          params: { days },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Get narrative analytics error:", error);
      throw new Error("Failed to get narrative analytics");
    }
  },
};

export default narrativeService;
