$.domReady(function () {
    app.init();
});

var app = {
    init: function () {
        if (!navigator.geolocation) {
            $('#app').text('No Geolocation, sorry&hellip; :(');
            return;
        }

        var el = $('<div id="form">'),
            lat = $('<input type="text" id="lat" value="50.081023" placeholder="latitude">'),
            lon = $('<input type="text" id="lon" value="19.921245" placeholder="longitude">'),
            track = $('<input type="button" id="track" value="track">'),
            useCurrentPosition = $('<input type="button" id="use_current" value="use current">');

        el.append(lat);
        el.append(lon);
        el.append(track);
        el.append(useCurrentPosition);
        $('#app').append(el);

        track.click(function () {
            app.target = new LatLon($('#lat').val(), $('#lon').val());
            app.startTracking();
        });

        useCurrentPosition.click(function () {
            app.getPosition(function (position) {
                lat.val(""+position.coords.latitude);
                lon.val(""+position.coords.longitude);
            });
        });
    },

    startTracking: function () {
        this.getPosition(this.onPositionChange);
        this.watchId = navigator.geolocation.watchPosition(
            this.onPositionChange, 
            this.onPositionChangeError, 
            { 
                enableHighAccuracy: true,
                timeout: 5000
            });
    },

    getPosition: function(onPosition) {
        if (this.watchId) { navigator.geolocation.clearWatch(this.watchId); }
        navigator.geolocation.getCurrentPosition(
            onPosition, 
            this.onPositionChangeError, 
            { 
                enableHighAccuracy: true,
                timeout: 5000
            });
    },
    
    onPositionChange: function (position) {
        app.updatePosition(position);
        app.render();
    },

    onPositionChangeError: function () {
        console.log(arguments);
        app.flash('#f00');
    },

    updatePosition: function (position) {
        var pos = position.coords;
        this.position = new LatLon(pos.latitude, pos.longitude); 
        this.latitudeDelta = pos.latitude - (+localStorage.getItem('latitude') || 0);
        this.longitudeDelta = pos.longitude - (+localStorage.getItem('longitude') || 0);
        this.toTarget = this.target.distanceTo(this.position, 10);
        this.toTargetDelta = this.toTarget - (+localStorage.getItem('toTarget') || 0);

        localStorage.setItem('latitude', pos.latitude);
        localStorage.setItem('longitude', pos.longitude);
        localStorage.setItem('toTarget', this.toTarget);
    },

    render: function () {
        $('#data').remove();
        var el = $('<div id="data">'),
            color = this.toTargetDelta > 0 ? '#0f0' : '#f00';
        el.append(this.createP("target lat: " + this.target.lat()));
        el.append(this.createP("target lon: " + this.target.lon()));
        el.append(this.createP("lat: " + this.position.lat()));
        el.append(this.createP("lon: " + this.position.lon()));
        el.append(this.createP("latDelta: " + this.latitudeDelta));
        el.append(this.createP("lonDelta: " + this.longitudeDelta));
        el.append(this.createP("toTarget: " + this.toTarget*1000 + ' m'));
        targetDelta = this.createP("toTargetDelta: " + this.toTargetDelta*1000 + ' m');
        targetDelta.css('color', color);
        el.append(targetDelta);
        
        $('#app').append(el);
        app.flash('#ffa');
    },
    
    createP: function (text) {
        return $('<p>').text(text);
    },

    flash: function (color) {
        $(document.body).css('background-color', color);
        setTimeout(function () { $(document.body).css('background-color', '#fff'); }, 200);
    }
};
