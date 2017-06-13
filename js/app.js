var map;
var bounds;
var infoWindow;
// Create a new blank array for all the listing markers.
// var markers = [];

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 29.5546186, lng: 106.2683716},
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
  this.visible = ko.observable(true);

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
    populateInfoWindow(this, infowindow);
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
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
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

// 错误处理
function googleMapsError() {
  alert('无法加载');
}
