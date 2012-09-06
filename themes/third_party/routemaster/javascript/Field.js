/**
 * Route Master Fieldtype
 */
define(['jquery', './bootstrap'], function($, rm){


    var Field = function (node, storageNode) {
        var here = this;

        this.domNode = node;
        this.storageNode = storageNode;
        this.mode = "";
        this.readonly = $(this.storageNode).attr("readonly") ? true : false;

        /**
         * Create sub nodes
         */
        $(this.domNode).addClass("routeMaster");
        this.layouts  = {
            map : $("<div/>").addClass("mapWrapper").appendTo(this.domNode),
            controls : !this.readonly ? $("<div/>").addClass("controlWrapper").appendTo(this.domNode) : null,
            search : !this.readonly ? $("<div/>").addClass("searchWrapper").appendTo(this.domNode) : null,
            sidebar: !this.readonly ? $("<div/>").addClass("sidebarWrapper").appendTo(this.domNode) : null
        };


        /**
         * Initialise components
         */

        this.map = new rm.Map(this.layouts.map[0], {}, this);
        if (!this.readonly) {
            this.search = new rm.SearchBar(this.layouts.search[0], this);
            this.sidebar = new rm.SideBar(this.layouts.sidebar[0], this);
            this.poiBtn = new rm.PoiButton(this.layouts.controls[0], this);
            this.routeBtn = new rm.RouteButton(this.layouts.controls[0], this);
            this.iconBtn = new rm.IconButton(this.layouts.controls[0], this);
            this.labelBtn = new rm.LabelButton(this.layouts.controls[0], this);
        }




        //Setup UI Elements
        this.currentItem = null;
        this.mapItems = {
            poi : [],
            routes : [],
            icons : [],
            labels : []
        };


        /**
         * Existing Data? (ie: Edit mode)
         */
        if($(this.storageNode).val()) {
            var existingData = JSON.parse($(this.storageNode).val());

            this.loadData(existingData);
        }


        /**
         * Textarea to store state
         */
        this.storage = {
            update: function () {
                var i = 0,
                    json = {};


                //Map
                json.map = {
                    center:     here.map.getCenter(),
                    zoom:       here.map.getZoom(),
                    mapTypeId:  here.map.getMapTypeId()
                };

                //POI
                json.poi = [];
                for (i = 0; i < here.mapItems.poi.length; i++) {
                    json.poi.push(here.mapItems.poi[i].getState());
                }

                //Icons
                json.icons = [];
                for (i = 0; i < here.mapItems.icons.length; i++) {
                    json.icons.push(here.mapItems.icons[i].getState());
                }

                //Routes
                json.routes = [];
                for (i = 0; i < here.mapItems.routes.length; i++) {
                    json.routes.push(here.mapItems.routes[i].getState());
                }

                $(here.storageNode).val(JSON.stringify(json));
            }
        };

        this.storage.update();



        /**
         * Events
         */

        //Search
        this.subscribe("map/search", function (e, location) {
            here.map.goTo(location).fail(function (message, search, status) {
                alert(message + " - " + status);
            });
        });


        // Mode
        this.subscribe("mode", function (e, mode) {
            rm.log("Map mode set to:", mode);
            here.mode = mode;
        });

        // Update on change
        this.subscribe("stateChange", function (e, mode) {
            here.storage.update();
        });

        //Update on submit of parent form
        $(this.domNode).closest("form").submit(function () {
            here.storage.update();
            return true;
        });

        //Delete Selected Marker
        this.subscribe("delete", function (e, itemToDelete) {
            //Remove artefacts from map
            itemToDelete.remove();

            //Remove from collection
            if (itemToDelete.get("type") === "poi") {
                here.mapItems.poi = here.mapItems.poi.filter(function (item) {
                    if (item !== itemToDelete) return true;

                    return false;
                });
            }
            if (itemToDelete.get("type") === "route") {
                here.mapItems.routes = here.mapItems.routes.filter(function (item) {
                    if(item !== itemToDelete) return true;
                    item = null;
                    return false;
                });
            }
            if (itemToDelete.get("type") === "icon") {
                here.mapItems.icons = here.mapItems.icons.filter(function (item) {
                    if(item != itemToDelete) return true;
                    item = null;
                    return false;
                });
            }

            if (itemToDelete.get("type") === "label") {
                here.mapItems.labels = here.mapItems.labels.filter(function (item) {
                    if(item != itemToDelete) return true;
                    item = null;
                    return false;
                });
            }
        });

        //Map click
        this.subscribe("map/click", function (jQEvent, e, mapCtx) {

            if (!here.mode || here.readonly) {
                return;
            }

            if (!here.currentItem) {
                here.currentItem = {
                    unFocus: function () {},
                    get: function () {}
                };
            }

            if (here.mode === "poi") {
                here.currentItem.unFocus();
                var m = new rm.Poi(mapCtx.gmap, e.latLng, here);

                here.currentItem = m;
                here.publish("focus", [m]);
                here.mapItems.poi.push(m);

            }


            if (here.mode === "icon") {
                here.currentItem.unFocus();
                var m = new rm.Icon(mapCtx.gmap, e.latLng, here);

                here.currentItem = m;
                here.publish("focus", [m]);
                here.mapItems.icons.push(m);

            }



            if (here.mode === "label") {
                here.currentItem.unFocus();
                var m = new rm.Label(mapCtx.gmap, e.latLng, here);

                here.currentItem = m;
                here.publish("focus", [m]);
                here.mapItems.labels.push(m);

            }


            if (here.mode === "route") {
                if (!here.currentItem || here.currentItem.get("type") !== "route" || here.currentItem.get("routeFinished")) {
                    here.currentItem.unFocus();
                    var m = new rm.Route (mapCtx.gmap, e.latLng, here);

                    here.currentItem = m;
                    here.publish("focus", [m]);
                    here.mapItems.routes.push(m);

                } else if(here.currentItem.get("type") === "route"){
                    here.currentItem.addWayPoint(e.latLng);
                }
            }

            
        })
    }










    /**
     * Pub / Sub
     */
    
    Field.prototype.publish = function (evtName, data) {
        $(this.domNode).trigger(evtName, data);
    }

    Field.prototype.subscribe = function (evtName, callback){
        $(this.domNode).on(evtName, callback);
    }


    /**
     * Load Existing Data for Editing
     * 
     */
    Field.prototype.loadData = function (data) {
        var here = this;
        console.log(data);

        /**
         * Map
         */
        
        //Center
        this.map.setCenter(data.map.center.lat, data.map.center.lng);

        //Zoom
        this.map.setZoom(data.map.zoom);

        //Type
        this.map.setMapType(data.map.mapTypeId);


        /**
         * POI
         */
        for (i = 0; i < data.poi.length; i++) {
            var poi = new rm.Poi(here.map.gmap, new google.maps.LatLng(data.poi[i].lat, data.poi[i].lng), here);

            poi.title = data.poi[i].title;
            poi.description = data.poi[i].description;

            here.mapItems.poi.push(poi);
        }

        //Icons
        for (i = 0; i < data.icons.length; i++) {
            var icon = new rm.Icon(here.map.gmap, new google.maps.LatLng(data.icons[i].lat, data.icons[i].lng), here);

            icon.title = data.icons[i].title;
            icon.description = data.icons[i].description;
            icon.setIcon(data.icons[i].iconName);

            here.mapItems.icons.push(icon);
        }


        //Routes
        for (i = 0; i < data.routes.length; i++) {
            var route = new rm.Route(here.map.gmap, new google.maps.LatLng(data.routes[i].path[0].lat, data.routes[i].path[0].lng), here);
            
            route.title = data.routes[i].title;
            route.description = data.routes[i].description;
            route.setDirection(data.routes[i].direction);
            route.setRouteType(data.routes[i].routeType);
            
            route.setPath(data.routes[i].path, data.routes[i].arrows);
            
            here.mapItems.routes.push(route);

        }
    }





    rm.fn.Field = Field;


    return Field;
});