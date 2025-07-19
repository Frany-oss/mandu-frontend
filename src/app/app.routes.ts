import { Routes } from '@angular/router';
import { OrganizationComponent } from './components/features/organization/organization.component';

export const routes: Routes = [
    { path: '', redirectTo: '/organization', pathMatch: 'full' },
    { path: 'organization', component: OrganizationComponent}
];
