var homeView = {
    init: function () {
        $('#start').click(function () {
            markView.init();
        });
    }
};

var markView = {
    init: function () {
        var self = this;
        $('#app').load('mark.html', function () {
            geo.getPosition(function (position) {
                $('#lat').val(position.coords.latitude);
                $('#lon').val(position.coords.longitude);
                self.initMap(position);
            });
            $('#track').click(function () {
                self.updateMarker(); 
                compassView.init();
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
        this.map = new google.maps.Map(document.getElementById("map"), myOptions);
        var crosshairShape = {
            coords:[0,0,20,20],
            type:'rect'
        };
        var marker = new google.maps.Marker({
            map: this.map,
            icon: 'http://www.daftlogic.com/images/cross-hairs.gif',
            shape: crosshairShape
        });
        marker.bindTo('position', this.map, 'center'); 
        google.maps.event.addListener(this.map, 'dragend', this.updateMarker);
    },
    updateMarker: function () {
        var position = markView.map.getCenter(); 
        var lat = position.lat();
        var lon = position.lng();
        $('#lat').val(lat);
        $('#lon').val(lon);
        geo.target = new LatLon(lat, lon);
    }
};

var compassView = {
    init: function () {
        var self = this;
       $('#app').load('compass.html', function () {
           geo.watchPosition(self.onPosition);
       }); 
    },
    onPosition: function (position) {
        var currentPosition = new LatLon(position.coords.latitude, position.coords.longitude);
        var toTarget = geo.target.distanceTo(currentPosition);
        $('#to_target').text((toTarget * 1000) + "m to target");
        console.log(toTarget);
        flash('#0f0');
    }
};

var geo = {
    getPosition: function(onPosition) {
        // if watchPosition active, getCurrentPosition will not respond
        // clearing watch first
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
    homeView.init(); 
});

// startTracking: function () {
//     this.getPosition(this.onPositionChange);
//     this.watchId = navigator.geolocation.watchPosition(
//         this.onPositionChange, 
//         this.onPositionChangeError, 
//         { enableHighAccuracy: true });
// },
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

function flash(color) {
    var oldColor = $(document.body).css('background-color');
    $(document.body).css('background-color', color);
    setTimeout(function () { $(document.body).css('background-color', oldColor); }, 200);
}
