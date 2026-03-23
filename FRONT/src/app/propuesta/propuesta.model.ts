export interface Propuesta {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: 'Busco Director' | 'Busco Estudiante';
  tecnologias: string[];
  autor: string;
  iniciales: string;
  tiempoPublicacion: string;
  creadorId: number;
}
