(function ($, rm) {

    var LabelButton = function (node, ctx) {

        var here = this,
            active = false,
            parent = ctx;


        this.domNode = $(node);
        this.btn = $("<span/>").addClass("button label").text("Icon").appendTo(this.domNode);

        this.btn.click(function () {
            if(!active){
                parent.publish('mode', ['label']);
            }
        })



        parent.subscribe("mode", function (jQEvent, mode) {
            if(mode === "label"){
                active = true;
                here.btn.addClass("active");
            }else{
                active = false;
                here.btn.removeClass("active");
            }
        })
    }


    rm.fn.LabelButton = LabelButton;
})(jQuery, rm)