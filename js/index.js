var home = {
    init: function () {
        $('#start').click(function () {
            mark.init();
        });
    }
};

var mark = {
    init: function () {
        var self = this;
        $('#app').load('mark.html', function () {
            geo.getPosition(function (position) {
                $('#lat').val(position.coords.latitude);
                $('#lon').val(position.coords.longitude);
                self.initMap(position);
                geo.target = new LatLon(position.coords.latitude-1, position.coords.longitude-1);
            });
            $('#track').click(function () {
                compass.init();
            });
        });
    },
    initMap: function (position) {
        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var myOptions = {
                zoom: 16,
                center: latlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
        var map = new google.maps.Map(document.getElementById("map"), myOptions);
    }
};

var links = {
    init: function () {
        $('#app').load('links.html');    
    }
};

var track = {
    init: function () {
        $('#app').load('track.html');
    }
};

var compass = {
    init: function () {
       $('#app').load('compass.html'); 
       geo.watchPosition(this.onPosition);
    },
    onPosition: function (position) {
        var currentPosition = new LatLon(position.coords.latitude, position.coords.longitude);
        var toTarget = geo.target.distanceTo(currentPosition);
        $('#to_target').text(toTarget*1000 + "m to target");
    }
};

var geo = {
    getPosition: function(onPosition) {
        if (this.watchId) { navigator.geolocation.clearWatch(this.watchId); }
        navigator.geolocation.getCurrentPosition(onPosition, this.onPositionChangeError, { enableHighAccuracy: true });
    },
    watchPosition: function(onPosition) {
        if (this.watchId) { navigator.geolocation.clearWatch(this.watchId); }
        this.watchId = navigator.geolocation.watchPosition(onPosition, this.onPositionError, { enableHighAccuracy: true });
    },
    onPositionError: function () {
        console.log('position error: ' + arguments);
    }
};


$(function () { 
    home.init(); 
});

// startTracking: function () {
//     this.getPosition(this.onPositionChange);
//     this.watchId = navigator.geolocation.watchPosition(
//         this.onPositionChange, 
//         this.onPositionChangeError, 
//         { enableHighAccuracy: true });
// },
// 
// 
// onPositionChange: function (position) {
//     app.updatePosition(position);
// //         app.render();
// },
// 
// onPositionChangeError: function () {
//     console.log(arguments);
//     app.flash('#f00');
// },
// 
// updatePosition: function (position) {
//     var pos = position.coords;
//     this.position = new LatLon(pos.latitude, pos.longitude); 
//     this.latitudeDelta = pos.latitude - (+localStorage.getItem('latitude') || 0);
//     this.longitudeDelta = pos.longitude - (+localStorage.getItem('longitude') || 0);
//     this.toTarget = this.target.distanceTo(this.position, 10);
//     this.toTargetDelta = this.toTarget - (+localStorage.getItem('toTarget') || 0);
// 
//     localStorage.setItem('latitude', pos.latitude);
//     localStorage.setItem('longitude', pos.longitude);
//     localStorage.setItem('toTarget', this.toTarget);
// },
// 
// flash: function (color) {
//     $(document.body).css('background-color', color);
//     setTimeout(function () { $(document.body).css('background-color', '#fff'); }, 200);
// }
