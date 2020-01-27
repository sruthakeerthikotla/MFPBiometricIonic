import { Injectable } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { FingerprintAIO, FingerprintOptions } from '@ionic-native/fingerprint-aio/ngx';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  private loadingElement: any;

  constructor( private alertCtrl: AlertController, private loadingController: LoadingController,
               private fingerPrintAIO: FingerprintAIO) { }

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
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Okay',
          handler: () => {
            if (this.isFingerprintAvailable()) {
              this.presentFingerPrint()
              .then((result: any) => {
                this.showAlert('Success', 'Successfully enrolled for Biometric Authentication');
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
