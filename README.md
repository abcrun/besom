### Besom 

A Javascript Library For Multi-Touch and Mouse Event Gestures (tap, longtap, doubletap, pinch, slide, rotate)

### Installation

`npm install besom --save` or `yarn add besom` or cdn  [https://cdn.jsdelivr.net/npm/besom/dist/besom.min.js](https://cdn.jsdelivr.net/npm/besom/dist/besom.min.js)

### Usage

```javascript
  var Besom = require('besom'), g = Besom.create(document.getElementById('demo'));
  g.enable('longtap', 'slide', 'pinch');

  //bind Event
  g.on('tap', function(){ console.log('tap') }); //tap event is enabled by default
  g.on('longtap', function(){ console.log('longtap') });

  g.on('slide', function(e){ this.translate(e.translate) });
  g.on('slideEnd', function(){ console.log('slideEnd')  });

  g.on('start', function(e){
    if(e.count == 2) this.setPointAsOrigin(e.center)
  })
  g.on('pinch', function(e){ this.scale(e.scale) });
  g.on('pinchEnd', function(){ console.log('pinchEnd') });

```



See Demos [Click Here](http://blog.woritd.com/besom/index.html)

### Supported Gestures

* `tap`(enabled default) 
* `longtap`
* `doubletap`
* `slide`
* `pinch`
* `rotate`

### Bind Event Name

* `tap`
* `longtap`
* `doubletap`
* `start`
* `slide`
* `slideEnd`
* `pinch`
* `pinchEnd`
* `rotate`
* `rotateEnd`

### Instance And Methods

##### Create Gestures Maintainer

```javascript
Besom.create(element)
```

* element:HTMLElement 

###### Gestures Maintainer Methods

* enable(gesture), disable(gesture) - enable/disable gestures 

* on(event, fn) - add gesture event function 

   the parameter of the event callback function - `fn(currentGestureEventObject, startGestureEventObject, currentTransformableElement)`

     * `currentGestureEventObject` and `startGestureEventObject` is the formatted event object with caculated datas of the gestures
     * `currentTransformableElement` or `this` in the callback function `fn` - refers to the transformable element. More details see bellow

* delegate(className, event, fn) - delegate the gesture of the child element which has the className `className`

* destroy() - destroy the gesture manager and events

##### Create Transformable Element

```javascript
Besom.element(element)
```

* element:HTMLElement.

###### Transformable Element Properties and Methods

* element - the html element
* transform - the transform property of the element
* offset() - return the element offset.left and offset.top in the page
* getPointOrigin(point) - caculate the point({pageX:number, pageY:number) in the element matrix
* setPointAsOrigin(point) - set the point({pageX:number, pageY:number}) as the element origin
* translate(offset, duration) - translate offset.x as horizon and offset.y as vertical distance in duration time.
* scale(scale, duration)
* rotate(rotate, duration)
* position() - return the left and top styles of the element.
* move(params, duration) - move the element to the postion(different to translate) with params({ left, top, width, height }) in duration time.


