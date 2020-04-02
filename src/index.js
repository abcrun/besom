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
  var istouch =  'ontouchend' in document;

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
  var E = (function(){
    //get matrix
    var getMatrix = function(){
      var styles = window.getComputedStyle(this.element, false);
      return Matrix.create(styles['transform'] != 'none' ? styles['transform'] : 'matrix(1,0,0,1,0,0)');
    }
    //get the point origin
    var getPointOrigin = function(point){
      var o = this.offset(), transform = this.transform, toradian = Math.PI/180,
        origin = transform.origin, scale = transform.scale.x, rotate = transform.rotate, tx = transform.translate.x, ty = transform.translate.y,
        p = { x: point.pageX - o.left, y: point.pageY - o.top }, offsetx = origin.x - p.x, offsety = origin.y - p.y,
        point_origin_distance = Math.sqrt(offsetx*offsetx + offsety*offsety)/scale, angle = Math.atan(Math.abs(offsety/offsetx))/toradian, nx, ny;

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
    }
    //render
    var render = function(opt, transition){
      var elm = this.element, cssText = elm.style.cssText || '', s = this.transform, transition = transition || '0s',
        origin = opt.origin || s.origin, translate = opt.translate || s.translate, scale = opt.scale || s.scale, rotate = opt.rotate || s.rotate,
        transition = '-webkit-transition:' + transition + ';',
        transform = '-webkit-transform: translate(' + f3(translate.x) + 'px, ' + f3(translate.y) + 'px) scale(' + f3(scale.x) + ') rotate(' + f3(rotate) + 'deg);',
        origin = '-webkit-transform-origin:' + f3(origin.x) + 'px ' + f3(origin.y) + 'px;';

      elm.style.cssText = cssText + ';' + transition + transform + origin;
      this.transform = { translate: translate, rotate: rotate, scale: scale, origin: origin };
    }

    var $ = function(elm) {
      this.element = elm;
      this.transform = this.getTransform();
    }
    $.prototype = {
      offset: function(){
        var elm = this.element, left = elm.offsetLeft, top = elm.offsetTop;
        while(elm.offsetParent){
            var elm = elm.offsetParent;
            left += elm.offsetLeft;
            top += elm.offsetTop;
        }
        return { left: left, top: top }
      },
      getTransform: function(){
        var styles = window.getComputedStyle(this.element, false),
          matrix = Matrix.create(styles['transform'] != 'none' ? styles['transform'] : 'matrix(1,0,0,1,0,0)'), origin = styles['transform-origin'].split(' '),
          transform = Matrix.parse(matrix), originx = f3(origin[0]), originy = f3(origin[1]);

        transform.origin = { x: originx, y: originy }
        return transform;
      },
      setOrigin: function(point){
        var transform = this.transform, preorigin = transform.origin, matrix = getMatrix.call(this), origin = getPointOrigin.call(this, point);
        var origin_gridx_inpreorigin = preorigin.x - origin.x, origin_gridy_inpreorigin = preorigin.y - origin.y,
          origin_matrix_inpreorigin = [ [-origin_gridx_inpreorigin], [-origin_gridy_inpreorigin], [1] ], origin_position_inpreorigin = Matrix.mutiply(matrix, origin_matrix_inpreorigin),
          origin_positionx_inpreorigin = origin_position_inpreorigin[0][0] + preorigin.x, origin_positiony_inpreorigin = origin_position_inpreorigin[1][0] + preorigin.y,
          offsetx = origin_positionx_inpreorigin - preorigin.x, offsety = preorigin.y - origin_positiony_inpreorigin,
          nx = origin_gridx_inpreorigin + offsetx, ny = origin_gridy_inpreorigin - offsety;

        render.call(this, { translate:{ x: nx, y: ny }, origin: origin })
      },
      translate: function(offset, transition){
        var translate = this.transform.translate, tx = translate.x, ty = translate.y, nt = {
          x: tx + offset.x,
          y: ty + offset.y
        }

        render.call(this, { translate: nt }, transition)
      },
      scale: function(increase, transition){
        var json = this.transform.json, s = json.scale.x, ns = increase*s;

        render.call(this, { scale: ns }, transition);
      },
      rotate: function(rotateangle, transition){
        var json = this.transform.json, r = json.rotate, nr = r + rotateangle;

        render.call(this, { rotate: nr }, transition);
      }
    }

    return $;

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
      length: parseInt(Math.sqrt(x*x + y*y))
    }
  }

  //format event
  var Evt = function(e){
    var touches = (e.touches && e.touches.length) ? e.touches : (e.changedTouches && e.changedTouches.length ? e.changedTouches : [e]), infos = {
      time:new Date().getTime(),
      count: touches.length,
      event: touches
    };

    if(touches.length == 2){
      var d = distance(touches[0], touches[1]), x = d.offsetx, y = d.offsety, length = d.length,
        offsetx = Math.sqrt(length*length/4 - y*y/4),
        top = finger1.pageY + y/2, left = finger1.pageX + (x < 0 ? -offsetx : offsetx);

      infos.length = length;
      infos.center = { pageX: left, pageY: top };
    }

    return infos;
  }

  //event trigger
  var trigger = function(name, current, start){
    var arg = [ current, start ], events = this.events, elm = this.element, target = start.event[0].target, events = this.events[name], fn;

    if(events){
      if(target == elm){
        fn = events[rootgid];
      }else{
        outer: while(target != elm){
          var gid = target.getAttribute('__gid');
          if(gid){
            fn = events[gid];
            break outer;
          }else{
            var cls = (target.className || ''), arr = cls.split(' ');

            inner:for(var i = 0; i < arr.length; i++){
              var cl = arr[i];
              if(cl && events[cl]){
                target.setAttribute('__gid', cl);
                fn = events[cl];
                break inner;
              }
            }

            if(fn) break outer;
            else target = target.parentNode;
          }
        }
      }
    }

    if(fn) fn.apply(new E(target), arg);
  }


  //bind event
  var bindEvent = function(){
    var that = this, elm = this.element;
    var enabled = function(g){ return that.enabled.indexOf(g) > -1 };
    var name;

    var calculate = function(){
      if(!startInfo || !moveInfo) return;

      var starttouches = startInfo.event, movetouches = moveInfo.event, p0 = distance(starttouches[0], movetouches[0]);
      if(startInfo.count == 1 && moveInfo.count == 1 && enabled('slide') && p0.length > 3){
        moveInfo.translate = { x: p0.offsetx, y: p0.offsety };
        name = 'slide';
      }else if(startInfo.count == 2 && moveInfo.count == 2){
        var startlength = startInfo.length, movelength = moveInfo.length, toradian = Math.PI/180, scale = movelength/startlength;
        var p1 = distance(movetouches[1], starttouches[1]), rotatelength0 = p0.length, rotatelength1 = p1.length,
          rotatelength = rotatelength0 + rotatelength1, rvalue = (startlength*startlength + movelength*movelength - rotatelength*rotatelength)/(2*startlength*movelength),
          totalrotate = Math.acos(rvalue < -1 ? -1 : (rvalue > 1 ? 1 : rvalue))/toradian,
          index = starttouches[0].pageY < starttouches[1].pageY ? 0 : 1, direction = movetouches[index].pageX - starttouches[index].pageX >= 0 ? 1 : -1,
          rotate = direction * totalrotate;

        if(!name) name = enabled('pinch') && enabled('rotate') ? (Math.abs(scale - 1) > 0.01 || Math.abs(rotate) < .2 ? 'pinch' : 'rotate') : (enabled('pinch') ? 'pinch' : 'rotate');

        name == 'pinch' && (moveInfo.scale = scale);
        name == 'rotate' && (moveInfo.rotate = rotate);
      }

      trigger.call(that, name, moveInfo, startInfo);
      animation(calculate);
    }

    var tap = function(endInfo, startInfo){
      var duration = endInfo.duration, last = this.__lastTouch, name = last && endInfo.time - last.time < 300 ? 'doubletap' : (duration < 200 ? 'tap' : 'longtap');

      name == 'tap' && (this.__lastTouch = endInfo)
      setTimeout(function(){that.__lastTouch = null}, 300);

      if(name == 'tap' && enabled('doubletap')){
        var itv = setTimeout(function(){
          trigger.call(that, 'tap', endInfo, startInfo)
        }, 300);
        this.__lastTouch.itv = itv;
      }else{
        last && last.itv && clearTimeout(last.itv);
        enabled(name) && trigger.call(this, name, endInfo, startInfo)
      }
    };


    //addEvent
    var startInfo, moveInfo, isanimation = false;
    var start = function(e){
      e.preventDefault();
      startInfo = Evt(e);

      elm.addEventListener(istouch ? 'touchmove' : 'mousemove', move, false);
      elm.addEventListener(istouch ? 'touchend' : 'mouseup', end, false);
      elm.addEventListener(istouch ? 'touchcancel' : 'mouseleave', end, false);
    }
    var move = function(e){
      e.preventDefault();
      moveInfo = Evt(e);

      if(!isanimation && (enabled('slide') || enabled('roate') || enabled('pinch'))){
        animation(calculate);
        isanimation = true;
      }
    }

    var end = function(e){
      e.preventDefault();
      if(e.touches && e.touches.length != 0) return;

      var starttouches = startInfo.event, endInfo = Evt(e), endtouches = endInfo.event, endTime = endInfo.time, duration = endTime - startInfo.time;
      endInfo.duration = duration;

      if(name) trigger.call(that, name + 'End', startInfo, endInfo);
      else tap.call(that, endInfo, startInfo);

      startInfo = null;
      moveInfo = null;
      isanimation = false;
      name = undefined;

      elm.removeEventListener(istouch ? 'touchmove' : 'mousemove', move, false);
      elm.removeEventListener(istouch ? 'touchend' : 'mouseup', end, false)
      elm.removeEventListener(istouch ? 'touchcancel' : 'mouseleave', end, false)
    }

    elm.addEventListener(istouch ? 'touchstart' : 'mousedown', start, false)

    return start;
  }

  var rootgid = 'besom-gid-root', Gesture = function(elm){
    this.element = elm || document.body;
    this.events = {};
    this.enabled = [ 'tap' ]; //default
    this.current = null; //current gesture

    this.element.setAttribute('__gid', rootgid);
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
      this.events[name] = this.events[name] || {};
      this.events[name][rootgid] = fn;
    },
    delegate: function(cls, name, fn){
      if(cls.indexOf('.') < 0){
        throw new Error('The arguments[0] shoud start width "."!');
        return;
      }
      cls = cls.substring(1);

      this.events[name] = this.events[name] || {};
      this.events[name][cls] = fn;

    },
    destroy: function(){
      this.element.removeEventListener(istouch ? 'touchstart' : 'mousedown', this.__evtfn, false);
      this.__evtfn == null;
      this.element = null;
      this.events = {};
    }
  }

  return {
    create: function(elm){
      return new Gesture(elm);
    },
    element: function(elm){
      return new E(elm);
    }
  };

});
