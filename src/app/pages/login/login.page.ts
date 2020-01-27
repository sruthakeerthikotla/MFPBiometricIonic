import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { UtilsService } from 'src/app/services/utils.service';
import { AuthenticationService } from 'src/app/services/authentication.service'
import { Events } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  userName: string;
  password: string;
  private userLoginChallengeHandler : WL.Client.SecurityCheckChallengeHandler; 
  private isChallenged = false;

  constructor(private utils: UtilsService, private authenticationService: AuthenticationService, private router: Router, private events: Events) { 
    events.subscribe('mfp:challenge', (msg , challengeHandler) => {
      this.isChallenged = true;
      this.password = "";
      this.userLoginChallengeHandler = challengeHandler;
      this.utils.showAlert('Error!', 'Error while authenticating the user. ' + msg);
    });
  }

  ngOnInit() {
  }

  login() {
    if (!this.userName && !this.password) {
      this.utils.showAlert('Error!', 'Please enter username and password');
    } else if (!this.userName) {
      this.utils.showAlert('Error!', 'Please enter username');
    }  else if (!this.password) {
      this.utils.showAlert('Error!', 'Please enter password');
    } else if(this.isChallenged) {
      console.log('-->  login(): Subsequent login attempt');
       this.userLoginChallengeHandler.submitChallengeAnswer({
         username: this.userName,
         password: this.password
       });
       this.isChallenged = false;
     } else {
      console.log('-->  login(): First time login attempt');
      const promise = this.authenticationService.login(this.userName, this.password);
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
        this.router.navigate(['/home']);
      })
      .catch((error: any) => {
        console.error('fingerprint : ', 'error');
      });
    }
  }

}
