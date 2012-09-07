/**
 * Load dependencies and do any feature detection needed
 */
define(['jquery',], function(jQuery) {
    

    var assets = [
        "third_party/routemaster/javascript/Field",
        "third_party/routemaster/javascript/Map",
        "third_party/routemaster/javascript/SearchBar",
        "third_party/routemaster/javascript/SideBar",
        "third_party/routemaster/javascript/PoiButton",
        "third_party/routemaster/javascript/IconButton",
        "third_party/routemaster/javascript/RouteButton",
        "third_party/routemaster/javascript/LabelButton",
        "third_party/routemaster/javascript/Markers",
        "third_party/routemaster/javascript/markerWithLabel",
        require.toUrl('third_party/routemaster/javascript/utilities.js')
    ]






    return (function($){
        //GLobal Object
        var Rm = function(){
            /**
             * Setup
             */
        };


        
        Rm.prototype.fn  = Rm.prototype;


        /**
         * Utilities
         */
         Rm.prototype.log = function() {
            if(!console) return;

            console.log(arguments);
         }


        /**
         * Expose the obect to the rest of the DOM
         */
        window.rm = new Rm();

        //Load the rest
        require(assets, function() {
            $(document).ready(function () {
                $(".routemaster_field").each(function() {
                    new rm.Field($(this).find(".map_canvas")[0], $(this).find(".map_state")[0]);
                })
            });
        })


        /**
         * Register a single form listener to check title is filled in
         */
        $("input#title").closest("form").submit(function(e) {
            if(!$("input#title").val()){
                e.preventDefault();
                alert("Title field is required");
                return false
            }
            return true;
        })


        return window.rm;

    })(jQuery);
});














