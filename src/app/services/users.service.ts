import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { User } from '../models/users';


@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private dbPath = '/user';
  userRef: AngularFireList<User> = null;

  constructor(private db: AngularFireDatabase) { 
    this.userRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<User> {
    return this.userRef;
  }

  create(key: string, value: any): any {
    return this.db.object("/user/"+key).set({
      name:value.firstName+" "+value.lastName,
      email:value.email,
    });
  }

  update(key: string, value: any): Promise<void> {
    return this.userRef.update(key, value);
  }
}
