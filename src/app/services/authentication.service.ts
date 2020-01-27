import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private userLoginChallengeHandler: WL.Client.SecurityCheckChallengeHandler;
  private userLoginSecurityCheck : string = "EnrollmentUserLogin";

  constructor(private events: Events) { }

  isEnrolled() {
    const promise = new Promise((resolve, reject ) => {
    WLAuthorizationManager.obtainAccessToken("IsEnrolled").then(
        function() {
            resolve();
        },
        function(response) {
           reject();
        }
    );
  }); 
  return promise;
}

  login(userId: string, password: string) {
    const promise = new Promise((resolve, reject ) => {
      WLAuthorizationManager.login(this.userLoginSecurityCheck, {
        username : userId,
        password: password
      }).then(success => {
        console.log("-->AuthenticationService : MFPUserLogin : login() : success : " + JSON.stringify(success));
        resolve({status: 'success', message: 'User credentials are valid'});
      }, error => {
        console.log("-->AuthenticationService : MFPUserLogin : login() : error : " + JSON.stringify(error));
        reject({status: 'error', message: 'Invalid user credentials'});
      });
    });
    return promise; 
  }

  logout() {
    const promise = new Promise((resolve, reject ) => {
      WLAuthorizationManager.logout(this.userLoginSecurityCheck).then(success => {
        console.log("-->AuthenticationService : MFPUserLogin : logout() : success : " + JSON.stringify(success));
        resolve({status: 'success', message: 'Logged out successfully'});
      }, error => {
        console.log("-->AuthenticationService : MFPUserLogin : logout() : error : " + JSON.stringify(error));
        reject({status: 'error', message: 'Failed to logout'});
      });
    });
    return promise; 
  }

  registerChallengeHandlers() {
    this.registerUserLoginChallengeHandler();
  }

  registerUserLoginChallengeHandler() {
    this.userLoginChallengeHandler = WL.Client.createSecurityCheckChallengeHandler(this.userLoginSecurityCheck);
    this.userLoginChallengeHandler.handleChallenge = (challenge) => {
      this.displayLoginChallenge(challenge);
    }
    this.userLoginChallengeHandler.handleSuccess = (success) => {
      console.log("-->AuthenticationService : MFPUserLogin : handleSuccess() : success : " + JSON.stringify(success));
    }
    this.userLoginChallengeHandler.handleFailure = (error) => {
      console.log("-->AuthenticationService : MFPUserLogin : handleFailure() : error : " + JSON.stringify(error));
    }
  }

  displayLoginChallenge(challenge) {
    if (challenge.errorMsg) {
      var msg = challenge.errorMsg + ', Remaining attempts: ' + challenge.remainingAttempts;
     console.log('--> displayLoginChallenge ERROR: ' + msg);
      this.events.publish('mfp:challenge', msg, this.userLoginChallengeHandler);
    } else {
      this.events.publish('mfp:challenge', 'Invalid Credentials', this.userLoginChallengeHandler);
    }
  }
}
