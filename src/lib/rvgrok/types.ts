export type MessageRole = "user" | "assistant";

export interface AgentStep {
  step: number;
  tool: string;
  input: Record<string, unknown>;
  result?: string;
  status: "running" | "done";
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  streaming?: boolean;
  timestamp: Date | string;
  agentSteps?: AgentStep[];
  isAgentMode?: boolean;
  /** Optional photo attachment (data URL); stripped from history storage. */
  imageDataUrl?: string;
  /** Post-answer thumbs. */
  feedback?: "up" | "down";
  /** Demo / non-xAI fallback — do not treat as catalog truth. */
  unverified?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export interface ChatRequestBody {
  messages: Array<{ role: MessageRole; content: string }>;
  agentMode?: boolean;
  feedbackContext?: string;
}

/** Agent tool chip labels/colors (AgentStepsCard). */
export const TOOL_META: Record<string, { label: string; color: string }> = {
  analyze_requirements: {
    label: "Analyzing Requirements",
    color: "#4DA6FF",
  },
  search_rv_models: {
    label: "Searching RV Models",
    color: "#9B59F5",
  },
  get_model_details: {
    label: "Fetching Model Details",
    color: "#00E676",
  },
  check_market_availability: {
    label: "Checking Market Data",
    color: "#FFD700",
  },
  search_rv_specs: {
    label: "Searching RV Specs",
    color: "#00D4FF",
  },
  search_recalls: {
    label: "Checking Recalls",
    color: "#FF6B6B",
  },
  calculate_loan: {
    label: "Running Loan Math",
    color: "#51CF66",
  },
  compare_models: {
    label: "Comparing Models",
    color: "#CC5DE8",
  },
  analyze_photo: {
    label: "Analyzing Photo",
    color: "#FF6B9D",
  },
};

/** Cloudflare Worker base — xAI bridge */
export const DEFAULT_WORKER_URL =
  "https://rv-assistant.soezrv.workers.dev";

export const HISTORY_KEY = "rvgrok_sessions_v1";
export const AGENT_MODE_KEY = "rvgrok_agent_mode";
