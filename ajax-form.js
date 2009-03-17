YAHOO.namespace("nixmc");

(function(){
    
    // Constructor
    YAHOO.nixmc.AjaxForm = function(el, attr) {
        attr = attr || {};
        if (arguments.length === 1 && !YAHOO.lang.isString(el) && !el.nodeName) {
            attr = el; // treat first arg as attr object
            el = attr.element || null;
        }
        // Call the superclass constructor (YAHOO.util.Element)
        YAHOO.nixmc.AjaxForm.superclass.constructor.call(this, el, attr);        
    };
    
    YAHOO.extend(YAHOO.nixmc.AjaxForm, YAHOO.util.Element);
    
    // Shortcuts
    var proto = YAHOO.nixmc.AjaxForm.prototype,
        Conn = YAHOO.util.Connect,
        Event = YAHOO.util.Event;

    // Hidden functions
    var _debug = function(msg){
        var method = (console && console.log) || alert;
        method(msg);
    };
    
    var _gatherInputs = function() {
        // Gather all form inputs
        var input_types = ["input", "textarea", "button"],
            inputs = [],
            elements = [];
        for (var idx in input_types) {
            elements = this.getElementsByTagName(input_types[idx]);
            for (var i = 0; i < elements.length; i++) {
                // Convert all inputs to YAHOO.util.Element instances
                inputs.push(new YAHOO.util.Element(elements[i]));
            }
        }
        return inputs;
    };
    
    var _toggleFormInputs = function() {
        var input, disabled;
        // Toggle the disabled state on each input
        for (var idx in this.inputs) {
            input = this.inputs[idx];
            // Toggle the disabled state
            input.get("element").disabled = !input.get("element").disabled
            // Add/remove disabled class to/from the input
            if (input.get("element").disabled) {                
                input.addClass("disabled");
            } else {
                input.removeClass("disabled");
            }
            // Notify listeners
            this.fireEvent(input.get("element").disabled ? "inputDisabled" : "inputEnabled", input);
        }
    };
    
    var _sendRequest = function() {
        // Trigger the beforeSendRequest event, and allow the request to be
        // cancelled by any listeners
        if (this.fireEvent("beforeSendRequest") === false) {
            return;
        }

        var form = this.form;
        var callback = {
            start: function(o) {
                this.fireEvent("start", o);
            },
            complete: function(o) {
                this.fireEvent("complete", o);
            },
            success: function(o) {
                this.get("element").innerHTML = o.responseText;
                this.setup();
                this.fireEvent("success", o);
            },
            failure: function(o){
                alert("Oops, there was a problem, please try again");
                _toggleFormInputs.apply(this);
                this.fireEvent("failure", o);
            },
            abort: function(o){
                this.fireEvent("abort", o);
            },
            scope: this
        };
    
        // Subscribe to events from YAHOO.util.Connect
        Conn.startEvent.subscribe(callback.start);
        Conn.completeEvent.subscribe(callback.complete);
        Conn.abortEvent.subscribe(callback.abort);
            
        // Submit the form asynchronously
        Conn.setForm(form.get("element"));
        Conn.asyncRequest(form.get("method"), form.get("action"), callback, "AJAX_REQUEST=1");

        // Disable the form
        _toggleFormInputs.apply(this);
    };
    
    proto.setup = function() {
        // Get the first form in this Element
        this.form = this.getElementsByTagName("form")[0] || null;
        if (this.form) {
            this.form = new YAHOO.util.Element(this.form);
            this.inputs = _gatherInputs.apply(this);
        }

        // Listen for the form submission event
        if (this.form !== null) {
            this.form.on("submit", function(ev){
                Event.stopEvent(ev);
                _sendRequest.apply(this);
            }, this, true);
        }
    };
    
    proto.getForm = function() {
        return this.form;
    };
    
    proto.getFormElement = function() {
        return this.form.get("element");
    };
    
    proto.getInputs = function() {
        return this.inputs;
    };

    proto.getElement = function() {
        return this.get("element");
    };
    
})();

YAHOO.register("nixmc.AjaxForm", YAHOO.nixmc.AjaxForm, {version: "0.1", build: "1"});
