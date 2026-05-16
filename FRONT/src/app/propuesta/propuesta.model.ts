export interface User {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: 'Estudiante' | 'Docente';
  carrera?: string;
  matricula?: string;
  telefono?: string;
  bio?: string;
}

export interface Propuesta {
  id_propuesta: number;
  titulo: string;
  descripcion: string;
  tipo: 'Busco Director' | 'Busco Estudiante';
  tecnologias?: string[];
  created_at: string;
  updated_at?: string;
  creador: { id_usuario: number; nombre: string; email: string };
  postulaciones?: Postulacion[];
  cantidad_postulaciones?: number;
}

export interface Postulacion {
  id_postulacion: number;
  id_propuesta: number;
  id_usuario: number;
  mensaje?: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  created_at: string;
  updated_at?: string;
  propuesta?: {
    titulo: string;
    tipo: string;
    creador: { id_usuario: number; nombre: string; email: string };
  };
  users?: { id_usuario: number; nombre: string; email: string; rol: string };
}