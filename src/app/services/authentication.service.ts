import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private userLoginChallengeHandler: WL.Client.SecurityCheckChallengeHandler;
  private pinCodeChallengeHandler: WL.Client.SecurityCheckChallengeHandler;
  private isEnrolledChallengeHandler: WL.Client.SecurityCheckChallengeHandler;
  private userLoginSecurityCheck: string = "EnrollmentUserLogin";
  private pinCodeSecurityCheck: string = "EnrollmentPinCode";
  private isEnrolledSecurityCheck: string = "IsEnrolled";

  constructor(private events: Events) { }

  isEnrolled() {
    const promise = new Promise((resolve, reject) => {
      WLAuthorizationManager.obtainAccessToken("IsEnrolled").then(
        function () {
          resolve();
        },
        function (response) {
          WL.Logger.debug("Error while checking for enrollment status: " + JSON.stringify(response));
          reject();
        }
      );
    });
    return promise;
  }

  enroll() {
    const promise = new Promise((resolve, reject) => {
      var pinCode = "";
      WLAuthorizationManager.obtainAccessToken("setPinCode").then(
        function () {
          pinCode = "1234"
          if (pinCode === null) {
            WLAuthorizationManager.logout("EnrollmentUserLogin").then(
              function () {
                reject();
                WL.Logger.debug("Successfully logged out from EnrollmentUserLogin.");
              },
              function (response) {
                reject(response);
                WL.Logger.debug("Failed logging out from EnrollmentUserLogin: " + JSON.stringify(response));
              }
            );
          } else {
            var resourceRequest = new WLResourceRequest(
              "/adapters/Enrollment/setPinCode/" + pinCode,
              WLResourceRequest.POST
            );
            resourceRequest.send().then(
              function () {
                resolve();
              },
              function (response) {
                reject(response);
                WL.Logger.debug("Error writing public data: " + JSON.stringify(response));
              }
            );
          }
        },
        function (response) {
          reject(response);
          WL.Logger.debug("Failed requesting an access token:" + JSON.stringify(response));
        }
      );
    });
    return promise;
  }

  unenroll() {
    const promise = new Promise((resolve, reject) => {
      var resourceRequest = new WLResourceRequest(
        "/adapters/Enrollment/unenroll",
        WLResourceRequest.DELETE
      );

      resourceRequest.send().then(
        function () {
          WL.Logger.debug("Successfully deleted the pin code.");
          this.logout();
          resolve();
        },
        function (response) {
          WL.Logger.debug("Failed deleting pin code: " + JSON.stringify(response));
          reject(resolve);
        }
      );
    });
    return promise;
  }

  login(userId: string, password: string) {
    const promise = new Promise((resolve, reject) => {
      WLAuthorizationManager.login(this.userLoginSecurityCheck, {
        username: userId,
        password: password
      }).then(success => {
        console.log("-->AuthenticationService : MFPUserLogin : login() : success : " + JSON.stringify(success));
        resolve({ status: 'success', message: 'User credentials are valid' });
      }, error => {
        console.log("-->AuthenticationService : MFPUserLogin : login() : error : " + JSON.stringify(error));
        reject({ status: 'error', message: 'Invalid user credentials' });
      });
    });
    return promise;
  }

  pinLogin() {
    const promise = new Promise((resolve, reject) => {
      WLAuthorizationManager.login(this.pinCodeSecurityCheck, {
        pin: "1234"
      }).then(success => {
        console.log("-->AuthenticationService : MFPPincode : login() : success : " + JSON.stringify(success));
        resolve({ status: 'success', message: 'User credentials are valid' });
      }, error => {
        console.log("-->AuthenticationService : MFPPincode : login() : error : " + JSON.stringify(error));
        reject({ status: 'error', message: 'Invalid user credentials' });
      });
    });
    return promise;
  }

  logout() {
    const promise = new Promise((resolve, reject) => {
      WLAuthorizationManager.logout(this.userLoginSecurityCheck).then(
        function() {
            WL.Logger.debug ("Successfully logged-out from  " + this.userLoginSecurityCheck);
            WLAuthorizationManager.logout("EnrollmentPinCode").then(
                function() {
                    WL.Logger.debug("Successfully logged-out from EnrollmentPinCode");
                    WLAuthorizationManager.logout("IsEnrolled").then(
                        function() {
                          WL.Logger.debug ("Successfully logged-out from IsEnrolled");
                          resolve({ status: 'success', message: 'Logged out successfully' });
                        },
                        function(response) {
                            WL.Logger.debug("IsEnrolled logout failed: " + JSON.stringify(response));
                            reject({ status: 'error', message: 'Failed to logout' });
                        }
                    );
                },
                function(response) {
                    WL.Logger.debug("EnrollmentPinCode logout failed: " + JSON.stringify(response));
                    reject({ status: 'error', message: 'Failed to logout' });
                }
            );
        },
        function(response) {
            WL.Logger.debug(this.userLoginSecurityCheck + " logout failed: " + JSON.stringify(response));
            reject({ status: 'error', message: 'Failed to logout' });
        }
    );});
    return promise;
  }

  registerChallengeHandlers() {
    this.registerUserLoginChallengeHandler();
    this.registerPincodeChallengeHandler();
    this.registerIsEnrolledChallengeHandler();
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

  registerPincodeChallengeHandler() {
    this.pinCodeChallengeHandler = WL.Client.createSecurityCheckChallengeHandler(this.pinCodeSecurityCheck);
    this.pinCodeChallengeHandler.handleChallenge = (challenge) => {
        // var msg = "";
        // // Create the title string for the prompt
        // if (challenge.errorMsg !== null) {
        //     msg = challenge.errorMsg + "\n";
        // } else {
        //     msg = "This data requires a PIN code.\n";
        // }
        // msg += "Remaining attempts: " + challenge.remainingAttempts;

        // // Display a prompt for user to enter the pin code
        // var pinCode = prompt(msg, "");
        // while (pinCode === "") {
        //     pinCode = prompt("You must set a pin code", "");
        // }

        // if (pinCode) { // calling submitChallengeAnswer with the entered value
        //     pinCodeChallengeHandler.submitChallengeAnswer({
        //         "pin": pinCode
        //     });
        // } else { // calling cancel in case user pressed the cancel button
        //     pinCodeChallengeHandler.cancel();
        // }
    };
    this.pinCodeChallengeHandler.handleSuccess = (success) => {
      console.log("-->AuthenticationService : MFPPincode : handleSuccess() : success : " + JSON.stringify(success));
    }
    this.pinCodeChallengeHandler.handleFailure = (error) => {
        console.log("-->AuthenticationService : MFPPincode : handleFailure() : error : " + JSON.stringify(error));
        WL.Logger.debug("Challenge Handler Failure!");
        // if (error.failure !== null && error.failure !== undefined) {
        //     if (error.failure == "Account blocked") {
        //         enroll();
        //         document.getElementById("unenrollButton").style.display = 'none';
        //         document.getElementById("username").value = "";
        //         document.getElementById("password").value = "";
        //     } else {
        //         alert("Error:" + JSON.stringify(error.failure));
        //     }
        // } else {
        //     alert("Unknown error");
        // }
    };
  }

  registerIsEnrolledChallengeHandler() {
    this.isEnrolledChallengeHandler = WL.Client.createSecurityCheckChallengeHandler(this.isEnrolledSecurityCheck);

    this.isEnrolledChallengeHandler.handleSuccess = (response) => {
      console.log("-->AuthenticationService : MFPisEnrolled : handleSuccess() : success : " + JSON.stringify(response));
    };

    this.isEnrolledChallengeHandler.handleFailure = (error) => {
      console.log("-->AuthenticationService : MFPisEnrolled : handleFailure() : error : " + JSON.stringify(error));
    };

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
