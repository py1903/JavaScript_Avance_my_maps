var marker;
var map;
var panel;
var initialize;
var previousPosition = null;
var calculate;
var infoWindow;
var service;
var direction;
var style = [
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#b1ab85"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#8cc0c3"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#cde6cf"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#efede8"
            }
        ]
    }
];

initialize = function(){
  var latLng = new google.maps.LatLng(46.227638, 2.213749); // Correspond au coordonnées de Lille
  var myOptions = {
    zoom      : 5, // Zoom par défaut
    center    : latLng, // Coordonnées de départ de la carte de type latLng 
    mapTypeId : google.maps.MapTypeId.TERRAIN, // Type de carte, différentes valeurs possible HYBRID, ROADMAP, SATELLITE, TERRAIN
    maxZoom   : 20,
    styles: style

  };
  
  map      = new google.maps.Map(document.getElementById('map'), myOptions);
  panel    = document.getElementById('panel');
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(
    new FullScreenControl(map));
  
  
  direction = new google.maps.DirectionsRenderer({
    map   : map,
    panel : panel // Dom element pour afficher les instructions d'itinéraire
  });

  infoWindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);

  

if (navigator.geolocation){
      
      var watchId = navigator.geolocation.watchPosition(successCallback, null, {enableHighAccuracy:true});
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        marker = new google.maps.Marker({
          position: pos, 
          map: map
        });
          map.setCenter(pos);
        document.getElementById('origin').value = pos;
      }, function() {
        handleNoGeolocation(true);
     });
        
}else {
      alert("Votre navigateur ne prend pas en compte la géolocalisation HTML5");
}
       google.maps.event.addListener(marker, 'click', function() {
        infoWindow.open(map,marker);
      });

  var directionService = new google.maps.DirectionsService();
  var rboxer = new RouteBoxer();
  var distance = 20; // km

  directionService.route(request, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
    
      // Box the overview path of the first route
      var path = result.routes[0].overview_path;
      var boxes = routeBoxer.box(path, distance);
      
      for (var i = 0; i < boxes.length; i++) {
        var bounds = box[i];
        // Perform search over this bounds 
      }
    }
  });


};

    function successCallback(position){
      map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude), 
        map: map
      });  
      if (previousPosition){
        var newLineCoordinates = [
           new google.maps.LatLng(previousPosition.coords.latitude, previousPosition.coords.longitude),
           new google.maps.LatLng(position.coords.latitude, position.coords.longitude)];
         
        var newLine = new google.maps.Polyline({
          path: newLineCoordinates,        
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        newLine.setMap(map);
      }
      previousPosition = position;
    };

    

  

calculate = function(){
    origin      = document.getElementById('origin').value; // Le point départ
    destination = document.getElementById('destination').value; // Le point d'arrivé
    travelmod = document.getElementById('travelmod').value;
    $('#map').css('float', 'right').removeClass('container');
    google.maps.event.addListenerOnce(map, 'bounds_changed', performSearch);
    
    if(origin && destination){
        var request = {
            origin      : origin,
            destination : destination,
            travelMode  : google.maps.TravelMode[travelmod] // Mode de conduite
        }
        var directionsService = new google.maps.DirectionsService(); // Service de calcul d'itinéraire
        directionsService.route(request, function(response, status){ // Envoie de la requête pour calculer le parcours
            if(status == google.maps.DirectionsStatus.OK){
                direction.setDirections(response); // Trace l'itinéraire sur la carte et les différentes étapes du parcours
            }
        });
    }
};

function performSearch() {
  var request = {
    bounds: map.getBounds(),
    keyword: 'tourism'
  };
  service.radarSearch(request, callback);
}

function callback(results, status) {
  if (status != google.maps.places.PlacesServiceStatus.OK) {
    alert(status);
    return;
  }
  for (var i = 0, result; result = results[i]; i++) {
    createMarker(result);
  }
}

function createMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: {
      // Star
      path: 'M 0,-24 6,-7 24,-7 10,4 15,21 0,11 -15,21 -10,4 -24,-7 -6,-7 z',
      fillColor: '#ffff00',
      fillOpacity: 1,
      scale: 1/4,
      strokeColor: '#bd8d2c',
      strokeWeight: 1
    }
  });

  google.maps.event.addListener(marker, 'click', function() {
    service.getDetails(place, function(result, status) {
      if (status != google.maps.places.PlacesServiceStatus.OK) {
        alert(status);
        return;
      }
      infoWindow.setContent(result.name);
      infoWindow.open(map, marker);
    });
  });
}




initialize();