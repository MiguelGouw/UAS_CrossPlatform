import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-tambahteman',
  templateUrl: './tambahteman.page.html',
  styleUrls: ['./tambahteman.page.scss'],
})
export class TambahtemanPage implements OnInit {
  private searchValue: string;
  private idUser: string;
  private Datauser: any;
  private usersData: any;
  private userFriends: any[] = [];
  private searchedUserData: any;
  private boolUserFound: boolean = false;
  private boolUserIsFriend: boolean = false;

  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.getIdUser();
  }

  getIdUser(){
    this.authService.userDetails().subscribe(res => {
      if(res !== null){
        this.idUser = res.uid;
        this.getUsersData();
      }
    }, err => {
      console.log(err);
    })
  }

  getUserData(){
    this.Datauser = this.usersData.find(user => {
      return user.key === this.idUser;
    });
    if(this.Datauser.friends){
      this.userFriends = this.Datauser.friends;
    }
  }

  getUsersData(){
    this.userService.getAll().snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({key: c.payload.key, ...c.payload.val()}))  
      )
    ).subscribe(data => {
      this.usersData = data;
      this.getUserData();
    });
  }

  async presentToast(toastMessage: string, colorMessage: string) {
    const toast = await this.toastCtrl.create({
      message: toastMessage,
      duration: 3000,
      position: 'bottom',
      color: colorMessage,
    });
    await toast.present();
  }

  async presentLoading(){
    const loading = await this.loadingCtrl.create({
        message: "Menambahkan teman...",
        duration: 1000
    });
    await loading.present();

    const {role, data} = await loading.onDidDismiss();
    console.log("Loading dismissed!");
  }

  getSearchedUser(cariteman: string){
    return{...this.usersData.find(user => {
      return (user.name.toLowerCase() === cariteman.toLowerCase()) && (user.key != this.idUser);
    })};
  }

  checkUserFriends(){
    var idxFriend = this.userFriends.indexOf(this.searchedUserData.key);
    if(idxFriend == -1){
      this.boolUserIsFriend = false;
    }
    else{
      this.boolUserIsFriend = true;
    }
  }

  searchUser(){
    if(this.searchValue != ''){
      this.searchedUserData = this.getSearchedUser(this.searchValue);
      if(JSON.stringify(this.searchedUserData) === '{}'){
        this.boolUserFound = false;
        this.presentToast("User tidak ditemukan", "danger");
      }
      else{
        this.boolUserFound = true;
        if(this.Datauser.friends){
          this.checkUserFriends();
        }
      }
    }
  }

  addFriend(){
    this.presentLoading().then(() => {
      this.userFriends.push(this.searchedUserData.key);
      this.Datauser.friends = this.userFriends;
      this.userService.update(this.idUser, this.Datauser);
      this.boolUserIsFriend = true;
      this.presentToast("User berhasil ditambahkan ke dalam Friend List", "success");
    });
  }

  imageLoaded(event){
    var target = event.target || event.srcElement || event.currentTarget;
    var idAttr = target.attributes.id;
    var idValue = idAttr.nodeValue;
    var profileWidth = document.getElementById(idValue).offsetWidth;
    document.getElementById(idValue).style.height = profileWidth + "px";
  }
}
