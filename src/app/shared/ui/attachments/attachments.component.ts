import { Component, ElementRef, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AttachmentService, EntityType, AttachmentResponse } from '../../../core/services/attachment.service';
import { UserApiService } from '../../../core/auth/services/user-api.service';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError, defaultIfEmpty } from 'rxjs/operators';
import { LucideAngularModule, Paperclip, UploadCloud, X, Download, Trash2, FileText, Image as ImageIcon, FileArchive, File as FileIcon, Grid, List, MoreVertical, Loader2 } from 'lucide-angular';
import { ConfirmModalService } from '../confirm-modal/confirm-modal.service';
import { DetailsSkeletonComponent } from '../skeletons/details-skeleton/details-skeleton.component';

export interface AttachmentUIModel extends AttachmentResponse {
  uploaderName: string;
  uploaderInitials: string;
}

@Component({
  selector: 'app-attachments',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DetailsSkeletonComponent],
  templateUrl: './attachments.component.html'
})
export class AttachmentsComponent implements OnInit {
  entityType = input.required<EntityType>();
  entityId = input.required<string>();

  private readonly attachmentService = inject(AttachmentService);
  private readonly userApiService = inject(UserApiService);
  private readonly confirmService = inject(ConfirmModalService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly attachments = signal<AttachmentUIModel[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly isDragging = signal<boolean>(false);
  readonly uploadProgress = signal<number | null>(null);
  readonly isUploading = signal<boolean>(false);

  readonly viewMode = signal<'grid' | 'list'>('grid');
  
  readonly previewFile = signal<AttachmentUIModel | null>(null);
  readonly previewUrl = signal<SafeResourceUrl | null>(null);
  readonly previewLoading = signal<boolean>(false);
  private rawPreviewUrl: string | null = null;

  readonly icons = {
    paperclip: Paperclip,
    upload: UploadCloud,
    close: X,
    download: Download,
    trash: Trash2,
    text: FileText,
    image: ImageIcon,
    archive: FileArchive,
    generic: FileIcon,
    grid: Grid,
    list: List,
    more: MoreVertical,
    loader: Loader2
  };

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.loadAttachments();
  }

  loadAttachments(): void {
    this.loading.set(true);
    this.error.set(null);
    this.attachmentService.getByEntity(this.entityType(), this.entityId()).pipe(
      switchMap(res => {
        const items = res.data || [];
        if (items.length === 0) return of([]);

        const userIds = [...new Set(items.map(a => a.uploadedBy).filter(id => !!id))];
        
        if (userIds.length === 0) {
          return of(items.map(item => ({ ...item, uploaderName: 'Unknown', uploaderInitials: '?' })));
        }

        const userRequests = userIds.map(id => 
          this.userApiService.getByKeycloakUserId(id).pipe(
            map(userRes => ({ id, user: userRes.data })),
            catchError(() => of({ id, user: null }))
          )
        );

        return forkJoin(userRequests).pipe(
          defaultIfEmpty([]),
          map(usersInfo => {
            const userMap = new Map<string, any>();
            usersInfo.forEach(info => {
              if (info.user) userMap.set(info.id, info.user);
            });

            return items.map(item => {
              const user = userMap.get(item.uploadedBy);
              let uploaderName = 'Unknown';
              let uploaderInitials = '?';
              if (user) {
                uploaderName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown';
                uploaderInitials = (user.firstName ? user.firstName.charAt(0) : (user.email ? user.email.charAt(0) : '?')).toUpperCase();
              }
              return { ...item, uploaderName, uploaderInitials };
            });
          })
        );
      })
    ).subscribe({
      next: (mappedAttachments) => {
        this.attachments.set(mappedAttachments);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load attachments', err);
        this.error.set('Failed to load attachments.');
        this.loading.set(false);
      }
    });
  }

  toggleView(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  openPreview(file: AttachmentUIModel): void {
    const fileType = file.fileType || '';
    const isImage = fileType.startsWith('image/');
    const isArchive = fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar') || fileType.includes('gz');
    
    // If it's an archive, just download it directly
    if (isArchive) {
      this.onDownload(file.id, file.originalFileName);
      return;
    }

    this.previewFile.set(file);
    this.previewLoading.set(true);

    this.attachmentService.download(file.id).subscribe({
      next: (res) => {
        this.rawPreviewUrl = res.data.url;
        this.previewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPreviewUrl));
        this.previewLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load preview', err);
        alert('Failed to load preview.');
        this.closePreview();
      }
    });
  }

  closePreview(): void {
    this.previewFile.set(null);
    this.previewUrl.set(null);
    this.previewLoading.set(false);
    this.rawPreviewUrl = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(input.files);
      input.value = ''; // Reset input
    }
  }

  private handleFiles(files: FileList): void {
    // For now, handle the first file
    const file = files[0];
    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds 25MB limit.');
      return;
    }

    this.uploadFile(file);
  }

  private uploadFile(file: File): void {
    this.isUploading.set(true);
    this.uploadProgress.set(0);
    this.error.set(null);

    this.attachmentService.upload(file, this.entityType(), this.entityId()).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            const percentDone = Math.round((100 * event.loaded) / event.total);
            this.uploadProgress.set(percentDone);
          }
        } else if (event.type === HttpEventType.Response) {
          this.isUploading.set(false);
          this.uploadProgress.set(null);
          // Reload attachments
          this.loadAttachments();
        }
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.error.set(err.error?.message || 'Failed to upload file.');
        this.isUploading.set(false);
        this.uploadProgress.set(null);
      }
    });
  }

  async onDelete(id: string, name: string, event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Attachment',
      message: `Are you sure you want to delete "${name}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });

    if (confirmed) {
      this.attachmentService.delete(id).subscribe({
        next: () => {
          this.attachments.update(files => files.filter(f => f.id !== id));
        },
        error: (err) => {
          console.error('Failed to delete attachment', err);
          alert('Failed to delete attachment.');
        }
      });
    }
  }

  onDownload(id: string, name: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.attachmentService.download(id).subscribe({
      next: (res) => {
        const url = res.data.url;
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Failed to download attachment', err);
        alert('Failed to download file.');
      }
    });
  }

  getFileIcon(fileType: string): any {
    if (!fileType) return this.icons.generic;

    if (fileType.startsWith('image/')) return this.icons.image;
    if (fileType.includes('pdf') || fileType.includes('text') || fileType.includes('word')) return this.icons.text;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return this.icons.archive;

    return this.icons.generic;
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
}

