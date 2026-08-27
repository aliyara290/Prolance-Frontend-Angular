import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../config/config.service';

  export type EntityType = 'TASK' | 'PROJECT' | 'CRM';

export interface AttachmentResponse {
  id: string;
  originalFileName: string;
  fileType: string;
  size: number;
  entityType: EntityType;
  entityId: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface AttachmentListResponse {
  success: boolean;
  data: AttachmentResponse[];
}

export interface AttachmentSingleResponse {
  success: boolean;
  data: AttachmentResponse;
}

export interface PresignedUrlResponse {
  success: boolean;
  data: {
    url: string;
    objectKey: string;
    expiresAt: string;
    meta: any;
    timestamp: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private get apiUrl(): string {
    return `${this.config.value.apiGatewayUrl}/attachments/api/v1/attachments`;
  }

  upload(file: File, entityType: EntityType, entityId: string): Observable<HttpEvent<AttachmentSingleResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);

    const req = new HttpRequest('POST', `${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request<AttachmentSingleResponse>(req);
  }

  getByEntity(entityType: EntityType, entityId: string): Observable<AttachmentListResponse> {
    return this.http.get<AttachmentListResponse>(`${this.apiUrl}/entity/${entityType}/${entityId}`);
  }

  delete(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`);
  }

  download(id: string): Observable<PresignedUrlResponse> {
    return this.http.get<PresignedUrlResponse>(`${this.apiUrl}/${id}/download`);
  }
}

