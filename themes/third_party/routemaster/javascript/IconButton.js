(function ($, rm) {

    var IconButton = function (node, ctx) {

        var here = this,
            active = false,
            parent = ctx;


        this.domNode = $(node);
        this.btn = $("<span/>").addClass("button icon").text("Icon").appendTo(this.domNode);

        this.btn.click(function () {
            if(!active){
                parent.publish('mode', ['icon']);
            }
        })



        parent.subscribe("mode", function (jQEvent, mode) {
            if(mode === "icon"){
                active = true;
                here.btn.addClass("active");
            }else{
                active = false;
                here.btn.removeClass("active");
            }
        })
    }


    rm.fn.IconButton = IconButton;
})(jQuery, rm)