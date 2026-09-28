// ─── Time Entry Requests ───
// Note: Time tracking endpoints return DTOs directly, NOT wrapped in ApiResponse

export interface LogTimeRequest {
  projectId: string;
  taskId?: string;
  startTime: string;
  endTime: string;
  description: string;
  billable: boolean;
}

// ─── Time Entry Responses ───

export interface TimeEntryResponse {
  id: string;
  projectId: string;
  taskId?: string;
  userId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  description: string;
  billable: boolean;
}
