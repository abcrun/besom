/**
 * @license MIT
 * @author abcrun
 **/

!(function(root, factory){
  if(typeof define === 'function' && define.amd) define(factory);//AMD
  else if(typeof module === 'object' && module.exports) module.exports = factory();//CommonJS
  else root.Besom = factory();
})(this, function(){
  //util methods
  var f3 = function(num){
    return Math.round(parseFloat(num)*1000)/1000;
  }

  //matrix
  var Matrix = {
    create: function(matrix) {
      if(typeof matrix == 'string'){
        var m = (/matrix\((.*)\)/.exec(matrix) || ['',''])[1].split(',');
        if(m.length >= 6) matrix = [ [ f3(m[0]), f3(m[2]), f3(m[4])], [ f3(m[1]), f3(m[3]), f3(m[5])], [0, 0, 1] ];
        else matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
      }else{
        var t = matrix.translate || 0, s = matrix.scale.x || 1, r = matrix.rotate || 0,
          r = r * Math.PI/180, sin = f3(Math.sin(r)), cos = f3(Math.cos(r));

        matrix = this.mutiply(this.mutiply(
          [[1, 0, t.x], [0, 1, t.y],[0, 0, 1]],
          [[cos, -sin, 0], [sin, cos, 0], [0, 0, 1]]
        ),[[s, 0, 0], [0, s, 0], [0, 0, 1]]);
      }

      return matrix;
    },
    mutiply: function(m, n){
      var matrix = [];
      for(var i = 0; i < m.length; i++){
        var arr = [];
        for(var j = 0; j < n[i].length; j++){
          arr.push(f3(m[i][0]*n[0][j] + m[i][1]*n[1][j] + m[i][2]*n[2][j]));
        }
        matrix.push(arr);
      }

      return matrix;
    },
    parse: function(m) {
      var a = m[0][0], b = m[1][0], c = m[0][1], d = m[1][1], e = m[0][2], f = m[1][2],
        angle = Math.atan2(b, a)*(180/Math.PI), radian = -Math.PI/180*angle;

      return {
        scale: {
          x:f3(Math.sqrt(a*a + b*b)),
          y:f3(Math.sqrt(c*c + d*d)),
        },
        rotate: f3(angle),
        translate: {
          x: f3(Math.cos(radian)*e - Math.sin(radian)*f),
          y: f3(Math.sin(radian)*e + Math.cos(radian)*f)
        }
      }
    }
  };

  //element
  var E = function(elm) {
    this.element = elm;
    this.resetTransform();
  }
  E.prototype = {
    offset: function(){
      var elm = this.element, left = elm.offsetLeft, top = elm.offsetTop;
      while(elm.offsetParent){
          var elm = elm.offsetParent;
          left += elm.offsetLeft;
          top += elm.offsetTop;
      }
      return { left: left, top: top }
    },
    resetTransform: function(){
      var styles = window.getComputedStyle(this.element, false),
        matrix = Matrix.create(styles['transform'] != 'none' ? styles['transform'] : 'matrix(1,0,0,1,0,0)'), origin = styles['transform-origin'].split(' '),
        json = Matrix.parse(matrix), originx = f3(origin[0]), originy = f3(origin[1]);

      this.transform = {
        matrix: matrix,
        json: Matrix.parse(matrix),
        origin: {
          x: originx,
          y: originy
        }
      }
    },
    getPointOrigin: function(point){
      var o = this.offset(), p = { x: point.pageX - o.left, y: point.pageY - o.top },
        transform = this.transform, toradian = Math.PI/180, json = transform.json, origin = transform.origin,
        rotate = json.rotate, scale = json.scale.x, translate = json.translate, tx = translate.x, ty = translate.y,
        offsetx = origin.x - p.x, offsety = origin.y - p.y, point_origin_distance = Math.sqrt(offsetx*offsetx + offsety*offsety)/scale,
        angle = Math.atan(Math.abs(offsety/offsetx))/toradian, nx, ny;

      if(offsety > 0 && offsetx > 0) toangle = angle - rotate;
      if(offsety > 0 && offsetx < 0) toangle = 180 - angle - rotate;
      if(offsety < 0 && offsetx > 0) toangle = angle + rotate;
      if(offsety < 0 && offsetx < 0) toangle = angle - rotate;

      var dx = point_origin_distance*Math.cos(toangle*toradian), dy = point_origin_distance*Math.sin(toangle*toradian);

      if(offsety > 0 && offsetx > 0) (nx = origin.x - dx) && (ny = origin.y - dy);
      if(offsety > 0 && offsetx < 0) (nx = origin.x - dx) && (ny = origin.y - dy);
      if(offsety < 0 && offsetx > 0) (nx = origin.x - dx) && (ny = origin.y + dy);
      if(offsety < 0 && offsetx < 0) (nx = origin.x + dx) && (ny = origin.y + dy);

      return {
        x: nx - tx/scale,
        y: ny - ty/scale
      }
    },
    setOrigin: function(origin){
      var transform = this.transform, matrix = transform.matrix, preorigin = transform.origin;
      var origin_gridx_inpreorigin = preorigin.x - origin.x, origin_gridy_inpreorigin = preorigin.y - origin.y,
        origin_matrix_inpreorigin = [ [-origin_gridx_inpreorigin], [-origin_gridy_inpreorigin], [1] ], origin_position_inpreorigin = Matrix.mutiply(matrix, origin_matrix_inpreorigin),
        origin_positionx_inpreorigin = origin_position_inpreorigin[0][0] + preorigin.x, origin_positiony_inpreorigin = origin_position_inpreorigin[1][0] + preorigin.y,
        offsetx = origin_positionx_inpreorigin - preorigin.x, offsety = preorigin.y - origin_positiony_inpreorigin,
        nx = origin_gridx_inpreorigin + offsetx, ny = origin_gridy_inpreorigin - offsety;

      this.render({ translate:{ x: nx, y: ny }, origin: origin })
      this.resetTransform();
    },
    translate: function(offset, transition){
      var matrix = this.transform.matrix, tx = matrix[0][2], ty = matrix[1][2], nt = {
        x: tx + offset.x,
        y: ty + offset.y
      }

      this.render({ translate: nt }, transition)
      this.resetTransform();
    },
    scale: function(increase, transition){
      var json = this.transform.json, s = json.scale.x, ns = increase*s;

      this.render({ scale: ns }, transition);
      this.resetTransform();
    },
    rotate: function(rotateangle, transition){
      var json = this.transform.json, r = json.rotate, nr = r + rotateangle;

      this.render({ rotate: nr }, transition);
      this.resetTransform();
    },
    render: function(opt, transition){
      var elm = this.element, cssText = elm.style.cssText || '', s = this.transform, m = s.matrix, t = s.json, origin = opt.origin || s.origin, transition = transition || '0s',
        translate = opt.translate || {x:m[0][2], y:m[1][2]}, scale = f3(opt.scale || t.scale.x), rotate = f3(opt.rotate || t.rotate),
        transition = '-webkit-transition:' + transition + ';',
        transform = '-webkit-transform: translate(' + f3(translate.x) + 'px, ' + f3(translate.y) + 'px) scale(' + scale + ') rotate(' + rotate + 'deg);',
        origin = '-webkit-transform-origin:' + origin.x + 'px ' + origin.y + 'px;';

      elm.style.cssText = cssText + ';' + transition + transform + origin;
    }
  }

  //generate gesture id
  var gid = (function(){
    var index = -1;
    return function(elm, id){
      var str = id || 'besom_' + ++index;
      if(elm) elm.setAttribute('gid', str);

      return str;
    }
  })();

  //animation
  var animation = (function(){
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(fn){ window.setTimeout(fn, 1000/60) };
  })();

  //point distance
  var distance = function(p1, p2){
    var x = p2.pageX - p1.pageX, y = p2.pageY - p1.pageY;
    return {
      offsetx: x,
      offsety: y,
      length: Math.sqrt(x*x + y*y)
    }
  }

  //touchInfo
  var getTouchInfo = function(e){
    var touches = (e.touches && e.touches.length) ? e.touches : (e.changedTouches && e.changedTouches.length ? e.changedTouches : [e]), infos = {
      time:new Date().getTime(),
      count: touches.length,
      event: touches
    };

    if(touches.length == 2){
      var finger1 = touches[0], finger2 = touches[1],
        x = finger2.pageX - finger1.pageX, y = finger2.pageY - finger1.pageY,
        length = Math.sqrt(x*x + y*y),
        offsetx = Math.sqrt(length*length/4 - y*y/4),
        top = finger1.pageY + y/2,
        left = finger1.pageX + (x < 0 ? -offsetx : offsetx);

      infos.length = length;
      infos.center = { pageX: left, pageY: top };
    }

    return infos;
  }

  //event trigger
  var trigger = function(name, options, current, start){
    var that = this, arg = [ options, current, start ], events = this.events, target = start.event[0].target,
      id = target.getAttribute('gid');
    if(id){
      var evt = events[id] || {}, fn = evt[name];
    }else{
      for(key in events){
        var evt = events[key], cls = evt.className || '';
        if(target.className.split(' ').indexOf(cls) > -1){
          gid(target, key);
          fn = evt[name];
          break;
        }
      }
    }

    if(!fn) return;
    fn.apply(new E(target), arg)
  }

  var istouch =  'ontouchend' in document;

  //bind event
  var bindEvent = function(){
    var that = this, elm = this.element.element;
    var enabled = function(g){ return that.enabled.indexOf(g) > -1 };
    var mark, ispinch;

    var slide = function(){
      if(!moveInfo) return;
      if(!mark) mark = { x:0, y:0 }

      var st = startInfo.event[0], mt = moveInfo.event[0], d = distance(st, mt), offsetx = d.offsetx, offsety = d.offsety, offset = { x: offsetx, y: offsety };

      !that.onlydetect && that.element.translate(offset, 0)
      trigger.call(that, 'slide', {increase: {x: offset.x - mark.x, y: offset.y - mark.y }, total: offset} , moveInfo, startInfo);
      mark = { x: offsetx, y: offsety };

      animation(slide);
    };

    var pinchAndRotate = function(){
      if(!moveInfo || moveInfo.count != 2 || startInfo.count != 2) return;

      var starttouches = startInfo.event, movetouches = moveInfo.event, startlength = startInfo.length, movelength = moveInfo.length, toradian = Math.PI/180, totalscale = movelength/startlength,
        d0 = distance(movetouches[0], starttouches[0]), d1 = distance(movetouches[1], starttouches[1]), rotatelength0 = d0.length, rotatelength1 = d1.length,
        rotatelength = rotatelength0 + rotatelength1, rvalue = (startlength*startlength + movelength*movelength - rotatelength*rotatelength)/(2*startlength*movelength),
        totalrotate = Math.acos(rvalue < -1 ? -1 : (rvalue > 1 ? 1 : rvalue))/toradian;


      ispinch = ispinch == undefined ? (Math.abs(totalscale - 1) > 0.01 || Math.abs(totalrotate) < .2 ? true : false) : ispinch;

      if(ispinch){
        if(!mark) mark = 1;
        var increase = totalscale/mark;

        !that.onlydetect && that.element.scale(increase, 0);
        trigger.call(that, 'pinch', {increase: increase, total: totalscale}, moveInfo, startInfo);
        mark = totalscale;
      }else{
        if(!mark) mark = 0;

        var index = starttouches[0].pageY < starttouches[1].pageY ? 0 : 1, direction = movetouches[index].pageX - starttouches[index].pageX >= 0 ? 1 : -1;
        totalrotate = direction * totalrotate;

        var increase = totalrotate - mark;

        !that.onlydetect && that.element.rotate(increase, 0);
        trigger.call(that, 'rotate', { increase: increase, total: totalrotate}, moveInfo, startInfo);
        mark = totalrotate;
      }

      animation(pinchAndRotate);

    }

    var tap = function(duration, endInfo, startInfo){
      var that = this, last = this.__lastTouch, name = last && endInfo.time - last.time < 300 ? 'doubletap' : (duration < 200 ? 'tap' : 'longtap');

      name == 'tap' && (this.__lastTouch = endInfo)
      setTimeout(function(){that.__lastTouch = null}, 300);

      if(name == 'tap' && enabled('doubletap')){
        var itv = setTimeout(function(){
          trigger.call(that, 'tap', {duration:duration}, endInfo, startInfo)
        }, 300);
        this.__lastTouch.itv = itv;
      }else{
        last && last.itv && clearTimeout(last.itv);
        enabled(name) && trigger.call(this, name, {duration:duration}, endInfo, startInfo)
      }
    };


    //addEvent
    var startInfo, moveInfo, ismoving;
    var start = function(e){
      e.preventDefault();
      startInfo = getTouchInfo(e);

      if(startInfo.count == 2){
        var startcenter = startInfo.center, origin = that.element.getPointOrigin(startcenter);
        that.element.setOrigin(origin);
      }

      trigger.call(that, 'start', null, startInfo, startInfo)

      elm.addEventListener(istouch ? 'touchmove' : 'mousemove', move, false);
      elm.addEventListener(istouch ? 'touchend' : 'mouseup', end, false)
      elm.addEventListener(istouch ? 'touchcancel' : 'mouseleave', end, false)
    }
    var move = function(e){
      e.preventDefault();

      moveInfo = getTouchInfo(e);

      if(!ismoving){
        if((enabled('slide')) && moveInfo.count == 1 && startInfo.count == 1){
          animation(slide);
        }

        if((enabled('pinch') || enabled('rotate')) && moveInfo.count == 2 && startInfo.count == 2){
          ispinch = enabled('pinch') ? (!enabled('rotate') ? true : undefined) : false;
          animation(pinchAndRotate)
        }

        ismoving = true;
      }
    }
    var end = function(e){
      var starttouches = startInfo.event, endInfo = getTouchInfo(e), endtouches = endInfo.event, endTime = endInfo.time, duration = endTime - startInfo.time, name;

      e.preventDefault();
      if(e.touches && e.touches.length != 0) return;

      if(startInfo.count == 1){
        var d = distance(starttouches[0], endtouches[0]), offsetx = d.offsetx, offsety = d.offsety;

        if(Math.abs(offsetx) < 3 && Math.abs(offsety) < 3){
          tap.call(that, duration, endInfo, startInfo);
        }else{
          name = 'slide';
        }
      }else{
        name = enabled('pinch') ? 'pinch' : (enabled('rotate') ? 'rotate' : undefined);
      }

      that.element.resetTransform();
      name && trigger.call(that, name + 'End', { duration: duration, total: mark }, endInfo, startInfo)

      moveInfo = null;
      ismoving = undefined;
      mark = undefined;
      ispinch = undefined;

      elm.removeEventListener(istouch ? 'touchmove' : 'mousemove', move, false);
      elm.removeEventListener(istouch ? 'touchend' : 'mouseup', end, false)
      elm.removeEventListener(istouch ? 'touchcancel' : 'mouseleave', end, false)
    }

    elm.addEventListener(istouch ? 'touchstart' : 'mousedown', start, false)

    return start;
  }

  var Gesture = function(elm, onlydetect){
    if(elm.length){
      throw new Error('The element parameter shouldn\'t be an array list. If you want to add gestures to these elements, please use delegate method of their parent element');
      return;
    }
    this.element = new E(elm);
    this.events = {};
    this.enabled = [ 'tap' ]; //default
    this.onlydetect = onlydetect || false;

    this.__evtfn = bindEvent.call(this);//return event function in order to destroy
  }

  Gesture.prototype = {
    enable: function(){
      var enabledlist = ['tap', 'longtap', 'doubletap', 'slide', 'pinch', 'rotate'];

      for(var i = 0; i < arguments.length; i++){
        var arg = arguments[i];
        if(enabledlist.indexOf(arg) > -1) this.enabled.indexOf(arg) < 0 && this.enabled.push(arg);
        else{
          throw new Error('Only Support: "' + enabledlist.join('|') + '"!');
        }
      }
    },
    disable: function(){
      for(var i = 0; i < arguments.length; i++){
        var arg = arguments[i], index = this.enabled.indexOf(arg);
        if(index > -1) this.enabled.splice(index, 1);
      }
    },
    on: function(name, fn){
      var id = this.element.element.getAttribute('gid') || gid(this.element.element);//set gid
      this.events[id] = this.events[id] || {};

      var evt = this.events[id];
      evt[name] = fn;
    },
    delegate: function(cls, name, fn){
      if(cls.indexOf('.') < 0){
        throw new Error('The parameter cls shoud start width "."!');
        return;
      }
      cls = cls.substring(1);
      this.onlydetect = true;

      var id = gid();
      for(key in this.events){
        if(this.events[key].className == cls) id = key;
      }
      this.events[id] = this.events[id] || {};

      var evt = this.events[id];
      evt[name] = fn;
      evt.className = cls;
    },
    destroy: function(){
      this.element.removeEventListener(istouch ? 'touchstart' : 'mousedown', this.__evtfn, false);
      this.__evtfn == null;
      this.element = null;
      this.events = {};
      this.onlydetect = false;
    }
  }

  return {
    create: function(elm, onlydetect){
      return new Gesture(elm, onlydetect || false);
    },
    element: function(elm){
      return new E(elm);
    }
  };

});
