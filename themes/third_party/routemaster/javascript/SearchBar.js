(function($, rm){

    



    var SearchBar = function (node, ctx) {
        var here = this,
            defaultState = true,
            parent = ctx;


        this.domNode = $(node);

        rm.log("Search Bar Initialised")

        this.input = $("<input/>").attr({
            "value": "Search",
            "type" : "text",
            "class" : "search"
        }).appendTo(this.domNode);
        


        /**
         * Events
         */
        
        this.input.click(function (e) {
            //Clear if in default state
            if(defaultState){
                here.input.val("");
            }
            defaultState = false;
        })
        this.input.keypress(function (e) {
            
            //Search on enter
            if(e.keyCode === 13){
                e.preventDefault();
                parent.publish("map/search", [here.input.val()]);
                return;
            }

            //Clear if in default state
            if(defaultState){
                here.input.val("");
            }
            defaultState = false;

        })

        return this;
    }

    rm.fn.SearchBar = SearchBar;
})(jQuery, rm);