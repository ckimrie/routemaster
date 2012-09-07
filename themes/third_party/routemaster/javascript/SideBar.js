(function($, rm){

    var config = {
        width: "30%"
    }

    var SideBar = function (node, ctx) {
        var here = this,
            parent = ctx;

        rm.log("Side Bar Initialised")

        this.isOpen = false;
        this.domNode = $(node);
        this.currentFocusItem;
        this.template = this._buildTemplate(parent);

        
        //Attach elements
        this.template.appendTo(this.domNode)


        //UI Elements
        this.closeBtn = $("<span/>").addClass("close").appendTo(this.domNode);
        




        /**
         * Events
         */
        this.closeBtn.click(function (e) {
            e.preventDefault();

            if(here.isOpen){
                here.close.apply(here);
            }else{
                here.open.apply(here);
            }
        });


        // Subscribe to focus event
        parent.subscribe("focus", function (jQEvent, focusItem) {
            if(!focusItem)return;
            rm.log("Sidebar focus", focusItem);

            here.currentFocusItem = focusItem;
            here.render();
            here.open();
        })

        return this;
    }



    /**
     * Open sidebar
     * 
     * @return {null} 
     */
    SideBar.prototype.open = function () {
        this.domNode.css("width", config.width);
        this.isOpen = true;
    }

    /**
     * Close Sidebar
     * 
     * @return {null} 
     */
    SideBar.prototype.close = function () {
        this.domNode.css("width", 0);
        this.isOpen = false;
    }




    SideBar.prototype.render = function () {
        if(this.currentFocusItem.get("type") === "poi"){
            this.heading.text("Point of Interest");
            this.iconSelect.hide();
            this.descriptionLabel.show();
            this.descriptionInput.show();
            this.arrowCountLabel.hide();
            this.arrowCountInput.hide();
            this.routeTypeLabel.hide();
            this.routeTypeInput.hide();
            this.arrowDirectionLabel.hide();
            this.arrowDirectionInput.hide();
        }
        if(this.currentFocusItem.get("type") === "route"){
            this.heading.text("Route");
            this.iconSelect.hide();
            this.descriptionLabel.show();
            this.descriptionInput.show();
            this.arrowCountLabel.show();
            this.arrowCountInput.show();
            this.routeTypeLabel.show();
            this.routeTypeInput.show();
            this.arrowDirectionLabel.show();
            this.arrowDirectionInput.show();
        }
        if(this.currentFocusItem.get("type") === "icon"){
            this.heading.text("Icon");

            this.iconSelect.find(".icon").removeClass("active");
            this.iconSelect.find(".icon."+this.currentFocusItem.get("iconName")).addClass("active")

            this.iconSelect.show();
            this.descriptionLabel.hide();
            this.descriptionInput.hide();
            this.arrowCountLabel.hide();
            this.arrowCountInput.hide();
            this.routeTypeLabel.hide();
            this.routeTypeInput.hide();
            this.arrowDirectionLabel.hide();
            this.arrowDirectionInput.hide();
        }
        if(this.currentFocusItem.get("type") === "label"){
            this.heading.text("Label");
            this.iconSelect.hide();
            this.descriptionLabel.hide();
            this.descriptionInput.hide();
            this.arrowCountLabel.hide();
            this.arrowCountInput.hide();
            this.routeTypeLabel.hide();
            this.routeTypeInput.hide();
            this.arrowDirectionLabel.hide();
            this.arrowDirectionInput.hide();
        }




        this.titleInput.val(this.currentFocusItem.get("title"));
        this.descriptionInput.val(this.currentFocusItem.get("description"));
        this.arrowCountInput.val(this.currentFocusItem.get("totalArrows"));

        this.routeTypeInput.find("option").prop("selected", false);
        this.routeTypeInput.find("[value="+this.currentFocusItem.get("routeType")+"]").prop("selected", true);
        this.arrowDirectionInput.find("option").prop("selected", false);
        this.arrowDirectionInput.find("[value="+this.currentFocusItem.get("direction")+"]").prop("selected", true);
    }



    SideBar.prototype._buildTemplate = function (ctx) {
        /**
         * Heading
         * Title
         * Description
         * Icon
         * Colour
         * Accept
         * Delete
         */
        var here = this,
            parent = ctx;

        /**
         * Heading
         */
        this.heading = $("<h3></h3>");


        /**
         * Title
         */
        this.titleLabel = $("<label class='marker_title' for='marker_title'>Title</label>");
        this.titleInput = $("<input id='marker_title' class='marker_title' />");
        this.titleInput.keyup(function (e) {
            if(e.keyCode === 13){
                e.preventDefault();
                here.titleInput.blur();
                return;
            }
            here.currentFocusItem.setTitle(here.titleInput.val());
        });


        /**
         * Description
         */
        this.descriptionLabel = $("<label class='marker_description' for='marker_description'>Description</label>");
        this.descriptionInput = $("<textarea id='marker_description' class='marker_description'></textarea>");
        this.descriptionInput.keyup(function (e) {
            here.currentFocusItem.set("description", here.descriptionInput.val());
        });


        /**
         * Total Arrows
         */
        this.arrowCountLabel = $("<label class='route_arrow_count' for='route_arrow_count'>Number of Arrows</label>");
        this.arrowCountInput = $("<input id='route_arrow_count' class='route_arrow_count' type=\"range\" min='0' max='50' step='1' value=\"0\"/>");
        this.arrowCountInput.change(function (e) {
            if(isNaN(Number(here.arrowCountInput.val()))) return;
            here.currentFocusItem.setTotalArrows(here.arrowCountInput.val());
        });

        /**
         * Route type (ie: colour)
         */
        this.routeTypeLabel = $("<label class='route_type' for='route_type'>Route Type</label>");
        this.routeTypeInput = $("<select id='route_type' class='route_type'><option value=\"trek\">Trek</option><option value=\"flight\">Flight</option><option value=\"internal\">Internal Transfer</option></select>");
        this.routeTypeInput.change(function (e) {
            here.currentFocusItem.setRouteType($(this).find(":selected").val());
        });


        this.arrowDirectionLabel = $("<label class='route_type' for='route_type'>Arrow Direction</label>");
        this.arrowDirectionInput = $("<select id='route_type' class='route_type'><option value=\"forward\">Forward</option><option value=\"reverse\">Reverse</option><option value=\"both\">Both</option></select>");
        this.arrowDirectionInput.change(function (e) {
            here.currentFocusItem.setDirection($(this).find(":selected").val());
        });


        /**
         * Icon Grid
         */
        this.iconSelect = $("<div class='iconGrid'>"
                            + "<label>Icon</label>"
                            + "<span class='airport icon active' data-icon='airport' title='Airport'></span>"
                            + "<span class='circle icon' data-icon='circle' title='Circle'></span>"
                            + "<span class='peak icon' data-icon='peak' title='Peak'></span>"
                            + "<span class='walk icon' data-icon='walk' title='Day Walk'></span>"
                            + "</div>");
        this.iconSelect.find(".icon").click(function (e) {
            here.iconSelect.find(".icon").removeClass("active");
            $(this).addClass("active");
            here.currentFocusItem.setIcon($(this).data("icon"));
        })


        /**
         * Save / Delete
         */
        this.saveControls = $("<div class='saveControls'>"
                                + "<div class='saveBtn btn'>Done</div>"
                                + "<div class='deleteBtn btn'>Delete</div>"
                                + "</div>");
        this.saveControls.find('.saveBtn').click(function (e) {
            e.preventDefault();
            
            parent.publish("save", [here.currentFocusItem]);
            parent.publish("stateChange");
        });
        this.saveControls.find('.deleteBtn').click(function (e) {
            e.preventDefault();
            
            parent.publish("delete", [here.currentFocusItem]);
            parent.publish("stateChange");
        });


        //Close sidebar on save and delete
        parent.subscribe("save", function(e) {
            e.preventDefault();
            here.currentFocusItem.unFocus();
            here.close()
        });
        parent.subscribe("delete", function(e) {
            e.preventDefault();
            here.currentFocusItem.unFocus();
            here.close()
        });

        return $()
            .add(this.heading)
            .add(this.titleLabel)
            .add(this.titleInput)
            .add(this.descriptionLabel)
            .add(this.descriptionInput)
            .add(this.arrowCountLabel)
            .add(this.arrowCountInput)
            .add(this.routeTypeLabel)
            .add(this.routeTypeInput)
            .add(this.arrowDirectionLabel)
            .add(this.arrowDirectionInput)
            .add(this.iconSelect)
            .add(this.saveControls);
    }



    rm.fn.SideBar = SideBar;
})(jQuery, rm);