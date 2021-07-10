(function(a){
  var originalConsole;
  if(typeof a.console !== undefined || typeof console !== undefined){
    originalConsole = a.console || console;
  }
  var max_depth = 3;
  var ots_space = "  ";
  
  function isArray(obj){
    return Object.prototype.toString.call(obj) === "[object Array]";
  }
  
  function oTS(obj, depth) {
    //create an array that will later be joined into a string.
    if (depth === max_depth) {
      return "...";
    }
    var string = [];

    //is object
    //    Both arrays and objects seem to return "object"
    //    when typeof(obj) is applied to them. So instead
    //    I am checking to see if they have the property
    //    join, which normal objects don't have but
    //    arrays do.
    if (typeof obj === "undefined") {
      return "undefined";

    } else if(obj === null){
      return "null";

    } else if(typeof obj === "boolean"){
      return obj.toString();
      
    } else if(typeof obj === "number"){
      return obj.toString();

    } else if(typeof obj === "string"){
      if(depth > 0){
        return '"' + obj + '"';
      }
      return obj;

    } else if (typeof obj === "function") {
      //string.push(obj.toString())
      string.push("function " + obj.name + "(){ ... }")

    } else if (typeof obj === "object" && isArray(obj)) {
      for (prop in obj) {
        string.push(oTS(obj[prop], depth+1));
      }
      return "[" + string.join(",") + "]";

    } else if(typeof obj === "object" && obj instanceof window.Date) {
      return obj.toString();
      
    } else if (typeof obj === "object") {
      var t_c = 0;
      for (prop in obj) {
        if (Object.hasOwnProperty.bind(obj)(prop)){
          string.push(ots_space.repeat(depth+1) + prop + ": " + oTS(obj[prop], depth+1));
          ++t_c;
        }
      };
      if(!t_c){
        return "{}";
      }
      return "{\n" + string.join(",\n") + "\n"  + ots_space.repeat(depth) + "}";

      //is function
    } else {
      return "{ Error: cannotBeDisplayed, type: " + typeof(obj) + ", stringified: " + JSON.stringify(obj) + " }";
    }

    return string.join(",");
  }
  var temp = {
      content: [],
      hook: function(messageObject){
        this.content.push(messageObject);
      },
      error: function(){
        var t = [];
        for(var i=0; i<arguments.length; i++){
          t.push(oTS(arguments[i], 1));
        }
        this.hook({
          'type' : 'error',
          'message' : t.join(" ")
        });
      },
      info: function(){
        var t = [];
        for(var i=0; i<arguments.length; i++){
          t.push(oTS(arguments[i], 1));
        }
        this.hook({
          'type' : 'info',
          'message' : t.join(" ")
        })
      },
      log: function(){
        var t = [];
        for(var i=0; i<arguments.length; i++){
          t.push(oTS(arguments[i], 1));
        }
        this.hook({
          'type' : 'log',
          'message' : t.join(" ")
        });
      },
      warn: function(){
        var t = [];
        for(var i=0; i<arguments.length; i++){
          t.push(oTS(arguments[i], 1));
        }
        this.hook({
          'type' : 'warning',
          'message' : t.join(" ")
        });
      }
    };
  if(originalConsole){
    a.console = console = Object.assign({}, originalConsole, temp);
  }else{
    a.console = console = temp;
  }
  
  a.onerror = function(err, url, line, col, obj){
    console.error(err + " at line " + line + " col " + col);
    return false;
  }
})(this)