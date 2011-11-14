var app = {
    init: function () {
        this.routing();
        $(window).bind('hashchange', this.routing);
    },
    routing: function () {
        app.loading();
        var view = location.hash ? location.hash.replace(/(^.*#|\/.*$)/g, "") : 'home';
        views[view].init();
    },
    loading: function () {
        $('#app').html(
            '<div class="loading"> \
              <img src="images/loading.gif" class="loading"> \
            </div>');
    }
};

var views = {};
views.home = {
    init: function () {
        location.hash = "home";
        this.render();
    },
    render: function () {
        var self = this;
        $('#app').load('views/home.html');
    },
};

views.spot = {
    init: function () {
        this.render();
    },
    render: function () {
        var self = this;
        $('#app').load('views/spot.html', function () { self.onRender(); });
    },
    onRender: function () {
        var self = this;
        self.mapElement = $('#map');
        self.resizeMap();        
        geo.getPosition(function (position) {
            self.initMap(position.coords);
            self.updateMarker(); 
        });
        this.share = $('#share');
    },
    initMap: function (position) {
        var self = this, 
            latlng = new google.maps.LatLng(position.latitude, position.longitude),
            mapOptions = { zoom: 16, center: latlng, mapTypeId: google.maps.MapTypeId.ROADMAP },
            marker;

        self.map = new google.maps.Map(self.mapElement[0], mapOptions);
        google.maps.event.addListener(self.map, 'dragend', function () { self.updateMarker(); });
        marker = self.getMarker(self.map);
        marker.bindTo('position', self.map, 'center'); 
    },
    getMarker: function (map) {
        var crosshairShape = { coords:[0,0,20,20], type:'rect' },
            marker = new google.maps.Marker({
                map: map,
                icon: 'http://www.daftlogic.com/images/cross-hairs.gif',
                shape: crosshairShape
            });
        return marker;
    },
    resizeMap: function () {
        var mapWidth = this.mapElement.width();
        this.mapElement.parent().height(mapWidth);
        this.mapElement.height(mapWidth);
    },
    updateMarker: function () {
        var position = this.map.getCenter();
        this.share.attr('href', '#share/' + btoa(position.lat() + '|' + position.lng()));
    }
};

views.share = {
    init: function () {
        this.render();
    },
    render: function () {
        var self = this;
        $('#app').load('views/share.html', function () { self.onRender() });
    },
    onRender: function () {
        var data = atob(location.hash.replace('#share/', '')).split('|');
        this.target = { latitude: data[0], longitude: data[1] };
        this.gameUrl = location.href.replace('share', 'play');
        this.playLink = $('#play_link');
        this.playLink.html(this.gameUrl);
        this.playLink.attr('href', encodeURIComponent(this.gameUrl));
    }
};

views.play = {
    init: function () {
        var self = this,
        data = atob(location.hash.replace('#play/', '')).split('|');
        self.target = { latitude: data[0], longitude: data[1] };
        localStorage.setItem('toTarget', 0);
        geo.getPosition(function (position) {
            self.startPosition = position.coords;
            self.render();
        });
    },
    render: function () {
        var self = this;
        $('#app').load('views/play.html', function () { self.onRender(); });
    },
    onRender: function () {
        this.direction = $('#direction');
        this.toTarget = $('#to_target');
        this.accuracy = $('#accuracy');
        this.onPosition(this.startPosition);
        this.start();
    },
    start: function ()  {
        var self = this;
        geo.watchPosition(function (position) { self.onPosition(position.coords) });
    },
    stop: function () {
        geo.clearWatch();
        if (this.isMovingId) { clearTimeout(this.isMovingId); }
        this.direction.text('You Are There!').removeClass().addClass('success');
    },
    onPosition: function (position) {
        var toTarget = geo.distance(this.target.latitude, this.target.longitude, position.latitude, position.longitude),
            toTargetDelta = toTarget - localStorage.getItem('toTarget');
        
        this.update({
            toTarget: +toTarget,
            toTargetDelta: +toTargetDelta,
            accuracy: +position.accuracy
        });
        
        // end game if toTarget < 10 meters
        if (toTarget * 1000 < 10) {
            this.stop();
            return;
        }
        
        localStorage.setItem('toTarget', toTarget);
        this.checkIsMoving();
    },
    update: function (data) {
        if (data.toTargetDelta === 0) {
            this.direction.text('Are you moving?').removeClass().addClass('stop');
        } else if (data.toTargetDelta > 0) {
            this.direction.text('Cold').removeClass().addClass('cold');
        } else {
            this.direction.text('Hot').removeClass().addClass('hot');
        }
        this.toTarget.html('<p>' + ~~(data.toTarget * 1000) + 'm to target</p>');
        this.accuracy.html('accuracy: ' + data.accuracy + 'm');
    },
    checkIsMoving: function () {
        // if this.onPosition not called for 10 seconds
        // set update #direction information

        if (this.isMovingId) { clearTimeout(this.isMovingId); }
        var self = this;
        this.isMovingId = setTimeout(function () {
            self.direction.text('Are you moving?').removeClass().addClass('stop');
            self.checkIsMoving();
        }, 5*1000);
    },
};

views.faq = {
    init: function () {
        this.render();
    },
    render: function () {
        $('#app').load('views/faq.html');
    }
};

views.error = {
    show: function (message) {
        $('#app').html(
            '<div class="error box"> \
                <h1>' + message + '</h1> \
            </div>');
    }
};

var geo = {
    getPosition: function(onPosition) {
        // if watchPosition active, getCurrentPosition will not respond
        // clearing watch first
        if (navigator.geolocation) {
            if (this.watchId) { navigator.geolocation.clearWatch(this.watchId); }
            navigator.geolocation.getCurrentPosition(onPosition, this.onPositionError, { enableHighAccuracy: true, maximumAge: 0 });
        } else {
            views.error.show('No geolocation available, sorry...');
        }
    },
    watchPosition: function(onPosition) {
        if (navigator.geolocation) {
            if (this.watchId) { navigator.geolocation.clearWatch(this.watchId); }
            this.watchId = navigator.geolocation.watchPosition(onPosition, this.onPositionError, { enableHighAccuracy: true, maximumAge: 0 });
        } else {
            views.error.show('No geolocation available, sorry...');
        }
    },
    clearWatch: function () {
        if (this.watchId) { navigator.geolocation.clearWatch(this.watchId); }
    },
    onPositionError: function (error) {
        var errors = { 
            1: 'Please allow this site to find your position first',
            2: 'Position unavailable',
            3: 'Request timeout'
        };
        views.error.show(errors[error.code]);
    },
    distance: function(x1, y1, x2, y2) {
        var r = 6371,
           i;
           
        for(i in arguments) {
           if(arguments.hasOwnProperty(i)) {
               arguments[i] = Math.PI * arguments[i] / 180;
           }
        }

        return r * Math.sqrt(
            2 - 2 * (
            Math.cos(x1)*Math.cos(x2)*Math.cos(y1-y2) +
                (Math.sin(x1) * Math.sin(x2))
            )
        );
    }
};

$(function () {
    app.init();
});
