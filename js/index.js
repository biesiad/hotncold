var app = {
    init: function () {
        // if params query then play view
        var params = this.parseQuery(location.search);
        if (params.lat && params.lon) {
            geo.target = new LatLon(params.lat, params.lon);
            play.init();
        } else {
            home.next = map.init;
            map.next = share.init;
            home.init();
        }
    },
    parseQuery: function (params) {
        var position = params.replace(/[^=\d\.&\w]/g, "").split('&'),
            param, paramsObject = {};

        for (var i = 0; i < position.length; i++) {
            param = position[i].split('=');
            paramsObject[param[0]] = +param[1];
        }
        return paramsObject;
    }
};
var home = {
    init: function () {
        var self = this;
        $('#start').click(function () {
            self.next();
            return false;
        });
    }
};

var map = {
    init: function () {
        var self = map;
        $('#app').html(
            '<div class="map box-input"> \
              <div id="map"> \
              </div> \
            </div> \
            <a href="#" id="track" class="button">track</a>');

        geo.getPosition(function (position) {
            self.initMap(position);
        });
        $('#track').click(function () {
            self.updateMarker(); 
            self.next();
            return false;
        });
    },
    initMap: function (position) {
        var mapWidth = $('#map').width();
        $('#map').parent().height(mapWidth);
        $('#map').height(mapWidth);
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
        var position = map.map.getCenter();
        geo.target = new LatLon(position.lat(), position.lng());
    }
};

var share = {
    init: function () {
        var url = location.href + '?lat=' + geo.target.lat() + '&lon=' + geo.target.lon();
        $.get('http://api.bitly.com/v3/shorten?login=biesiad&apiKey=R_40292ebe9401d2a38f3ceb02d4b4b204&longUrl=' + url, function (data) { 
            url = data.data.url || url;
            $('#app').html(
                '<div class="box"> \
                   <p>Share this link with your friend and wish him luck :)</p> \
                   <a href="" id="play_link"></a> \
                   <a href="https://twitter.com/share" class="twitter-share-button" data-url="abc" data-text="' + url + ' #playhotncold" data-count="none">Tweet</a><script type="text/javascript" src="//platform.twitter.com/widgets.js"></script> \
                 </div>');
            $('#play_link').text(url);
            $('#play_link').attr('href', url);
        });
    }
};

var play = {
    init: function () {
        var self = play;
        $('#app').html(
            '<div class="compass box"> \
              <p id="direction">Are you moving?</p> \
              <p id="to_target"></p> \
            </div> \
            <p id="accuracy"></p>');
       geo.watchPosition(self.onPosition);
    },
    onPosition: function (position) {
        var pos = position.coords;
        var currentPosition = new LatLon(pos.latitude, pos.longitude);
        var toTarget = geo.target.distanceTo(currentPosition, 10);
        if (toTarget * 1000 < 10) {
            geo.clearWatch();
            if (play.isMovingId) { clearTimeout(play.isMoving); }
            $('#direction').text('You Are There!').removeClass().addClass('success');
            return;
        }

        var toTargetDelta = localStorage.getItem('toTarget') ? (toTarget - localStorage.getItem('toTarget')) : 0;
        if (toTargetDelta === 0) {
            $('#direction').text('Are you moving?').removeClass().addClass('stop');
        } else if (toTargetDelta > 0) {
            $('#direction').text('Cold').removeClass().addClass('cold');
        } else {
            $('#direction').text('Hot').removeClass().addClass('hot');
        }

        var el = $('<div>');
        el.append('<p>' + ~~(toTarget*1000) + 'm to target</p>');
        $('#to_target').html(el);
        $('#accuracy').html('accuracy: ' + pos.accuracy + 'm');

        localStorage.setItem('toTarget', toTarget);
        play.flash('#f6f3e6');
        play.isMoving();
    },
    isMoving: function () {
        if (play.isMovingId) { clearTimeout(play.isMoving); }
        play.isMovingId = setTimeout(function () {
            $('#direction').text('Are you moving?').removeClass().addClass('stop');
            play.isMoving();
        }, 5000);
    },
    flash: function (color) {
        var oldColor = $('.compass').css('background-color');
        $('.compass').css('background-color', color);
        setTimeout(function () { $('.compass').css('background-color', oldColor); }, 200);
    }
};

var geo = {
    getPosition: function(onPosition) {
        // if watchPosition active, getCurrentPosition will not respond
        // clearing watch first
        if (this.watchId) { navigator.geolocation.clearWatch(this.watchId); }
        navigator.geolocation.getCurrentPosition(onPosition, this.onPositionChangeError, { enableHighAccuracy: true, maximumAge: 0 });
    },
    watchPosition: function(onPosition) {
        if (this.watchId) { navigator.geolocation.clearWatch(this.watchId); }
        this.watchId = navigator.geolocation.watchPosition(onPosition, this.onPositionError, { enableHighAccuracy: true, maximumAge: 0 });
    },
    clearWatch: function () {
        if (this.watchId) { navigator.geolocation.clearWatch(this.watchId); }
    },
    onPositionError: function () {
        console.log('position error: ' + arguments);
    }
};

$(function () { 
    app.init(); 
});
