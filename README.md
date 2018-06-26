## aframe-alongpath-component
A component for [A-Frame](https://aframe.io) that allows entities to follow predefined paths.

New in Version 1.0.0:

The alongpath component went through a refactoring process. The entire logic of creating curves/paths has been extracted into the [Curve component](https://github.com/protyze/aframe-curve-component). This allows for more flexibility and less complexity and refocusing solely on the task of moving objects along a path.

With this Version it is now possible to promote single path-points to be "Trigger-Points" - meaning that they will fire an event as soon as the Entity moves past these points.


![](http://lab.immersiveweb.ch/assets/aframe_alongpath_component.gif)

### Properties

| Property | Description                                                                          | Default Value |
| -------- | -----------                                                                          | ------------- |
| curve    | Selector to reference to the corresponding [curve](https://github.com/protyze/aframe-curve-component) | ''            |
| triggers   | Selector to identify the Trigger-Points that should fire the alongpath-trigger-activated-Event when the entity moves close to it.                               | 'a-curve-point'         |
| triggerRadius   | Defines how close the entity should be to the Trigger-Point to activate it.                               | 0.01         |
| dur      | Duration in milliseconds for the object to follow the entire path                    | 1000          |
| delay    | Number of milliseconds to wait for the animation to begin                            | 2000          |
| loop     | Whether or not the animation should loop                                             | false         |
| rotate   | Whether or not the Entity should adjust it's rotation while moving along the path    | false         |
| resetonplay   | Whether or not the Movement on the path should be reset on the play event    | true         |
| easing   | Defines how the animation between two points is eased. Available options are: `easeIn`, `easeOut`, `easeInOut`, `linear` | 'linear'      |

### Events

| Event    | Description                                                 |
| -------- | -----------                                                 |
| movingstarted     | The Entity is about to start moving along the path |
| movingended   | The Entity has completed moving along the path         |
| alongpath-trigger-activated   | The Entity has activated a Trigger-Point (Fired on the corresponding 'curve-point') |
| alongpath-trigger-deactivated   | The Entity has deactivated a Trigger-Point (Fired on the corresponding 'curve-point')          |

### States

| State    | Description                                      |
| -------- | -----------                                      |
| moveonpath     | The Entity currently moving along the path |
| endofpath   | The Entity has completed moving along the path|
| alongpath-active-trigger   | The moving entity has activated a Trigger-Point (which has now this active state) |

### Usage with A-Frame Inspector

You can use the [A-Frame Inspector](https://github.com/aframevr/aframe-inspector) to manually modify the predefined paths. To do so, you can open the Inspector as usual, and start moving around the a-curve-point Entities of the curve. The path will change instantly.

![](http://lab.immersiveweb.ch/assets/aframe-alongpath-component-inspector.gif)

### Usage

#### Browser Installation

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://rawgit.com/aframevr/aframe/master/dist/aframe-master.min.js"></script>
  <script src="https://rawgit.com/protyze/aframe-curve-component/master/dist/aframe-curve-component.min.js"></script>
  <script src="https://rawgit.com/protyze/aframe-alongpath-component/master/dist/aframe-alongpath-component.min.js"></script>
</head>

<body>
  <a-scene>
    <a-curve id="track1">
      <a-curve-point position="-2 2 -3"></a-curve-point>
      <a-curve-point position="0 1 -3"></a-curve-point>
      <a-curve-point position="2 2 -3"></a-curve-point>
    </a-curve>
    
    <a-box alongpath="curve: #track1"></a-box>
  </a-scene>
</body>
```

#### NPM Installation

Install via NPM:

```bash
npm install aframe-alongpath-component
```

Then register and use.

```js
require('aframe');
require('aframe-curve-component');
require('aframe-alongpath-component');
```

Thanks to https://jsbin.com/dasefeh/edit?html,output for the basic concept.