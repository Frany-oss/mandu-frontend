export interface DvisionViewModel {
  id: number;
  nombre: string;
  nivel: number;
  cantidadColaboradores: number;
  divisionSuperiorId?: number | null;
  embajadorNombre?: string;
  divisionSuperiorNombre?: string | null;
  cantidadSubdivisiones?: number;
}
