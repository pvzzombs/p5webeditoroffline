// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  var Pos = CodeMirror.Pos;

  function forEach(arr, f) {
    for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
  }

  function arrayContains(arr, item) {
    if (!Array.prototype.indexOf) {
      var i = arr.length;
      while (i--) {
        if (arr[i] === item) {
          return true;
        }
      }
      return false;
    }
    return arr.indexOf(item) != -1;
  }

  function scriptHint(editor, keywords, getToken, options) {
    // Find the token at the cursor
    var cur = editor.getCursor(), token = getToken(editor, cur);
    if (/\b(?:string|comment)\b/.test(token.type)) return;
    token.state = CodeMirror.innerMode(editor.getMode(), token.state).state;

    // If it's not a 'word-style' token, ignore the token.
    if (!/^[\w$_]*$/.test(token.string)) {
      token = {start: cur.ch, end: cur.ch, string: "", state: token.state,
               type: token.string == "." ? "property" : null};
    } else if (token.end > cur.ch) {
      token.end = cur.ch;
      token.string = token.string.slice(0, cur.ch - token.start);
    }

    var tprop = token;
    // If it is a property, find out what it is a property of.
    while (tprop.type == "property") {
      tprop = getToken(editor, Pos(cur.line, tprop.start));
      if (tprop.string != ".") return;
      tprop = getToken(editor, Pos(cur.line, tprop.start));
      if (!context) var context = [];
      context.push(tprop);
    }
    return {list: getCompletions(token, context, keywords, options),
            from: Pos(cur.line, token.start),
            to: Pos(cur.line, token.end)};
  }

  function javascriptHint(editor, options) {
    return scriptHint(editor, javascriptKeywords,
                      function (e, cur) {return e.getTokenAt(cur);},
                      options);
  };
  CodeMirror.registerHelper("hint", "javascript", javascriptHint);

  function getCoffeeScriptToken(editor, cur) {
  // This getToken, it is for coffeescript, imitates the behavior of
  // getTokenAt method in javascript.js, that is, returning "property"
  // type and treat "." as indepenent token.
    var token = editor.getTokenAt(cur);
    if (cur.ch == token.start + 1 && token.string.charAt(0) == '.') {
      token.end = token.start;
      token.string = '.';
      token.type = "property";
    }
    else if (/^\.[\w$_]*$/.test(token.string)) {
      token.type = "property";
      token.start++;
      token.string = token.string.replace(/\./, '');
    }
    return token;
  }

  function coffeescriptHint(editor, options) {
    return scriptHint(editor, coffeescriptKeywords, getCoffeeScriptToken, options);
  }
  CodeMirror.registerHelper("hint", "coffeescript", coffeescriptHint);

  var stringProps = ("charAt charCodeAt indexOf lastIndexOf substring substr slice trim trimLeft trimRight " +
                     "toUpperCase toLowerCase split concat match replace search").split(" ");
  var arrayProps = ("length concat join splice push pop shift unshift slice reverse sort indexOf " +
                    "lastIndexOf every some filter forEach map reduce reduceRight ").split(" ");
  var funcProps = "prototype apply call bind".split(" ");
  var javascriptKeywords = ("break case catch class const continue debugger default delete do else export extends false finally for function " +
                  "if in import instanceof new null return super switch this throw true try typeof var void while with yield " + "ADD ARROW AUTO AXES BASELINE BEVEL BLEND BLUR BOLD BOLDITALIC BOTTOM BURN CENTER CHORD CLOSE CORNER CORNERS CROSS DARKEST DEGREES DIFFERENCE DILATE DODGE ERODE EXCLUSION GRAY GRID HALF_PI HAND HARD_LIGHT HSB HSL INVERT ITALIC LANDSCAPE LEFT LIGHTEST LINES LINE_LOOP LINE_STRIP MITER MOVE MULTIPLY NORMAL OPAQUE OPEN OVERLAY P2D PI PIE POINTS PORTRAIT POSTERIZE PROJECT QUADS QUAD_STRIP QUARTER_PI RADIANS RADIUS REPLACE RGB RIGHT ROUND SCREEN SOFT_LIGHT SQUARE TAU TEXT THRESHOLD TOP TRIANGLES TRIANGLE_FAN TRIANGLE_STRIP TWO_PI WAIT WEBGL abs() accelerationX accelerationY accelerationZ acos() alpha() ambientLight() ambientMaterial() angleMode() append() applyMatrix() arc() arrayCopy() asin() atan() atan2() background() beginContour() beginShape() bezier() bezierDetail() bezierPoint() bezierTangent() bezierVertex() blend() blendMode() blue() boolean() box() brightness() byte() ceil() char() circle() clear() clear() close() color() colorMode() concat() cone() constrain() copy() cos() createCanvas() createGraphics() createImage() createShader() createVector() createWriter() cursor() curve() curveDetail() curvePoint() curveTangent() curveTightness() curveVertex() cylinder() day() debugMode() degrees() deviceMoved() deviceOrientation deviceShaken() deviceTurned() directionalLight() displayDensity() displayHeight displayWidth dist() doubleClicked() draw() ellipse() ellipseMode() ellipsoid() endContour() endShape() exp() fill() filter() float() floor() focused frameCount frameRate() fullscreen() get() getURL() getURLParams() getURLPath() green() height hex() hour() httpDo() httpGet() httpPost() hue() image() imageMode() int() join() key keyCode keyIsDown() keyIsPressed keyPressed() keyReleased() keyTyped() lerp() lerpColor() lightness() line() loadBytes() loadFont() loadImage() loadJSON() loadModel() loadPixels() loadShader() loadStrings() loadTable() loadXML() log() loop() mag() map() match() matchAll() max() millis() min() minute() model() month() mouseButton mouseClicked() mouseDragged() mouseIsPressed mouseMoved() mousePressed() mouseReleased() mouseWheel() mouseX mouseY nf() nfc() nfp() nfs() noCanvas() noCursor() noDebugMode() noFill() noLoop() noSmooth() noStroke() noTint() noise() noiseDetail() noiseSeed() norm() normalMaterial() orbitControl() p5 p5 p5.Camera p5.Color p5.Element p5.Font p5.Geometry p5.Graphics p5.Image p5.NumberDict p5.Shader p5.Table p5.TableRow p5.TypedDict p5.Vector p5.XML pAccelerationX pAccelerationY pAccelerationZ pRotationX pRotationY pRotationZ pixelDensity() pixels plane() pmouseX pmouseY point() pointLight() pop() pow() preload() print() print() push() pwinMouseX pwinMouseY quad() quadraticVertex() radians() random() randomGaussian() randomSeed() rect() rectMode() red() redraw() remove() resetMatrix() resizeCanvas() reverse() rotate() rotateX() rotateY() rotateZ() rotationX rotationY rotationZ round() saturation() save() saveCanvas() saveFrames() saveJSON() saveStrings() saveTable() scale() second() set() setMoveThreshold() setShakeThreshold() setup() shader() shearX() shearY() shorten() shuffle() sin() smooth() sort() specularMaterial() sphere() splice() split() splitTokens() sq() sqrt() square() str() stroke() strokeCap() strokeJoin() strokeWeight() subset() tan() text() textAlign() textAscent() textDescent() textFont() textLeading() textSize() textStyle() textWidth() texture() textureMode() tint() torus() touchEnded() touchMoved() touchStarted() touches translate() triangle() trim() turnAxis unchar() unhex() updatePixels() vertex() width winMouseX winMouseY windowHeight windowResized() windowWidth write() year()").split(" ");
  var coffeescriptKeywords = ("and break catch class continue delete do else extends false finally for " +
                  "if in instanceof isnt new no not null of off on or return switch then throw true try typeof until void while with yes").split(" ");

  function forAllProps(obj, callback) {
    if (!Object.getOwnPropertyNames || !Object.getPrototypeOf) {
      for (var name in obj) callback(name)
    } else {
      for (var o = obj; o; o = Object.getPrototypeOf(o))
        Object.getOwnPropertyNames(o).forEach(callback)
    }
  }

  function getCompletions(token, context, keywords, options) {
    var found = [], start = token.string, global = options && options.globalScope || window;
    function maybeAdd(str) {
      if (str.lastIndexOf(start, 0) == 0 && !arrayContains(found, str)) found.push(str);
    }
    function gatherCompletions(obj) {
      if (typeof obj == "string") forEach(stringProps, maybeAdd);
      else if (obj instanceof Array) forEach(arrayProps, maybeAdd);
      else if (obj instanceof Function) forEach(funcProps, maybeAdd);
      forAllProps(obj, maybeAdd)
    }

    if (context && context.length) {
      // If this is a property, see if it belongs to some object we can
      // find in the current environment.
      var obj = context.pop(), base;
      if (obj.type && obj.type.indexOf("variable") === 0) {
        if (options && options.additionalContext)
          base = options.additionalContext[obj.string];
        if (!options || options.useGlobalScope !== false)
          base = base || global[obj.string];
      } else if (obj.type == "string") {
        base = "";
      } else if (obj.type == "atom") {
        base = 1;
      } else if (obj.type == "function") {
        if (global.jQuery != null && (obj.string == '$' || obj.string == 'jQuery') &&
            (typeof global.jQuery == 'function'))
          base = global.jQuery();
        else if (global._ != null && (obj.string == '_') && (typeof global._ == 'function'))
          base = global._();
      }
      while (base != null && context.length)
        base = base[context.pop().string];
      if (base != null) gatherCompletions(base);
    } else {
      // If not, just look in the global object and any local scope
      // (reading into JS mode internals to get at the local and global variables)
      for (var v = token.state.localVars; v; v = v.next) maybeAdd(v.name);
      for (var v = token.state.globalVars; v; v = v.next) maybeAdd(v.name);
      if (!options || options.useGlobalScope !== false)
        gatherCompletions(global);
      forEach(keywords, maybeAdd);
    }
    return found;
  }
});
