
/**
 * Marker Base Class
 */
define(['jquery', 'third_party/routemaster/javascript/bootstrap'],function($, rm) {
    (function ($, rm) {
    
        var instance;

        /**
         * Base Constructor
         * 
         * @param {object} map      Map Instance
         * @param {object} location Gmap LatLng instance
         */
        var MarkerBase = function (map, location, ctx) {


        }


        /**
         * Defaults
         */
        MarkerBase.title = "";
        MarkerBase.description = "";
        MarkerBase.type = "";
        MarkerBase.focus = false;
        MarkerBase.defaultMarker = {
            raiseOnDrag:true,
            draggable:true
        };
        
        MarkerBase.get = function (key) {
            if(this[key] !== undefined){
                return this[key];
            }

            return undefined;
        }


        MarkerBase.set = function (key, value) {
            this[key] = value;
        }




        MarkerBase.draw = function () {
            var here = this,
                mConfig = $.extend(this.defaultMarker, {
                    map: this.get("map"),
                    position: this.get("latLng")
                }),
                m = new google.maps.Marker(mConfig);

            google.maps.event.addDomListener(m, 'click', function (e) {
                here.parent.publish("focus", [here]);
                return false;
            })


            this.set("marker", m);
        }


        MarkerBase.setFocus = function (e) {
            if(this.focus){
                return;
            }


            this.get("marker").setIcon(new google.maps.MarkerImage(
                require.toUrl("third_party/routemaster/img/custom_marker.png"),
                new google.maps.Size(20, 35)
            ));

            this.get("marker").setShadow(new google.maps.MarkerImage(
                require.toUrl("third_party/routemaster/img/custom_marker.png"),
                new google.maps.Size(37, 35),
                new google.maps.Point(20 , 0), //Sprite Section Origin
                new google.maps.Point(10 , 35) //Sprite Anchor
            ));



            this.focus = true;
        }


        MarkerBase.unFocus = function (e) {
            if(!this.focus){
                return;
            }

            this.get("marker").setIcon(new google.maps.MarkerImage(
                require.toUrl("third_party/routemaster/img/marker.png"),
                new google.maps.Size(20, 35)
            ));

            this.get("marker").setShadow(new google.maps.MarkerImage(
                require.toUrl("third_party/routemaster/img/marker.png"),
                new google.maps.Size(37, 35),
                new google.maps.Point(20 , 0), //Sprite Section Origin
                new google.maps.Point(10 , 35) //Sprite Anchor
            ));

            this.focus = false;
        }



        MarkerBase.addEventListener = function (evt, handler) {
            google.maps.event.addDomListener(this.get('marker'), evt, handler)
        }


        rm.fn.MarkerBase = MarkerBase;

    })(jQuery, rm);










    /**
     * POI
     */
    (function ($, rm) {


        var Poi = function (map, latLng, ctx) {
            var here = this;
            this.set("type", "poi");
            this.set("map", map);
            this.set("latLng", latLng);
            this.set("parent", ctx)


            this.draw()

            rm.log("POI marker initialised");


            this.remove = function() {
                this.marker.setMap(null);
            };

            this.getState = function() {
                var c = this.marker.getPosition();
                return {
                    entry_id :      null,
                    title:          this.title,
                    description :   this.description,
                    type:           this.type,
                    lat:            c.lat(),
                    lng:            c.lng()
                }
            };


            /**
             * Events
             */
            this.parent.subscribe("focus", function (jQEvent, focusItem) {
                if(focusItem === here){
                    here.setFocus();
                }else{
                    here.unFocus();
                }
            })


            this.parent.publish("focus", [this]);

        }
        Poi.prototype = rm.MarkerBase;




        
        rm.fn.Poi = Poi;

    })(jQuery, rm);






    /**
     * Routes
     */
    (function ($, rm) {
        function Route (map, latLng, ctx) {
            var here = this;
            this.set("type", "route");
            this.set("map", map);
            this.set("parent", ctx);
            this.set("routeFinished", false);
            this.waypoints = new google.maps.MVCArray([latLng]);



            /**
             * Colour Options
             */
            this.routeType = "trek";
            this.focusColour = "#1be300";
            this.colourMap = {
                "trek" : "#ed0000",
                "flight" : "#000000",
                "internal" : "#edea00"
            }

            
            
            /**
             * Direction Symbols
             */
            this.direction = "forward";
            this.totalArrows = 0;
            this.arrowSymbol = {
                path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
                scale: 2,
                strokeColor: this.colourMap[this.routeType]
            }
            this.directionSymbols = [];


            /**
             * Create Polyline
             */
            this.set("gpolyline", new google.maps.Polyline({
                editable: true,
                geodesic: true,
                path: this.waypoints,
                map: this.map,
                strokeOpacity: 0.8,
                strokeColor: this.colourMap[this.routeType],
                icons: this.directionSymbols
            }));

            

            rm.log("Route initialised");



            this.getState = function() {
                var path = [],
                    arrowLocations = [];

                this.gpolyline.getPath().forEach(function(latLng) {
                    path.push({
                        lat: latLng.lat(),
                        lng: latLng.lng()
                    })
                });
                for(var i = 0; i < this.directionSymbols.length; i++){
                    arrowLocations.push(this.directionSymbols[i].offset);
                }

                return {
                    entry_id :      null,
                    title:          this.title,
                    description :   this.description,
                    type:           this.type,
                    routeType:      this.routeType,
                    direction:      this.direction,
                    arrows:         arrowLocations,
                    path:           path
                }
            };



            /**
             * Add Waypoints
             * @param {[type]} latLng [description]
             */
            this.addWayPoint = function (latLng) {
                this.waypoints.push(latLng);
                rm.log(this.waypoints)
            }
            

            this.remove = function() {
                this.gpolyline.setMap(null);
            };


            this.setFocus = function () {
                if(this.focus){
                    return;
                }

                this.gpolyline.setOptions({
                    strokeColor: this.colourMap[this.routeType],
                    strokeOpacity: 1,
                    editable: true
                });

                this.focus = true;
                this.routeFinished = false;
            }
            this.unFocus = function () {
                if(!this.focus){
                    return;
                }

                this.gpolyline.setOptions({
                    strokeColor: this.colourMap[this.routeType],
                    strokeOpacity: 0.8,
                    editable: false
                });

                this.focus = false;
                this.routeFinished = true;
            }

            this.setTotalArrows = function (total) {
                this.totalArrows = Number(total);
                this.updateRouteSymbols();
            }


            this.setDirection = function (direction) {
                this.direction = direction;

                if(this.direction == "forward"){
                    this.arrowSymbol.path = google.maps.SymbolPath.FORWARD_OPEN_ARROW;
                }
                if(this.direction == "reverse"){
                    this.arrowSymbol.path = google.maps.SymbolPath.BACKWARD_OPEN_ARROW;
                }
                if(this.direction == "both") {
                    this.arrowSymbol = {
                        strokeColor : this.colourMap[this.routeType],
                        scale: 2,
                        path: "M -2,3 0,7 2,3 M -2,-3 0,-7 2,-3"
                    }
                }
                this.updateRouteSymbols();
            }


            this.setRouteType = function (type) {
                this.routeType = type;
                this.arrowSymbol.strokeColor = this.colourMap[this.routeType];
                this.updateRouteSymbols();

            }


            this.updateRouteSymbols = function () {
                var a = [],
                    section = 0;
                

                section = 100/(this.totalArrows+1);
                
                for(var i = 1; i <= this.totalArrows; i++){
                    if(section*i > 100) continue;

                    a.push({
                        icon: this.arrowSymbol,
                        offset: (section*i).toFixed(2) + "%"
                    });
                    
                }
                
                this.directionSymbols = a;

                this.gpolyline.setOptions({
                    icons: here.directionSymbols,
                    strokeColor: this.colourMap[this.routeType]
                });
                
                return a;
            }


            /**
             * Events
             */
            
            //Click to select (focus)
            google.maps.event.addDomListener(this.gpolyline, 'click', function (e) {
                here.parent.publish("focus", [here]);
                return false;
            })

            //Right click to remove
            google.maps.event.addDomListener(this.gpolyline, 'rightclick', function (e) {
                here.waypoints.removeAt(e.vertex);
            })

            this.parent.subscribe("focus", function (jQEvent, focusItem) {
                if(focusItem === here){
                    here.setFocus();
                }else{
                    here.unFocus();
                }
            })

            
            this.parent.publish("focus", [this]);

            return this;

        }
        Route.prototype = rm.MarkerBase;





        
        rm.fn.Route = Route;
    })(jQuery, rm);




    /**
     * Icons
     */
    (function ($, rm) {

        var spriteIcons = {
            airport: {x:0, y:0},
            circle: {x:0, y:35},
            peak: {x:0, y:70}
        }


        var Icon = function (map, latLng, ctx) {
            var here = this;
            this.set("iconMap", spriteIcons);
            this.set('focus', false);
            this.set("type", "icon");
            this.set("iconName", "airport");
            this.set("parent", ctx);
            this.set("map", map);
            this.set("latLng", latLng);
            this.set("origin", {x:0, y:0});
            this.set("width", 35);
            this.set("height", 35);
            this.set("iconImage", require.toUrl("third_party/routemaster/img/icons/sprite.png"));

            

            this.draw()


            this.getState = function() {
                var c = this.marker.getPosition();
                return {
                    entry_id :      null,
                    title:          this.title,
                    description :   this.description,
                    type:           this.type,
                    iconName:       this.iconName,
                    lat:            c.lat(),
                    lng:            c.lng()
                }
            };


            this.updateIcon = function () {
                var offset = 0;

                if(this.focus){
                    offset += this.width;
                }

                this.get("marker").setIcon(new google.maps.MarkerImage(
                    this.iconImage,
                    new google.maps.Size(this.width,this.height),
                    new google.maps.Point(this.origin.x+offset, this.origin.y),
                    new google.maps.Point(Math.floor(this.width/2),Math.floor(this.height/2))
                ));
            }


            /**
             * Focus on icon
             */
            this.setFocus = function (e) {
                if(this.focus){
                    return;
                }

                this.focus = true;

                this.updateIcon()
            }




            /**
             * Unfocus from icon
             */
            this.unFocus = function (e) {
                if(!this.focus){
                    return;
                }

                this.focus = false;

                this.updateIcon();
            }




            this.setIcon = function (iconName) {
                if(this.iconMap[iconName]){
                    this.origin.x = this.iconMap[iconName].x;
                    this.origin.y = this.iconMap[iconName].y;
                    this.iconName = iconName;
                    this.updateIcon();
                }
            }



            this.remove = function() {
                this.marker.setMap(null);
            };


            this.parent.subscribe("focus", function (jQEvent, focusItem) {
                if(focusItem === here){
                    here.setFocus();
                }else{
                    here.unFocus();
                }
            })


            this.updateIcon();

            this.parent.publish("focus", [this]);



            rm.log("Icon marker initialised");

            return this;
        }
        



        Icon.prototype = rm.MarkerBase;
        return rm.fn.Icon = Icon;

    })(jQuery, rm);


});
