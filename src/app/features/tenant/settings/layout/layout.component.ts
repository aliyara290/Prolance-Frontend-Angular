import { Component } from '@angular/core';
import {HeaderComponent} from '../../../../core/layout/components/header/header.component';
import {RouterOutlet} from '@angular/router';
import {SidebarComponent} from '../../../../core/layout/components/sidebar/sidebar.component';
import {SettingsSidebarComponent} from './component/settings-sidebar/settings-sidebar.component';

@Component({
  selector: 'app-layout',
  imports: [
    HeaderComponent,
    RouterOutlet,
    SettingsSidebarComponent
  ],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {

}
