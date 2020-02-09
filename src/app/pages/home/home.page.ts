import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';
import { JsonstoreService } from 'src/app/services/jsonstore.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private authenticationService: AuthenticationService, private router: Router, private utils: UtilsService, private jsonstoreService: JsonstoreService) {
  }

  ionViewWillEnter(): void {
    this.jsonstoreService.getUserData().then((user) => {
      if (user != undefined && user['isEnrolled'] != undefined && user['isEnrolled'] != true) {
        this.utils.presentEnrollAlert(user['userName'], user['secretToken']);
      }
    });
  }

  logout() {
    console.log('-->  logout(): Logging out from the application');
    const promise = this.authenticationService.logout();
    promise.then((response: any) => {
      if (response.status !== undefined && response.status === 'success') {
        this.router.navigate(['/login']);
      } else {
        this.utils.showAlert('Error!', 'Failed to Logout');
      }
    }).catch((error) => {
      if (error.status !== undefined && error.status === 'error') {
        this.utils.showAlert('Error!', error.message);
      } else {
        this.utils.showAlert('Error!', 'Failed to Logout');
      }
    });
  }

  callAdapter() {
    this.utils.presentLoading();
    var resourceRequest = new WLResourceRequest("/adapters/ResourceAdapter/balance",WLResourceRequest.GET, {scope: 'accessRestricted'});
    resourceRequest.send().then((response) => {
      console.log('-->  getBalance(): Success ', response);
      this.utils.showAlert('Success!', 'Your Balance is : ' + response.responseText);   
      
    },(error) => {
        console.log('-->  getBalance():  ERROR ', error.responseText);
        this.utils.showAlert('Failure!', 'Failed to retreive balance. Reason : ' + error.responseText);     
    }).done(() => {
      this.utils.dismissLoading();  
    });
  }
    
}
