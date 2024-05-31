import { Routes } from '@angular/router';
import { BuilderComponent } from './builder/builder.component';

export const routes: Routes = [
    {path : ":build", component : BuilderComponent },
    {path : "", component : BuilderComponent }
];
