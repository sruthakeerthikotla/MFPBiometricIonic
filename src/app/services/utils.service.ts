import { Injectable } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service'
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { JsonstoreService } from './jsonstore.service';
import { MFPUser } from '../models/mfpuser.model';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  private loadingElement: any;

  constructor( private alertCtrl: AlertController, private loadingController: LoadingController,
               private fingerPrintAIO: FingerprintAIO, private authenticationService: AuthenticationService, private jsonstoreService : JsonstoreService) { }

  async presentLoading() {
    this.loadingElement = await this.loadingController.create({
      message: 'Loading...',
      spinner: 'crescent'
    });
    return await this.loadingElement.present();
  }
  async dismissLoading() {
    console.log('loading dismissed');
    return await this.loadingElement.dismiss();
  }

  showAlert(header: string, message: string) {
    let alert = this.alertCtrl
    .create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'Ok'
        }
      ]
    })
    .then(arltElem => arltElem.present());
  }

  presentFingerPrint() {
    return this.fingerPrintAIO.show({
      description: "Please authenticate using biometric"
    });
  }

  async isFingerprintAvailable() {
    let result = false;
    const promise = await this.fingerPrintAIO.isAvailable();
    promise.then((response) => {
        result = true;
        console.log('fingerprint available : ', response);
       });
    promise.catch((error) => {
         result  = false;
         console.log('fingerprint error : ', error);
       });
    return result;
  }

  async presentEnrollAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Biometric Enrollment',
      message: 'Do you wish to enroll for Mobilefirst Biometric Authentication',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Okay',
          handler: () => {
            if (this.isFingerprintAvailable()) {
              this.presentFingerPrint().then((result: any) => {
                this.authenticationService.enroll().then(
                  () => {
                    let user = new MFPUser();
                    user.userName = "MFPUser";
                    user.isEnrolled = true;
                    user.secretToken = "1234";
                    this.jsonstoreService.storeUserData(user).finally(() =>{
                      this.showAlert('Success', 'Successfully enrolled for Biometric Authentication');
                    });
                  }, () => {
                    this.showAlert('Failure', 'Failed to enroll for Biometric Authentication');
                  }
                )
              })
              .catch((error: any) => {
                this.showAlert('Failure', 'Failed to enroll for Biometric Authentication');
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }


}
