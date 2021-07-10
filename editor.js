var editorRunning = {
  'value': false,
  'console': false,
  'timer': null,
  'theme' : 'light',
  'numPanels' : 0,
  'panels' : {},
  'popout' : null
};

window.onload = function(){
  
  function popout(text){
    clearTimeout(editorRunning.popout);
    document.getElementsByClassName("popout")[0].style.display = 'block';
    document.getElementsByClassName("popout-message-text")[0].innerText = text;
    editorRunning.popout = setTimeout(function(){
      document.getElementsByClassName("popout")[0].style.display = 'none';
    }, 3000);
  }
  
  var btn = document.querySelector("#clickme");
  var btn2 = document.querySelector("#resetme");
  var btn3 = document.querySelector("#saveme");
  var btn4 = document.querySelector("#exportme");
  var btn5 = document.querySelector("#consoleme");
  var btn6 = document.querySelector("#closeconsole");
  var btn7 = document.querySelector("#theme");
  var btn8 = document.querySelector("#popout-closer");
  var btn9 = document.querySelector("#importme");
  var btn10 = document.querySelector("#about");
  var fileInput = document.querySelector("#fileOpener");
  
  var ExcludedIntelliSenseKeys = {
    "8": "backspace",
    "9": "tab",
    "13": "enter",
    "16": "shift",
    "17": "ctrl",
    "18": "alt",
    "19": "pause",
    "20": "capslock",
    "27": "escape",
    "32": "space",
    "33": "pageup",
    "34": "pagedown",
    "35": "end",
    "36": "home",
    "37": "left",
    "38": "up",
    "39": "right",
    "40": "down",
    "45": "insert",
    "46": "delete",
    "91": "left window key",
    "92": "right window key",
    "93": "select",
    "107": "add",
    "109": "subtract",
    "110": "decimal point",
    "111": "divide",
    "112": "f1",
    "113": "f2",
    "114": "f3",
    "115": "f4",
    "116": "f5",
    "117": "f6",
    "118": "f7",
    "119": "f8",
    "120": "f9",
    "121": "f10",
    "122": "f11",
    "123": "f12",
    "144": "numlock",
    "145": "scrolllock",
    "186": "semicolon",
    "187": "equalsign",
    "188": "comma",
    "189": "dash",
    "191": "slash",
    "192": "graveaccent",
    "220": "backslash",
    "222": "quote",
    "<" : true,
    ">" : true,
    "!" : true,
    " " : true,
    "=" : true,
    "[" : true,
    "]" : true,
    "(" : true,
    ")" : true,
    "{" : true,
    "}" : true,
    ";" : true
  };

  var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    value: "",
    mode:  "javascript",
    theme: "default",
    tabSize: 2,
    autoCloseBrackets: true,
    lineNumbers: true,
    lineWrapping: true,
    gutters: ["CodeMirror-lint-markers"],
    lint: true,
    readOnly: false
  });
  editor.setSize("100%", 500);
  editor.getWrapperElement().style["font-size"] = 16 + "px";
  editor.on("blur", function(){
    editor.readOnly = "nocursor";
  });
  editor.on("focus", function(){
    editor.readOnly = false;
  });
  
  editor.on("keyup", function(editor, event) {
    var __Cursor = editor.getDoc().getCursor();
    var __Token = editor.getTokenAt(__Cursor);
    //console.log(ExcludedIntelliSenseKeys[(event.keyCode || event.which).toString()]);
    //console.log(ExcludedIntelliSenseKeys[__Token.string]);
    if (!editor.state.completionActive &&
        (!ExcludedIntelliSenseKeys[__Token.string] &&
        !ExcludedIntelliSenseKeys[(event.keyCode || event.which).toString()])) {
      CodeMirror.commands.autocomplete(editor, null, { completeSingle: false });
    }
  });
  
  editor.refresh();
  
  if(localStorage){
    var $data = localStorage.getItem("p5jsdata");
    var $settings = localStorage.getItem("p5settings");
    var $tempSettings;
    if($data !== null){
      editor.setValue($data);
    }else{
      localStorage.setItem("p5jsdata", "function setup(){\n  createCanvas(400, 300);\n}\n\nfunction draw(){\n  //your code here\n}");
      popout("This is your first time using p5 | Web editor offline!");
      editor.setValue("function setup(){\n  createCanvas(400, 300);\n}\n\nfunction draw(){\n  //your code here\n}");
    }
    if($settings !== null){
      $tempSettings = JSON.parse($settings);
      if($tempSettings.theme === 'dark'){
        editorRunning.theme = 'dark';
        document.getElementById("logo").src = "img/logo_dark.png";
        document.body.style.backgroundColor = "#2a2828";
        editor.setOption("theme", "monokia");
      }else{
        editorRunning.theme = 'light';
        document.getElementById("logo").src = "img/logo.png";
        document.body.style.backgroundColor = "white";
        editor.setOption("theme", "default");
      }
    }else{
      localStorage.setItem("p5settings", "{\"theme\" : \"light\"}");
    }
    editor.refresh();
  }
  
  btn.addEventListener("click", function(){
    var targetFrame = document.getElementById("pFrame");
    if(editorRunning.value){
    	document.getElementById("clickme").value = "Run";
    	editorRunning.value = false;
      if(typeof targetFrame.contentWindow.p5 !== "undefined"){
        targetFrame.contentWindow.p5.instance.noLoop();
        targetFrame.contentWindow.p5.instance.remove();
        targetFrame.contentWindow.p5 = undefined;
      }
      targetFrame.contentWindow.document.location.reload();
      targetFrame.srcdoc = "";
      document.getElementsByClassName("consoleWindow")[0].innerHTML = "";
      if(localStorage){ localStorage.setItem("p5jsdata", editor.getValue()); }
    }else{
      //check lint first
      if(JSHINT.errors.length){
        var l = JSHINT.errors.length;
        for(var i = 0; i < l; i++){
          if(JSHINT.errors[i].code.indexOf('E') === 0){
            popout("Please fix an error first before running again!");
            return;
          }
        }
        //safe code, only W000+ is accepted 
      }
    	var js = editor.getValue();
      targetFrame.srcdoc = "<!DOCTYPE html><html><head><script src='p5Console.js'></script><script src='p5-1.4.0.min.js'></script><script>p5.disableFriendlyErrors=true;try{" + js + "}catch(e){console.error(e)}</script></head><body></body></html>"
    	document.getElementById("clickme").value = "Stop";
    	editorRunning.value = true;
    }
  });
  
  btn2.addEventListener("click", function(){
    if(confirm("Reset the editor?")){
      editor.setValue("function setup(){\n  createCanvas(400, 300);\n}\n\nfunction draw(){\n  //your code here\n}");
      if(localStorage){ localStorage.setItem("p5jsdata", "function setup(){\n  createCanvas(400, 300);\n}\n\nfunction draw(){\n  //your code here\n}"); }
      //document.location.reload();
      var targetFrame = document.getElementById("pFrame");
      targetFrame.srcdoc = "";
      targetFrame.contentWindow.document.location.reload();
      //addPanel("bottom", "You reset the editor.");
      popout("You reset the editor.");
    }
  });
  
  btn3.addEventListener("click", function(){
    if(localStorage){ localStorage.setItem("p5jsdata", editor.getValue()); }
    popout("The editor was saved.");
  });
  
  btn4.addEventListener("click", function(){
    var blob = new Blob([editor.getValue()], { type: "text/javascript" });
    var a = document.createElement("a");
    a.download = prompt("Enter filename: ", "sketch.js");
    if(a.download === "null" || a.download === ""){ popout("Export failed!"); return; }
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = ["text/javascript", a.download, a.href].join(":");
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
    popout("Exported " + a.download + " successfully!");
  });
  
  btn5.addEventListener("click", function(){
    if(!editorRunning.value){
      return;
    }
    document.getElementsByClassName("takip")[0].style.display = 'block';
    document.getElementsByClassName("console")[0].style.display = 'block';

    editorRunning.console = true;
    editorRunning.timer = setInterval(function(){
      var targetFrame = document.getElementById("pFrame");
      var consoleObjects = targetFrame.contentWindow.console.content;
      var consoleObjectsLength = consoleObjects.length;
      var el;
      if(consoleObjectsLength){
        el = consoleObjects.shift();
        document.getElementsByClassName("consoleWindow")[0].innerHTML += '<div class="consoleWrapper"><p class="consoleIcon"><img src="img/' + el.type + '.svg"/></p><p class="consoleMessage">' + el.message + '</p></div>';
      }
    });
  });
  
  btn6.addEventListener("click", function(){
    if(editorRunning.console){
      editorRunning.console = false;
      clearInterval(editorRunning.timer);
    }
    document.getElementsByClassName("takip")[0].style.display = 'none';
    document.getElementsByClassName("console")[0].style.display = 'none';
  });
  
  btn7.addEventListener("click", function(){
    var $settings = localStorage.getItem("p5settings");
    var $tempSettings;
    $tempSettings = JSON.parse($settings);
    switch(editorRunning.theme){
      case 'light':
        editorRunning.theme = 'dark';
        document.getElementById("logo").src = "img/logo_dark.png";
        document.body.style.backgroundColor = "#2a2828";
        editor.setOption("theme", "monokia");
        popout("Theme was set to dark.");
        $tempSettings.theme = "dark";
        localStorage.setItem("p5settings", JSON.stringify($tempSettings));
      break;
      case 'dark':
        editorRunning.theme = 'light';
        document.getElementById("logo").src = "img/logo.png";
        document.body.style.backgroundColor = "white";
        editor.setOption("theme", "default");
        popout("Theme was set to light.")
        $tempSettings.theme = "light";
        localStorage.setItem("p5settings", JSON.stringify($tempSettings));
      break;
    }
  });
  
  btn8.addEventListener("click", function(){
    clearTimeout(editorRunning.popout);
    document.getElementsByClassName("popout")[0].style.display = 'none';
  });

  btn9.addEventListener("click", function(){
    fileInput.click();
  });

  fileInput.addEventListener("change", function(evt){
    var currentFile = null;
    if(evt.target){
      currentFile = evt.target.files[0];
    }else if(evt.srcElement){
      currentFile = evt.srcElement.files[0];
    }
    //console.log(currentFile);
    var reader = new FileReader();
    reader.readAsText(currentFile);
    reader.onload = function(){
      editor.setValue(reader.result);
      popout(currentFile.name + " loaded successfully.");
    }
    reader.onerror = function(){
      popout("Failed to read sketch file, " + reader.error + " .");
    }
  });

  btn10.addEventListener("click", function(){
    popout("p5.js Offline Web Editor v0.1.1");
  });
};