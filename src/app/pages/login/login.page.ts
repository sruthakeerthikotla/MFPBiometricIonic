import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { UtilsService } from 'src/app/services/utils.service';
import { AuthenticationService } from 'src/app/services/authentication.service'
import { Events } from '@ionic/angular';
import { JsonstoreService } from 'src/app/services/jsonstore.service';
import { MFPUser } from 'src/app/models/mfpuser.model';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  userName: string;
  password: string;
  isEnrolled: boolean = false;
  mfpUser: MFPUser = new MFPUser();
  private userLoginChallengeHandler: WL.Client.SecurityCheckChallengeHandler;
  private isChallenged = false;

  constructor(private utils: UtilsService, private authenticationService: AuthenticationService, private router: Router, private events: Events, private jsonstoreService: JsonstoreService) {
    events.subscribe('mfp:challenge', (msg, challengeHandler) => {
      this.isChallenged = true;
      this.password = "";
      this.userLoginChallengeHandler = challengeHandler;
      this.utils.showAlert('Error!', 'Error while authenticating the user. ' + msg);
    });
  }

  ionViewWillEnter(): void {
      this.checkForEnrollment();
  }

  checkForEnrollment() {
    this.utils.presentLoading();
    this.jsonstoreService.getUserData().then((user) => {
      if (user != undefined && user['isEnrolled'] != undefined) {
        this.mfpUser.userName = user['userName'];
        this.mfpUser.secretToken = user['secretToken'];
        this.mfpUser.isEnrolled = user['isEnrolled'];
        this.isEnrolled = this.mfpUser.isEnrolled;
      }
    }).finally(() => {
      this.utils.dismissLoading();
    });
  }


  login() {
    if (!this.userName && !this.password) {
      this.utils.showAlert('Error!', 'Please enter username and password');
    } else if (!this.userName) {
      this.utils.showAlert('Error!', 'Please enter username');
    } else if (!this.password) {
      this.utils.showAlert('Error!', 'Please enter password');
    } else if (this.isChallenged) {
      console.log('-->  login(): Subsequent login attempt');
      this.userLoginChallengeHandler.submitChallengeAnswer({
        username: this.userName,
        password: this.password
      });
      this.isChallenged = false;
    } else {
      console.log('-->  login(): First time login attempt');
      const promise = this.authenticationService.login(this.userName, this.password, this.mfpUser.isEnrolled);
      promise.then((response: any) => {
        this.password = "";
        if (response.status !== undefined && response.status === 'success') {
          this.router.navigate(['/home']);
        } else {
          this.utils.showAlert('Error!', 'Error while authenticating the user');
        }
      }).catch((error) => {
        this.password = "";
        if (error.status !== undefined && error.status === 'error') {
          this.utils.showAlert('Error!', error.message);
        } else {
          this.utils.showAlert('Error!', 'Error while authenticating the user');
        }
      });
    }
  }

  loginWithFingerprint() {
    if (this.utils.isFingerprintAvailable) {
      this.utils.presentFingerPrint()
        .then((result: any) => {
          this.userName = this.mfpUser.userName
          this.password = this.mfpUser.secretToken
          this.login();
        })
        .catch((error: any) => {
          console.error('fingerprint : ', 'error');
        });
    }
  }

  clearStoredCredentials() {
    this.jsonstoreService.storeUserData(new MFPUser()).finally(() => {
      this.isEnrolled = false;
      this.mfpUser = new MFPUser();
    });
  }

}
