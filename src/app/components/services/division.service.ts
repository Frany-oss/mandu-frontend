import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DvisionViewModel } from '../entities/divisions.entity';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DivisionService {
  private http = inject(HttpClient)

  constructor() { }

  // get all divisions
  async getAllDivisions() {
    return await firstValueFrom(this.http.get<DvisionViewModel[]>('http://localhost:3000/divisions'));
  }
}
