var locations = [
  {title: '北京', location: {lat: 39.9375348, lng: 115.8370508}},
  {title: '上海', location: {lat: 31.2231339, lng: 120.9163285}},
  {title: '深圳', location: {lat: 22.5549176, lng: 113.7736945}},
  {title: '杭州', location: {lat: 30.2610923, lng: 119.8917084}},
  {title: '重庆', location: {lat: 29.5546186, lng: 106.2683716}}
];

var Location = function(data) {
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location)
};

var ViewModel = function() {
  var self = this;
  this.locList = ko.observableArray([]);

  locations.forEach(function(loc) {
    self.locList.push(new Location(loc));
  });
};
