import { Component } from '@angular/core';
import {AuthService} from "@services/auth.service";
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {ToastService} from "@services/toast.service";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardTitle,
    MatFormField,
    MatInput,
    MatButton,
    MatLabel
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  username: string = "";
  password: string = "";

  constructor(public authService: AuthService, private router: Router, public toastService: ToastService) {
  }

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        const userData = {
          user: {
            ...res.user,
            token: res.token
          }
        };
        this.authService.saveUserToLS(userData);
        this.router.navigate(['/order']);
      },
      error: (err) => {
        this.toastService.error("Giriş Yapılamadı")
        console.error("Login hatası:", err);
      }
    });
  }

}
