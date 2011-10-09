$.domReady(function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getPosition, getPositionError, { enableHighAccuracy: true });
        navigator.geolocation.watchPosition(getPosition, getPositionError, { enableHighAccuracy: true });
    } else {
        $('#position').text('No Geolocation, sorry&hellip; :(');
    }
});

function getPosition(position) {
    var pos = position.coords,
        latitude = "latitude: " + pos.latitude,
        longitude = "longitude: " + pos.longitude,
        altitude = "altitude: " + pos.altitude,
        speed = "speed: " + (pos.speed || 0),        
        latitudeDelta = "latitudeDelta: " + (pos.latitude - (localStorage.getItem('latitude') || 0)),
        longitudeDelta = "longitudeDelta: " + (pos.longitude - +localStorage.getItem('longitude') || 0),
        element = $('#data');
    element.empty();
    element.append(createP(latitude));
    element.append(createP(longitude));
    element.append(createP(altitude));
    element.append(createP(speed));
    element.append(createP(latitudeDelta));
    element.append(createP(longitudeDelta));
    element.css('background-color', '#ffa');
    setTimeout(function () { element.css('background-color', '#fff'); }, 100);

    localStorage.setItem('latitude', pos.latitude);
    localStorage.setItem('longitude', pos.longitude);
}

function createP(text) {
    return $('<p>').text(text);
};

function getPositionError() {
}
