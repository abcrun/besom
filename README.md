### Besom 

A Javascript Library For Multi-Touch Gestures (tap, longtap, doubletap, rotate, pinch, slide) - Support PC Web Mouse Event

### Installation(will publish soon)

#### NPM

```
npm install besom --save
```

###### or

#### Yarn

```
yarn add besom
```

###### or

#### CDN

[https://cdn.jsdelivr.net/npm/besom/dist/besom.min.js](https://cdn.jsdelivr.net/npm/besom/dist/besom.min.js)


### Usage

```javascript
  var Besom = require('besom'), g = Besom.create(document.getElementById('demo'));
  g.enabe('longtap', 'slide', 'pinch');

  //bind Event
  g.on('tap', function(){ console.log('tap') }); //tap event is enabled by default
  g.on('longtap', function(){ console.log('longtap') });

  g.on('start', function(){ console.log('gesture start') });//detect the gesture start

  g.on('slide', function(){ console.log('slide') });
  g.on('slideEnd', function(){ console.log('slideEnd')  });

  g.on('pinch', function(){ console.log('pinch') });
  g.on('pinchEnd', function(){ console.log('pinchEnd') });

  g.delegate('.control-bar', 'start', function(){ console.log('control-bar is slide start') })
  g.delegate('.control-bar', 'slide', function(){ console.log('control-bar is sliding') })
  g.delegate('.control-bar', 'slideEnd', function(){ console.log('control-bar slide end') })

  g.disable('slide');

```



See Demos [Click Here](https://github.com/abcrun/besom/tree/master/demo)

### Supported Gestures

* `tap` 
* `longtap`
* `doubletap`
* `slide`
* `pinch`
* `rotate`

### Supported Events

* `tap`: enabled by default
* `longtap`
* `doubletap`
* `start`: detect gesture start 
* `slide`
* `slideEnd`
* `pinch`
* `pinchEnd`
* `rotate`
* `rotateEnd`

### Instace And Methods

##### Create Gestures Maintainer

```javascript
Besom.create(element, onlydetect)
```

* element:HTMLElement.
* onlydetect:boolean(default: false) - only detect the gestures and capture the gesture datas to the event callback function when set `true`. 

###### Gestures Maintainer Methods

* enable(gesture), disable(gesture) - enable/disable gestures 

* on(event, fn) - add gesture event callback function 

   the arguments of the event callback function - `fn(property, currentGestureEventObject, startGestureEventObject)`

  * `property` - the changed value of the gestures
  * `currentGestureEventObject` and `startGestureEventObject` is the formatted of the event object.
  * `this` - refers to a transformable element. more details see bellow.

* delegate(className, event, fn) - delegate the gesture of the child element which has the className `class`. If use this method, onlydetect will be set true.

* destroy() - destroy the gesture manager and events

##### Create Transformable Element

```javascript
Besom.element(element)
```

* element:HTMLElement.

###### Transformable Element Properties and Methods

* element - the html element
* transform - the transform property of the element
* offset() - return the element offset.left and offset.right in the page
* setOrigin(point) - set the element transform origin point({x:number, y:number}), x and y is the relative position in the element matrix.
* getPointOrigin(point) - get the point({pageX:number, pageY:number) origin in the element matrix
* translate(offset, duration) - translate offset.x as horizon and offset.y as vertical distance in duration time.
* scale(scale, duration)
* rotate(rotate, duration)


