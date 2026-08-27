import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, Filter, Grid, List, Plus, Folder, FileText, Image, FileArchive, MoreVertical, Download, Trash2, Clock, Users } from 'lucide-angular';

@Component({
  selector: 'app-documents-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './documents-page.component.html',
})
export class DocumentsPageComponent {
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
    { id: 1, name: 'Project Alpha', count: 24, size: '1.2 GB', updatedAt: '2 days ago' },
    { id: 2, name: 'Website Redesign', count: 15, size: '42 MB', updatedAt: '1 week ago' },
    { id: 3, name: 'Mobile App V2', count: 8, size: '120 MB', updatedAt: '3 hours ago' },
    { id: 4, name: 'Internal Tools', count: 5, size: '1.4 MB', updatedAt: '5 days ago' },
    { id: 5, name: 'Marketing Q4', count: 32, size: '4.5 GB', updatedAt: '1 hour ago' },
    { id: 6, name: 'Cloud Migration', count: 12, size: '560 MB', updatedAt: '4 days ago' },
    { id: 7, name: 'Client Portal', count: 19, size: '230 MB', updatedAt: '2 weeks ago' },
    { id: 8, name: 'Security Audit', count: 4, size: '12 MB', updatedAt: '1 month ago' },
    { id: 9, name: 'Design System', count: 45, size: '890 MB', updatedAt: 'Just now' },
    { id: 10, name: 'Sales Enablement', count: 11, size: '145 MB', updatedAt: '3 days ago' }
  ];

  recentFiles = [
    { id: 1, name: 'Q3_Company_Financial_Report.pdf', type: 'pdf', icon: this.icons.fileText, size: '2.4 MB', uploader: 'Sarah Jenkins', uploadedAt: '2 hours ago', project: 'Project Alpha' },
    { id: 2, name: 'Brand_Guidelines_v3.pdf', type: 'pdf', icon: this.icons.fileText, size: '8.1 MB', uploader: 'Marcus R.', uploadedAt: '5 hours ago', project: 'Website Redesign' },
    { id: 3, name: 'Global_API_Documentation.docx', type: 'doc', icon: this.icons.fileText, size: '1.1 MB', uploader: 'Amanda Lee', uploadedAt: '1 day ago', project: 'Mobile App V2' },
    { id: 4, name: 'Marketing_Assets_Archive.zip', type: 'archive', icon: this.icons.fileArchive, size: '415.2 MB', uploader: 'Alex Chen', uploadedAt: '2 days ago', project: 'Website Redesign' },
    { id: 5, name: 'Architecture_Diagram.png', type: 'image', icon: this.icons.image, size: '4.5 MB', uploader: 'David K.', uploadedAt: '4 hours ago', project: 'Cloud Migration' },
    { id: 6, name: 'Pen_Test_Results.pdf', type: 'pdf', icon: this.icons.fileText, size: '1.8 MB', uploader: 'Sarah Jenkins', uploadedAt: '1 week ago', project: 'Security Audit' },
    { id: 7, name: 'Component_Library_Specs.zip', type: 'archive', icon: this.icons.fileArchive, size: '85.4 MB', uploader: 'Marcus R.', uploadedAt: '10 mins ago', project: 'Design System' },
    { id: 8, name: 'Q4_Campaign_Brief.docx', type: 'doc', icon: this.icons.fileText, size: '2.1 MB', uploader: 'Elena G.', uploadedAt: '2 days ago', project: 'Marketing Q4' }
  ];

  toggleView(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }
}
