(function ($, rm) {

    var RouteButton = function (node, ctx) {

        var here = this,
            active = false,
            parent = ctx;


        this.domNode = $(node);
        this.btn = $("<span/>").addClass("button route").text("Route").appendTo(this.domNode);


        this.btn.click(function () {
            if(!active){
                
                parent.publish('mode', ['route']);
            }
        })


        parent.subscribe("mode", function (jQEvent, mode) {
            if(mode === "route"){
                active = true;
                here.btn.addClass("active");
            }else{
                active = false;
                here.btn.removeClass("active");
            }
        })
    }


    rm.fn.RouteButton = RouteButton;
})(jQuery, rm)