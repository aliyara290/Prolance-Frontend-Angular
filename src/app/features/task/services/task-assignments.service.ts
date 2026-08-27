import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../core/config/config.service';
import {
  CreateTaskAssignmentRequest,
  UpdateTaskAssignmentRequest,
  TaskAssignmentApiResponse,
  TaskAssignmentsListApiResponse,
} from '../types/task.model';

@Injectable({ providedIn: 'root' })
export class TaskAssignmentsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private getBaseUrl(taskId: string): string {
    return `${this.config.value.apiGatewayUrl}/tasks/api/v1/tasks/${taskId}/assignments`;
  }

  getAssignments(taskId: string): Observable<TaskAssignmentsListApiResponse> {
    return this.http.get<TaskAssignmentsListApiResponse>(this.getBaseUrl(taskId));
  }

  assignUser(taskId: string, payload: CreateTaskAssignmentRequest): Observable<TaskAssignmentApiResponse> {
    return this.http.post<TaskAssignmentApiResponse>(this.getBaseUrl(taskId), payload);
  }

  updateAssignment(
    taskId: string,
    userId: string,
    payload: UpdateTaskAssignmentRequest
  ): Observable<TaskAssignmentApiResponse> {
    return this.http.put<TaskAssignmentApiResponse>(`${this.getBaseUrl(taskId)}/${userId}`, payload);
  }

  unassignUser(taskId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.getBaseUrl(taskId)}/${userId}`);
  }
}
