define(function(){


return (function($, rm){

    var instance,
        geocoder, 
        defaultConfig = {
        width: "100%",
        height: "100%",
        panControl: false,
        streetViewControl: false,
        zoom: 2,
        draggableCursor: 'crosshair',
        center: new google.maps.LatLng(31.6253, 0.2319),
        mapTypeId: google.maps.MapTypeId.HYBRID
    }


    /**
     * Initialise a Map
     * 
     * @param {object} node       The HTML node
     * @param {object} userConfig Configuration object
     */
    var Map = function (node, userConfig, ctx) {
        var here = this;
        instance = this;
        this.domNode = node;
        this.config = defaultConfig;
        this.parent = ctx;

        $.extend(this.config, userConfig || {});

        rm.log("Map initialised", this.config)

        
        this.gmap = new google.maps.Map(this.domNode, this.config);



        

        /**
         * Publish Click Events
         */
        google.maps.event.addDomListener(this.gmap, 'click', function (e) {
            if(window.cIgnoreClick) return;
            here.parent.publish("map/click", [e, here]);
        });


        return this;
    }


    /**
     * Move and focus map on a location
     * 
     * @param  {string} location Name of a location
     * @return {object} jQuery Deferred
     */
    Map.prototype.goTo = function(location) {
        var here = this,
            zoom = 8,
            def = new $.Deferred();

        //Initialise geocoder if needed
        if(!this.geocoder){
            this.geocoder = new google.maps.Geocoder();
        }

        this.geocoder.geocode({
            'address' : location
        }, function(results, status) {

            if(status == google.maps.GeocoderStatus.OK){
                here.goToLatLng.apply(here, [results[0].geometry.location]);
                here.zoomTo.apply(here, [zoom]);
                rm.log("Geocode success", location, status);
                def.resolve(status);
            }else{
                rm.log("Geocode failed", location, status);
                def.reject(status)
            }
        });


        return def;

    }


    Map.prototype.setCenter = function (lat, lng) {
        this.gmap.setCenter(new google.maps.LatLng(lat, lng));
    }

    Map.prototype.setZoom = function (zoom) {
        this.gmap.setZoom(zoom);
    }

    Map.prototype.setMapType = function (type) {
        this.gmap.setMapTypeId(type);
    }


    Map.prototype.getCenter = function() {
        var c = this.gmap.getCenter();
        return {
            lat: c.lat(),
            lng : c.lng()
        }
    }

    Map.prototype.getMapTypeId = function() {
        return this.gmap.getMapTypeId();
    };

    Map.prototype.getZoom = function() {
        return this.gmap.getZoom();
    }


    /**
     * Moves the map center to a Lat Long
     * 
     * @param  {object} gLatLng 
     */
    Map.prototype.goToLatLng = function (gLatLng) {
        this.gmap.setCenter(gLatLng);
    }


    /**
     * Zoom to a specified level
     * 
     * @param  {number} zoomLevel
     */
    Map.prototype.zoomTo = function (zoomLevel) {
        this.gmap.setZoom(zoomLevel);
    }





    /**
     * Mode
     */
     Map.prototype.setMode = function (mode) {
        this.mode = mode;

        if(mode){
            this._activateClickListeners()    
        }else{
            this._disableClickListeners()
        }
        
     }







     /**
      * Activate the map click listeners
      * 
      * @return {null} 
      */
    Map.prototype._activateClickListeners = function () {
        google.maps.event.addDomListener(this.gmap, 'click', this._onMapClick);
    }

    /**
     * Disable map click listeners
     * 
     * @return {null} 
     */
    Map.prototype._disableClickListeners = function () {
        google.maps.event.clearListeners(this.gmap, 'click');
    }



    Map.prototype._onMapClick = function (e) {
        var here = instance;


        if(here.mode === "poi"){
            here.mapItems.poi.push(new rm.Poi(here.gmap, e.latLng))
        }
    }



    return rm.fn.Map = Map;
})(jQuery, rm);

});