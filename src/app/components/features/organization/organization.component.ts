import { Component, OnInit } from '@angular/core';
import { DvisionViewModel } from '../../entities/divisions.entity';
import { DivisionService } from '../../services/division.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzRadioModule } from 'ng-zorro-antd/radio';

interface ColumnFilter {
  text: string;
  value: string;
  byDefault?: boolean;
}

@Component({
  selector: 'app-organization',
  imports: [
    CommonModule,
    FormsModule,
    NzTabsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzRadioModule,
    NzIconModule,
    NzDropDownModule,
    NzMenuModule,
    NzTagModule,
    NzToolTipModule,
  ],
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.scss',
})
export class OrganizationComponent implements OnInit {
  divisions: DvisionViewModel[] = [];
  filteredDivisions: DvisionViewModel[] = [];
  viewMode: 'list' | 'tree' = 'list';
  searchValue = '';
  selectedColumns: string[] = [];
  divisionFilters: ColumnFilter[] = [];
  divisionSuperiorFilters: ColumnFilter[] = [];

  constructor(private divisionService: DivisionService) {}

  async ngOnInit() {
    try {
      this.divisions = await this.divisionService.getAllDivisions();
      this.filteredDivisions = [...this.divisions];
      this.setupFilters();
    } catch (error) {
      console.error('Error loading divisions:', error);
    }
  }

  get totalColaboradores(): number {
    return this.divisions.reduce(
      (total, division) => total + division.cantidadColaboradores,
      0
    );
  }

  setViewMode(mode: 'list' | 'tree') {
    this.viewMode = mode;
  }

  onSearch() {
    if (!this.searchValue) {
      this.filteredDivisions = [...this.divisions];
    } else {
      this.filteredDivisions = this.divisions.filter(
        (division) =>
          division.nombre
            .toLowerCase()
            .includes(this.searchValue.toLowerCase()) ||
          (division.divisionSuperiorNombre?.toLowerCase() || '').includes(
            this.searchValue.toLowerCase()
          ) ||
          (division.embajadorNombre?.toLowerCase() || '').includes(
            this.searchValue.toLowerCase()
          )
      );
    }
  }

  setupFilters() {
    // Setup division filters
    const uniqueDivisions = [...new Set(this.divisions.map((d) => d.nombre))];
    this.divisionFilters = uniqueDivisions.map((name) => ({
      text: name,
      value: name,
    }));

    // Setup division superior filters
    const uniqueDivisionSuperior = [
      ...new Set(
        this.divisions
          .map((d) => d.divisionSuperiorNombre)
          .filter((name) => name !== null && name !== undefined)
      ),
    ];
    this.divisionSuperiorFilters = uniqueDivisionSuperior.map((name) => ({
      text: name!,
      value: name!,
    }));
  }

  onDivisionFilterChange(selectedValues: string[]) {
    if (selectedValues.length === 0) {
      this.filteredDivisions = [...this.divisions];
    } else {
      this.filteredDivisions = this.divisions.filter((division) =>
        selectedValues.includes(division.nombre)
      );
    }
  }

  onDivisionSuperiorFilterChange(selectedValues: string[]) {
    if (selectedValues.length === 0) {
      this.filteredDivisions = [...this.divisions];
    } else {
      this.filteredDivisions = this.divisions.filter(
        (division) =>
          division.divisionSuperiorNombre &&
          selectedValues.includes(division.divisionSuperiorNombre)
      );
    }
  }

  // Sort functions
  sortByDivision = (a: DvisionViewModel, b: DvisionViewModel) =>
    a.nombre.localeCompare(b.nombre);
  sortByDivisionSuperior = (a: DvisionViewModel, b: DvisionViewModel) =>
    (a.divisionSuperiorNombre || '').localeCompare(
      b.divisionSuperiorNombre || ''
    );
  sortByColaboradores = (a: DvisionViewModel, b: DvisionViewModel) =>
    a.cantidadColaboradores - b.cantidadColaboradores;
  sortByNivel = (a: DvisionViewModel, b: DvisionViewModel) => a.nivel - b.nivel;
  sortBySubdivisiones = (a: DvisionViewModel, b: DvisionViewModel) =>
    (a.cantidadSubdivisiones || 0) - (b.cantidadSubdivisiones || 0);
}
