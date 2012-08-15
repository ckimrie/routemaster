define(['jquery', './bootstrap'], function($, rm) {
    return (function ($, rm) {

        var PoiButton = function (node, ctx) {

            var here = this,
                active = false,
                parent = ctx;


            this.domNode = $(node);
            this.btn = $("<span/>").addClass("button poi").text("POI").appendTo(this.domNode);



            this.btn.click(function () {
                if(!active){
                    parent.publish('mode', ['poi']);
                }
                
            });


            parent.subscribe("mode", function (jQEvent, mode) {
                if(mode === "poi"){
                    active = true;
                    here.btn.addClass("active");
                }else{
                    active = false;
                    here.btn.removeClass("active");
                }
            })
        }


        return rm.fn.PoiButton = PoiButton;
    })(jQuery, rm);
});