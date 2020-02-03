import { Injectable } from '@angular/core';
import { MFPUser } from '../models/mfpuser.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { resolve } from 'url';

@Injectable({
  providedIn: 'root'
})
export class JsonstoreService {

  private collectionName: string = "mfpBiometric";
  private currentUserSubject: BehaviorSubject<MFPUser>;
  public currentUser: Observable<MFPUser>;

  constructor(public router: Router) {
  }

  public async initializeCollection() {
    const promise = new Promise<WL.JSONStore.JSONStoreInstance>((resolve, reject) => {
      var collection = {
        mfpBiometric: {
          searchFields: { userName: 'string', isEnrolled: 'boolean', secretToken: 'string' }
        }
      };
      WL.JSONStore.init(collection).then(function (collection) {
        WL.Logger.debug("Successfully initialized JSONStore Collection for MFPBiometric");
        resolve(collection);
      }).fail(function (error) {
        WL.Logger.debug("Failed to initialize JSONStore Collection for MFPBiometric. Reason : " + JSON.stringify(error));
        reject(error);
      })
    });
    return promise;
  }


  public get currentUserValue(): MFPUser {
    if(this.currentUserSubject != undefined){
      return this.currentUserSubject.value;
    }
    return undefined
  }

  public storeUserData(user: MFPUser) {
    return new Promise((resolve, reject) => {
      var doc = [{ _id: 1, json: user }];
      WL.JSONStore.get(this.collectionName).replace(doc, {
      }).then(function () {
        resolve();
      }).fail(function (error) {
        WL.JSONStore.get("mfpBiometric").add(user, {}).then(() => {
          resolve();
        }).fail((error) => {
          WL.Logger.debug("Failed to store user data. Reason : " + JSON.stringify(error));
          reject(error);
        });
      });
    });
  }

  public getUserData() {
    return new Promise((resolve, reject) => {
      let userData: MFPUser;
      var options = {
        exact: false
      };
      var collection = WL.JSONStore.get(this.collectionName);
      collection.findById([1], options).then(function (results) {
        if(results.length > 0) {
          this.currentUserSubject = new BehaviorSubject<MFPUser>(results[0].json);
           this.currentUser = this.currentUserSubject.asObservable();
        }
        resolve(results);
      }).fail(function (error) {
        WL.Logger.debug("Failed to retreive user data. Reason : " + JSON.stringify(error));
        reject(error);
      });
    });
  }

  async clearUserData() {
    WL.JSONStore.destroy(this.collectionName).then(function () {
      WL.Logger.debug("Successfully destroyed the collection");
    }).fail(function (error) {
      WL.Logger.debug("Failed to destroy the collection. Reason : " + JSON.stringify(error));
    });
    this.currentUserSubject.next(null);
  }
}
