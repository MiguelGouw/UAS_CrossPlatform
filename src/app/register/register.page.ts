import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  validationForm: FormGroup;
  user_id: string;

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UsersService
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.validationForm = this.formBuilder.group({
      firstName: new FormControl(null, Validators.compose([
        Validators.required
      ])),
      lastName: new FormControl(null, Validators.compose([
        Validators.required
      ])),
      email: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl(null, Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
      Cpassword: new FormControl(null, Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
    }, { validator: this.matchingPasswords('password', 'Cpassword') });
  }

  matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (group: FormGroup): { [key: string]: any } => {
      let password = group.controls[passwordKey];
      let Cpassword = group.controls[confirmPasswordKey];

      if (password.value !== Cpassword.value) {
        return {
          mismatchedPasswords: true
        };
      }
    }
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Create a new Account...',
      duration: 2000,
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }

  createUser() {
    this.validationForm.value.password = null;
    this.validationForm.value.Cpassword = null;
    this.userService.create(this.user_id, this.validationForm.value);
    this.router.navigateByUrl('/login');
    this.presentToast("Pendaftaran berhasil, Mantap! login cuss", "success");
  }

  Register() {
    if (this.validationForm.valid) {
      this.presentLoading().then(() => {
        this.authService.registerUser(this.validationForm.value)
          .then(res => {
            this.user_id = res.user.uid;
            this.createUser();
          }, err => {
            console.log(err);
            this.presentToast("Email udah ada yang make, pake email lain!!", "warning");
          });
      });
    }
  }
}