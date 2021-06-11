import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntryListComponent } from './entry-list/entry-list.component';

const routes: Routes = [
  {
    path: '', component: EntryListComponent,
  },
  {
    path: 'new', component: EntryListComponent
  },
  {
    path: ':id', component: EntryListComponent
  },
  {
    path: ':id/edit', component: EntryListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntriesRoutingModule { }
