import { Component, Renderer, ChangeDetectorRef } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service'
import { JsonstoreService } from 'src/app/services/jsonstore.service'
import { MFPUser } from './models/mfpuser.model';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  rootPage: any;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private renderer: Renderer,
    private router: Router,
    private authenticationService: AuthenticationService,
    private jsonsStoreService: JsonstoreService
  ) {
    renderer.listenGlobal('document', 'mfpjsloaded', () => {
      console.log('--> MobileFirst API plugin init complete');
      renderer.listenGlobal('document', 'mfpjsonjsloaded', () => {
        console.log('--> MobileFirst JSONStore API plugin init complete');
        this.MFPInitComplete();
      });
    });
  }

  // MFP Init complete function
  MFPInitComplete() {
    console.log('--> MFPInitComplete function called');
    this.authenticationService.registerChallengeHandlers();
    this.jsonsStoreService.initializeCollection().finally(() => {
      this.jsonsStoreService.getUserData();
    }
    );
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.router.navigateByUrl('/login');
    });
  }
}
