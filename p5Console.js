(function(a){
  var originalConsole;
  if(typeof a.console !== undefined || typeof console !== undefined){
    originalConsole = a.console || console;
  }
  var temp = {
      content: [],
      hook: function(messageObject){
        this.content.push(messageObject);
      },
      error: function(){
        this.hook({
          'type' : 'error',
          'message' : [].slice.call(arguments).join(" ")
        });
      },
      info: function(){
        this.hook({
          'type' : 'info',
          'message' : [].slice.call(arguments).join(" ")
        })
      },
      log: function(){
        this.hook({
          'type' : 'log',
          'message' : [].slice.call(arguments).join(" ")
        });
      },
      warn: function(){
        this.hook({
          'type' : 'warning',
          'message' : [].slice.call(arguments).join(" ")
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