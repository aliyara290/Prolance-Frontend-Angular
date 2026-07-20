import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../core/config/config.service';
import {
  CreateTaskDependencyRequest,
  TaskDependencyApiResponse,
  TaskDependenciesListApiResponse,
} from '../types/task.model';

@Injectable({ providedIn: 'root' })
export class TaskDependenciesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private getBaseUrl(taskId: string): string {
    return `${this.config.value.apiGatewayUrl}/tasks/api/v1/tasks/${taskId}/dependencies`;
  }

  getDependencies(taskId: string): Observable<TaskDependenciesListApiResponse> {
    return this.http.get<TaskDependenciesListApiResponse>(this.getBaseUrl(taskId));
  }

  addDependency(taskId: string, payload: CreateTaskDependencyRequest): Observable<TaskDependencyApiResponse> {
    return this.http.post<TaskDependencyApiResponse>(this.getBaseUrl(taskId), payload);
  }

  removeDependency(taskId: string, dependencyId: string): Observable<void> {
    return this.http.delete<void>(`${this.getBaseUrl(taskId)}/${dependencyId}`);
  }
}
