var map;
var bounds;
var infowindow;

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.1703125, lng: 116.2364331},
    zoom: 10
  });

  infowindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();
  ko.applyBindings(new ViewModel);
}

// - - - - - - - - - - - - - - Location Model - - - - - - - - - - - - - - - //
var LocationMarker = function(data) {
  var self = this;
  this.title = data.title;
  this.position = data.location;
  this.street = '';
  this.visible = ko.observable(true);

  var clientID = 'QO2OI54QLXB0F1FVRGYEM5DNSLMCBAKUYIMWVGKQ01F4X4AZ';
  var clientSecret = 'LBSOM0BP1VNXUR2KMI0PUCSFZFDLLO1QTT3WHWLYL42SPHYM';
  var reqURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.position.lat + ',' + this.position.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.title;

  $.getJSON(reqURL).done(function(data) {
    var results = data.response.venues[0];
    self.street = results.location.formattedAddress[0] ? results.location.formattedAddress[0]: 'N/A';
  }).fail(function() {
    alert('Foursquare出错了:D');
  })

  // Create a marker per location, and put into markers array.
  this.marker = new google.maps.Marker({
    map: this.map,
    position: this.position,
    title: this.title,
    animation: google.maps.Animation.DROP,
  });

  self.filterMarkers = ko.computed(function() {
    // show location list
    if (self.visible() === true) {
      self.marker.setMap(map);
      bounds.extend(self.marker.position);
      map.fitBounds(bounds);
    } else {
      self.marker.setMap(null);
    }
  });

  this.marker.addListener('click', function() {
    populateInfoWindow(this, self.street, infowindow);
    toggleBounce(this);
  });

  this.show = function(location) {
    google.maps.event.trigger(self.marker, 'click');
  };
}

// - - - - - - - - - - - - - - View Model - - - - - - - - - - - - - - - //
var ViewModel = function() {
  var self = this;
  this.searchItem = ko.observable('');
  this.mapList = ko.observableArray([]);

  // Push the marker to our array of markers
  locations.forEach(function(location) {
    self.mapList.push(new LocationMarker(location));
  });

  this.locationList = ko.computed(function() {
    var searchFilter = self.searchItem().toLowerCase();
    if (searchFilter) {
      return ko.utils.arrayFilter(self.mapList(), function(location) {
        var str = location.title.toLowerCase();
        var result = str.includes(searchFilter);
        location.visible(result);
        return result;
      });
    }
    self.mapList().forEach(function(location) {
      location.visible(true);
    });
    return self.mapList();
  }, self);
};

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, street, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<h4>' + marker.title + '</h4>' +
                          '<p>' + street + '</p>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
    });
  }
}

function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 1400);
  }
}

// 谷歌地图错误处理
function googleMapsError() {
  alert('谷歌地图出错了:D');
}
