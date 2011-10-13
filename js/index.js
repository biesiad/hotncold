$.domReady(function () {
    app.init();
});

var app = {
    init: function () {
        var el = $('<div id="form">'),
            lat = $('<input type="text" id="lat" value="50">'),
            lon = $('<input type="text" id="lon" value="19">'),
            btn = $('<input type="button" id="track" value="track">');
        el.append(lat);
        el.append(lon);
        el.append(btn);
        $('#app').append(el);

        btn.click(function () {
            app.target = new LatLon($('#lat').val(), $('#lon').val());
            app.startTracking();
        });
    },

    startTracking: function () {
        if (navigator.geolocation) {
            if (this.watchId) { navigator.geolocation.clearWatch(this.watchId); }
            navigator.geolocation.getCurrentPosition(this.onPositionChange, this.onPositionChangeError, { enableHighAccuracy: true });
            this.watchId = navigator.geolocation.watchPosition(this.onPositionChange, this.onPositionChangeError, { enableHighAccuracy: true });
        } else {
            $('#app').text('No Geolocation, sorry&hellip; :(');
        }
    },
    
    onPositionChange: function (position) {
        app.updatePosition(position);
        app.render();
    },

    onPositionChangeError: function () {
        console.log(arguments);
        this.flash('#f00');
    },

    updatePosition: function (position) {
        var pos = position.coords;
        this.position = new LatLon(pos.latitude, pos.longitude); 
        this.latitudeDelta = pos.latitude - (+localStorage.getItem('latitude') || 0);
        this.longitudeDelta = pos.longitude - (+localStorage.getItem('longitude') || 0);
        this.toTarget = this.target.distanceTo(this.position);
        this.toTargetDelta = this.toTarget - (+localStorage.getItem('toTarget') || 0);

        localStorage.setItem('latitude', pos.latitude);
        localStorage.setItem('longitude', pos.longitude);
        localStorage.setItem('toTarget', this.toTarget);
    },

    render: function () {
        $('#data').remove();
        var el = $('<div id="data">');
        el.append(this.createP("target lat: " + this.target.lat()));
        el.append(this.createP("target lon: " + this.target.lon()));
        el.append(this.createP("lat: " + this.position.lat()));
        el.append(this.createP("lon: " + this.position.lon()));
        el.append(this.createP("latDelta: " + this.latitudeDelta));
        el.append(this.createP("lonDelta: " + this.longitudeDelta));
        el.append(this.createP("toTarget: " + this.toTarget));
        el.append(this.createP("toTargetDelta: " + this.toTargetDelta));
        $('#app').append(el);
        this.flash('#ffe');
    },
    
    createP: function (text) {
        return $('<p>').text(text);
    },

    flash: function (color) {
        $(document.body).css('background-color', color);
        setTimeout(function () { $(document.body).css('background-color', '#fff'); }, 100);
    }
};
