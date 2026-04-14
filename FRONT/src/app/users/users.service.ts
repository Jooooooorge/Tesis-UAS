import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

const API = 'http://localhost:3000';

export interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  carrera: string | null;
  matricula: string | null;
  telefono: string | null;
  bio: string | null;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getProfile() {
    return this.http.get<UserProfile>(`${API}/users/me`, { headers: this.headers() });
  }

  updateProfile(data: Partial<UserProfile>) {
    return this.http.patch<UserProfile>(`${API}/users/me`, data, { headers: this.headers() });
  }
}
