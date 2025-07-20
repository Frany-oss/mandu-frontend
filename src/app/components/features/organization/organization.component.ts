import { Component, OnInit } from '@angular/core';
import {
  CreateDivision,
  DvisionViewModel,
} from '../../entities/divisions.entity';
import { DivisionService } from '../../services/division.service';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
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
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';

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
    ReactiveFormsModule,
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
    NzModalModule,
    NzFormModule,
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

  // Modal properties for division
  isCreateModalVisible = false;
  createDivisionForm: FormGroup;
  isSubmitting = false;

  // Modal properties for subdivision
  isCreateSubdivisionModalVisible = false;
  createSubdivisionForm: FormGroup;
  isSubmittingSubdivision = false;
  selectedDivisionForSubdivision: DvisionViewModel | null = null;

  constructor(
    private divisionService: DivisionService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {
    this.createDivisionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      divisionSuperiorId: [null],
      embajadorNombre: [null],
      descripcion: [''],
    });

    // Inicializar el formulario de subdivisión
    this.createSubdivisionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      divisionId: [null],
      embajadorNombre: [''],
    });
  }

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

  get availableParentDivisions(): DvisionViewModel[] {
    return this.divisions.filter(
      (division) => division.id !== this.createDivisionForm.get('id')?.value
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
    const uniqueDivisions = [...new Set(this.divisions.map((d) => d.nombre))];
    this.divisionFilters = uniqueDivisions.map((name) => ({
      text: name,
      value: name,
    }));

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

  // Métodos para el modal de división
  handleModal() {
    this.isCreateModalVisible = !this.isCreateModalVisible;
    this.createDivisionForm.reset();
  }

  async handleCreateOk() {
    if (this.createDivisionForm.valid) {
      try {
        this.isSubmitting = true;
        const formValue: CreateDivision = this.createDivisionForm.value;

        const newDivision = await this.divisionService.createDivision(
          formValue
        );

        this.divisions.push(newDivision);
        this.filteredDivisions = [...this.divisions];

        this.setupFilters();

        this.isCreateModalVisible = false;
        this.createDivisionForm.reset();
        this.message.success('División creada exitosamente');
      } catch (error) {
        console.error('Error creating division:', error);
        this.message.error('Error al crear la división');
      } finally {
        this.isSubmitting = false;
      }
    } else {
      Object.values(this.createDivisionForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  // Métodos para el modal de subdivisión
  handleSubdivisionModal(division?: DvisionViewModel) {
    this.isCreateSubdivisionModalVisible =
      !this.isCreateSubdivisionModalVisible;

    if (division && this.isCreateSubdivisionModalVisible) {
      this.selectedDivisionForSubdivision = division;
      this.createSubdivisionForm.patchValue({
        divisionId: division.id,
      });
    } else {
      this.selectedDivisionForSubdivision = null;
      this.createSubdivisionForm.reset();
    }
  }

  async handleCreateSubdivisionOk() {
    if (this.createSubdivisionForm.valid && this.selectedDivisionForSubdivision) {
      try {
        this.isSubmittingSubdivision = true;

        const subdivisionData = {
          nombre: this.createSubdivisionForm.value.nombre,
          embajadorNombre: this.createSubdivisionForm.value.embajadorNombre
        };
        const divisionId = Number(this.selectedDivisionForSubdivision!.id);

        await this.divisionService.createSubdivision(subdivisionData, divisionId);

        this.divisions = await this.divisionService.getAllDivisions();
        this.filteredDivisions = [...this.divisions];
        this.setupFilters();

        this.isCreateSubdivisionModalVisible = false;
        this.createSubdivisionForm.reset();
        this.selectedDivisionForSubdivision = null;
        this.message.success('Subdivisión creada exitosamente');
      } catch (error) {
        console.error('Error creating subdivision:', error);
        this.message.error('Error al crear la subdivisión');
      } finally {
        this.isSubmittingSubdivision = false;
      }
    } else {
      Object.values(this.createSubdivisionForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  // Método para manejar click en subdivisiones
  onSubdivisionsClick(division: DvisionViewModel, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.handleSubdivisionModal(division);
  }

  isFieldError(fieldName: string): boolean {
    const field = this.createDivisionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.createDivisionForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${fieldName} es requerido`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  // Métodos para validación de subdivisión
  isSubdivisionFieldError(fieldName: string): boolean {
    const field = this.createSubdivisionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getSubdivisionFieldError(fieldName: string): string {
    const field = this.createSubdivisionForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${fieldName} es requerido`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
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
