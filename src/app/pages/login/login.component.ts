import { Component } from '@angular/core';
import {AuthService} from "@services/auth.service";
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  username: string = "";
  password: string = "";

  constructor(public authService: AuthService, private router: Router) {
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
        console.error("Login hatası:", err);
      }
    });
  }

}
