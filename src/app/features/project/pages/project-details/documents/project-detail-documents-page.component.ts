import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectDetailService } from '../../../services/project-detail.service';
import { LucideAngularModule, Search, Filter, Grid, List, Plus, Folder, FileText, Image, FileArchive, MoreVertical, Download, Trash2, Clock, Users } from 'lucide-angular';

@Component({
  selector: 'app-project-detail-documents-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './project-detail-documents-page.component.html',
})
export class ProjectDetailDocumentsPageComponent {
  readonly detailService = inject(ProjectDetailService);

  readonly icons = {
    search: Search,
    filter: Filter,
    grid: Grid,
    list: List,
    plus: Plus,
    folder: Folder,
    fileText: FileText,
    image: Image,
    fileArchive: FileArchive,
    more: MoreVertical,
    download: Download,
    trash: Trash2,
    clock: Clock,
    users: Users
  };

  viewMode: 'grid' | 'list' = 'grid';

  folders = [
    { id: 1, name: 'Design Assets', count: 24, size: '1.2 GB', updatedAt: '2 days ago' },
    { id: 2, name: 'Contracts & Legal', count: 5, size: '12 MB', updatedAt: '1 week ago' },
    { id: 3, name: 'Client Feedback', count: 12, size: '45 MB', updatedAt: '3 hours ago' },
    { id: 4, name: 'Technical Specs', count: 8, size: '2.4 MB', updatedAt: '5 days ago' },
    { id: 4, name: 'Requirements', count: 2, size: '2.6 MB', updatedAt: '6 days ago' },
  ];

  recentFiles = [

    { id: 2, name: 'Hero_Section_Mockup.png', type: 'image', icon: this.icons.image, size: '5.1 MB', uploader: 'Marcus R.', uploadedAt: '5 hours ago' },
    { id: 1, name: 'Q3_Financial_Report.pdf', type: 'pdf', icon: this.icons.fileText, size: '2.4 MB', uploader: 'Sarah Jenkins', uploadedAt: '2 hours ago' },
    { id: 4, name: 'Frontend_Assets.zip', type: 'archive', icon: this.icons.fileArchive, size: '45.2 MB', uploader: 'Alex Chen', uploadedAt: '2 days ago' },
    { id: 4, name: 'Frontend_Assets.zip', type: 'archive', icon: this.icons.fileArchive, size: '45.2 MB', uploader: 'Alex Chen', uploadedAt: '2 days ago' },
    { id: 3, name: 'API_Documentation_v2.docx', type: 'doc', icon: this.icons.fileText, size: '1.1 MB', uploader: 'Amanda Lee', uploadedAt: '1 day ago' },
    { id: 1, name: 'Q3_Financial_Report.pdf', type: 'pdf', icon: this.icons.fileText, size: '2.4 MB', uploader: 'Sarah Jenkins', uploadedAt: '2 hours ago' },
    { id: 3, name: 'API_Documentation_v2.docx', type: 'doc', icon: this.icons.fileText, size: '1.1 MB', uploader: 'Amanda Lee', uploadedAt: '1 day ago' },
    { id: 2, name: 'Hero_Section_Mockup.png', type: 'image', icon: this.icons.image, size: '5.1 MB', uploader: 'Marcus R.', uploadedAt: '5 hours ago' },
  ];

  toggleView(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }
}
