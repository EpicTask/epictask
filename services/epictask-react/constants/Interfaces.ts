import { Timestamp } from "@firebase/firestore";

// Task interface
interface Task {
  task_title?: string;
  name?: string;
  reward?: number;
  reward_amount?: number;
  task_id: string;
  assigned_to_ids?: string[];
  status?: string;
  task_description?: string;
  expiration_date?: string;
  timestamp?: Timestamp;
  user_id?: string;
  rewarded?: boolean;
  marked_completed?: boolean;
  due_date?: string;
  notes?: string;
}

export type { Task };
