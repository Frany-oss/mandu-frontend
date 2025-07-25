import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateDivision, DvisionViewModel } from '../entities/divisions.entity';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateSubdivision } from '../entities/subdivisions.entity';

@Injectable({
  providedIn: 'root',
})
export class DivisionService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  constructor() {}

  async getAllDivisions() {
    return await firstValueFrom(
      this.http.get<DvisionViewModel[]>(`${this.apiUrl}/divisions`)
    );
  }

  async createDivision(division: CreateDivision) {
    return await firstValueFrom(
      this.http.post<DvisionViewModel>(`${this.apiUrl}/divisions`, division)
    );
  }

  async createSubdivision(subdivision: CreateSubdivision, divisionId: number) {
    return await firstValueFrom(this.http.post<void>(`${this.apiUrl}/subdivisions/division/${divisionId}`, subdivision))
  }
}
