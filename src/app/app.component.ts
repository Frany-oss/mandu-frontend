import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DivisionService } from './components/services/division.service';
import { DvisionViewModel } from './components/entities/divisions.entity';
import { LayoutComponent } from "./components/features/layout/layout.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [LayoutComponent]
})
export class AppComponent {

}