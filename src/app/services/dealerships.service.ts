import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpService } from './http.service';
import { HttpParams } from '@angular/common/http';
import { ResponseContentType } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class DealershipsService {
  private dealershipsUrl = this.http.getApiUrl() + '/dealerships';

  constructor (private http: HttpService) {}

  findDealerships(latitude, longitude, radius) {
    let params = new HttpParams();
    params = params.append('longitude', longitude);
    params = params.append('latitude', latitude);
    params = params.append('radius', radius);
    return this.http.get(`${this.dealershipsUrl}/find`, { params: params }).catch(this.http.handleError)
  }

  export(ids) {
    return this.http.get(`${this.dealershipsUrl}/export.csv?dealership_ids=${ids}`, { responseType: 'text' }).catch(this.http.handleError)
  }
}
