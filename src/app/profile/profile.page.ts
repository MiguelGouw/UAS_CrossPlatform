import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Capacitor, Camera, CameraResultType, CameraSource } from '@capacitor/core';
import { AlertController, ActionSheetController, LoadingController, Platform } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  private idUser: string;
  private Datauser: any;
  private userLocations: any[] = [];
  private isDesktop: boolean;
  private downloadURL: any;
  private imageFile: any;
  private base64Image: any;
  private boolCamera: boolean = null;
  private photo: SafeResourceUrl;
  @ViewChild('filePicker', { static: false }) filePickerRef: ElementRef<HTMLInputElement>;

  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private db: AngularFireDatabase,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private router: Router,
    private platform: Platform,
    private sanitizer: DomSanitizer,
    private storage: AngularFireStorage
  ) { }

  ngOnInit() {
    if((this.platform.is('mobile') && this.platform.is('hybrid')) || this.platform.is('desktop')){
      this.isDesktop = true;
    }

    this.getIdUser();
  }

  getIdUser(){
    this.authService.userDetails().subscribe(res => {
      if(res !== null){
        this.idUser = res.uid;
        this.getUserData();
      }
    }, err => {
      console.log(err);
    })
  }

  getUserData(){
    this.db.object('/user/' + this.idUser).valueChanges().subscribe(data => {
      this.Datauser = data;
      if(this.Datauser.foto){
        this.photo = this.Datauser.foto;
      }
      if(this.Datauser.locations){
        this.userLocations = this.Datauser.locations;
        this.userLocations.reverse();
      }
    })
  }

  async getPicture(type: string){
    if(!Capacitor.isPluginAvailable('Camera') || (this.isDesktop && type === 'gallery')){
      this.filePickerRef.nativeElement.click();
      return;
    }

    const image = await Camera.getPhoto({
      quality: 100,
      width: 500,
      height: 500,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt
    });

    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && ("data:image/png;base64," + image.base64String));
    this.boolCamera = true;
    this.base64Image = image.base64String;

    this.uploadImage();
  }

  onFileChoose(event){
    const file = event.target.files[0];
    const pattern = /image-*/;
    const reader = new FileReader();

    if(!file.type.match(pattern)){
      console.log('File format not supported');
      this.imageFile = null;
      return;
    }

    reader.onload = () => {
      this.photo = reader.result.toString();
    }
    reader.readAsDataURL(file);
    this.boolCamera = false;
    this.imageFile = file;

    this.uploadImage();
  }

  async presentFotoActionSheet(){
    const actionSheet = await this.actionSheetCtrl.create({
      animated: true,
      mode: 'ios',
      buttons: [
      {
        text: 'Camera',
        icon: 'camera-outline',
        handler: () => {
          this.getPicture('camera');
        }
      },
      {
        text: 'Gallery',
        icon: 'image-outline',
        handler: () => {
          this.getPicture('gallery');
        }
      }]
    });

    await actionSheet.present();
  }

  async presentAlert(idxItem){
    const alert = await this.alertCtrl.create({
      header: 'Apakah Anda Yakin?',
      message: 'Apakah Anda ingin menghapus history lokasi ini?',
      buttons:[
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Hapus',
          handler: () => this.deleteLocationHistory(idxItem)
        }
      ]
    });
    await alert.present();
  }


  async presentLoading(){
    const loading = await this.loadingCtrl.create({
        message: "Memperbaharui profile picture...",
        duration: 2000
    });
    await loading.present();

    const {role, data} = await loading.onDidDismiss();
    console.log("Loading dismissed!");
  }

  uploadImage(){
    this.presentLoading().then(() =>{
      var n = Date.now();
      const filePath = `Profil/${n}`;
      const fileRef = this.storage.ref(filePath);
      var task;
      if(this.boolCamera){
        task = fileRef.putString(this.base64Image, 'base64', { contentType: 'image/png' });
      }
      else{
        task = this.storage.upload(`Profil/${n}`, this.imageFile);
      }
      task.snapshotChanges()
          .pipe(
            finalize(() => {
              fileRef.getDownloadURL().subscribe(url => {
                if (url) {
                  this.downloadURL = url;
                  this.Datauser.foto = this.downloadURL;
                  this.userService.update(this.idUser, this.Datauser);
                }
              });
            })
          ).subscribe();
    });
  }

  imageLoaded(){
    setTimeout(function() {
      var profileWidth = document.getElementById('profilePicture').offsetWidth;
      document.getElementById('profilePicture').style.height = profileWidth + "px";
    }, 10)
  }

  onLogout(){
    this.authService.logoutUser()
      .then(res => {
          console.log(res);
          this.router.navigateByUrl('/login');
        }).catch(error => {
          console.log(error);
      });
  }

  deleteLocationHistory(idxItem){
    if (idxItem > -1) {
      this.userLocations.splice(idxItem, 1);
      this.Datauser.locations = this.userLocations;
      this.userService.update(this.idUser, this.Datauser);
    }
  }

  onPress(idxItem) {
    this.presentAlert(idxItem);
  }


}
