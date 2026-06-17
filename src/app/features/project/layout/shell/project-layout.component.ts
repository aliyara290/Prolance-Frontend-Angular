import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../../core/layout/components/header/header.component';
import { ProjectSidebarComponent } from '../components/project-sidebar/project-sidebar.component';

@Component({
  selector: 'app-project-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ProjectSidebarComponent],
  templateUrl: './project-layout.component.html',
})
export class ProjectLayoutComponent {}
