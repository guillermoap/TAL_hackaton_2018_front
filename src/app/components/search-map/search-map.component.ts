import { Component, ViewChild, OnInit, Output, Input, EventEmitter, OnChanges } from '@angular/core';
import {} from '@types/googlemaps';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'search-map',
  templateUrl: './search-map.component.html',
  styleUrls: ['./search-map.component.scss']
})
export class SearchMapComponent implements OnInit, OnChanges {
  @ViewChild('googleMap') googleMap: any;
  @Output() location = new EventEmitter<{}>();
  @Input() places = [];
  @Input() markers: [any];
  @Input() circles: [any];
  initialLocation = new google.maps.LatLng(30.2672, -97.7031);
  map: google.maps.Map;
  googlePlacesService: google.maps.places.PlacesService;
  maxSearchRadius = 50000;
  minSearchRadius = 2000;
  maxCirclesReached = false;
  DEBUG = true;

  constructor() {}

  ngOnInit() {
    this.loadMap();
    this.generateMarkers();
  }

  ngOnChanges(changes) {
    if (changes.places && this.places && this.places.length > 0) {
      this.adjustMap(this.places)
    }
    if(changes.circles && this.circles && this.circles.length > 0) {
      this.generateMarkers()
    }
  }

  loadMap() {
    this.map = new google.maps.Map(this.googleMap.nativeElement, {
      center: this.initialLocation,
      zoom: 13,
      styles: [
        {
          featureType: 'poi',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'transit.station',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });
    this.setCircleEvent();
  }

  adjustMap(places) {
    console.log(places);
    const bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log('Returned place contains no geometry');
        return;
      }

      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    }.bind(this));

    this.map.fitBounds(bounds);
  }

  setCircleEvent() {
    this.map.addListener('click', (event) => {
      if (this.maxCirclesReached) return;
      this.maxCirclesReached = true;

      const searchArea = new google.maps.Circle({
        map: this.map,
        center: event.latLng,
        radius: this.minSearchRadius,
        draggable: true,
        editable: true,
        strokeColor: '#53af7e',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#53af7e',
        fillOpacity: 0.3
      });

      this.location.emit({
        position: searchArea.getCenter(),
        radius: searchArea.getRadius(),
      });

      google.maps.event.addListener(searchArea, 'dragend', () => {
        this.location.emit({
          position: searchArea.getCenter(),
          radius: searchArea.getRadius(),
        });
      });

      google.maps.event.addListener(searchArea, 'radius_changed', () => {
        if (searchArea.getRadius() > this.maxSearchRadius) {
          searchArea.setRadius(this.maxSearchRadius);
        }
        if (searchArea.getRadius() < this.minSearchRadius) {
          searchArea.setRadius(this.minSearchRadius);
        }

        this.location.emit({
          position: searchArea.getCenter(),
          radius: searchArea.getRadius(),
        });
      });
    });
  }

  generateMarkers() {
    const image = '../../../assets/TAL-marker.png';

    console.log(this.markers)
    for (let marker of this.markers) {
      const dealershipMarker = new google.maps.Marker({
        position: { lat: parseFloat(marker.latitude), lng: parseFloat(marker.longitude) },
        map: this.map,
        animation: google.maps.Animation.DROP,
        title: marker.nam,
        icon: image
      });
      var contentString = `
        <div class="name">Name: ${marker.name}</div>
        <div>Website: ${marker.website}</div>
        <div>Address: ${marker.formatted_address}</div>
        <div>Phone number: ${marker.formatted_phone_number}</div>
        <div>Rating: ${marker.rating}</div>
      `
      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });

      dealershipMarker.addListener('click', function() {
        infowindow.open(this.map, dealershipMarker);
      });
    }

    if (this.DEBUG) {
      for (let circle of this.circles) {
        var circleLocation = new google.maps.LatLng(circle.latitude, circle.longitude);
        const dealershipCircle = new google.maps.Circle({
          center: circleLocation,
          map: this.map,
          radius: environment.SMALL_CIRCLE_RADIUS,
          strokeColor: '#cacaca',
          strokeOpacity: 0.3,
          strokeWeight: 1,
          fillColor: '#cacaca',
          fillOpacity: 0.5
        });
      }
    }
  }
}
