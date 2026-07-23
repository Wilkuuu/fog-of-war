import { Component, OnInit } from '@angular/core';
import { AdsService } from './services/ads.service';
import { BillingService } from './services/billing.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  constructor(
    private ads: AdsService,
    private billing: BillingService
  ) {}

  async ngOnInit() {
    await this.billing.initialize();
    await this.ads.initialize();
  }
}


