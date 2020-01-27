import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private authenticationService : AuthenticationService, private router: Router, private utils : UtilsService) {
    this.utils.presentEnrollAlert();
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

}
