import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../core/config/config.service';
import {
  CreateTaskCommentRequest,
  UpdateTaskCommentRequest,
  TaskCommentApiResponse,
  TaskCommentsListApiResponse,
} from '../types/task.model';

@Injectable({ providedIn: 'root' })
export class TaskCommentsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private getBaseUrl(taskId: string): string {
    return `${this.config.value.apiGatewayUrl}/tasks/api/v1/tasks/${taskId}/comments`;
  }

  getComments(taskId: string): Observable<TaskCommentsListApiResponse> {
    return this.http.get<TaskCommentsListApiResponse>(this.getBaseUrl(taskId));
  }

  addComment(taskId: string, payload: CreateTaskCommentRequest): Observable<TaskCommentApiResponse> {
    return this.http.post<TaskCommentApiResponse>(this.getBaseUrl(taskId), payload);
  }

  editComment(
    taskId: string,
    commentId: string,
    payload: UpdateTaskCommentRequest
  ): Observable<TaskCommentApiResponse> {
    return this.http.put<TaskCommentApiResponse>(`${this.getBaseUrl(taskId)}/${commentId}`, payload);
  }

  removeComment(taskId: string, commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.getBaseUrl(taskId)}/${commentId}`);
  }
}
