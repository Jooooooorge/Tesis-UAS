export interface Proyecto {
  id: number;
  titulo: string;
  etapa: string;
  estado: string;
  estadoTipo: 'revision' | 'correcciones' | 'aprobado';
  progreso: number;
  director: string;
  directorIniciales: string;
  codirector: string;
  codirectorIniciales: string;
  ultimaActualizacion: string;
}
