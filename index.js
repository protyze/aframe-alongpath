if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Alongpath component for A-Frame.
 * Move Entities along a predefined Curve
 */
AFRAME.registerComponent('alongpath', {

    //dependencies: ['curve'],

    schema: {
        curve: {default: ''},
        triggers: {default: 'a-curve-point'},
        triggerRadius: {type: 'number', default: 0.01},
        dur: {default: 1000},
        delay: {default: 0},
        loop: {default: false},
        rotate: {default: false},
        resetonplay: {default:true},
        easing: {default: 'linear'}
    },

    init: function () {

        // We have to fetch curve and triggers manually because of an A-FRAME ISSUE
        // with Property-Type "Selector" / "SelectorAll": https://github.com/aframevr/aframe/issues/2517

    },

    update: function (oldData) {

        this.curve = document.querySelector(this.data.curve);
        this.triggers = this.curve.querySelectorAll(this.data.triggers);

        if (!this.curve) {
            console.warn("Curve not found. Can't follow anything...");
        } else {
            this.initialPosition = this.el.object3D.position;
        }

        this.reset();
    },

    reset: function() {
        // Reset to initial state
        this.interval = 0;

        this.el.removeState("endofpath");
        this.el.removeState("moveonpath");

        if (this.activeTrigger) {
            this.activeTrigger.removeState("alongpath-active-trigger");
            this.activeTrigger = null;
        }
    },

    tick: function (time, timeDelta) {
        var curve = this.curve.components['curve'] ? this.curve.components['curve'].curve : null;

        if (curve) {
            // Only update position if we didn't reach
            // the end of the path
            if (!this.el.is("endofpath")) {
                this.interval = this.interval + timeDelta;

                var i = 0;

                if (this.interval - this.data.delay >= this.data.dur) {
                    // Time is up, we should be at the end of the path
                    i = 1;
                } else if ((this.interval - this.data.delay < 0)) {
                    // We are still waiting for the delay-time to finish
                    // so keep entity at the beginning of the path
                    i = 0;
                } else {
                    // Update path position based on timing
                    i = (this.interval - this.data.delay) / this.data.dur;

                    // Easing functions based on https://gist.github.com/gre/1650294
                    switch (this.data.easing) {
                        case 'easeInOut':
                            i = i<.5 ? 2*i*i : -1+(4-2*i)*i;
                            break;
                        case 'easeIn':
                            i = i * i;
                            break;
                        case 'easeOut':
                            i = i * (2-i);
                            break;
                        case 'linear':
                        default:
                            break;
                    }
                }

                if ((this.data.loop === false) && i >= 1) {
                    // Set the end-position
                    this.el.setAttribute('position', curve.points[curve.points.length - 1]);

                    // We have reached the end of the path and are not going
                    // to loop back to the beginning therefore set final state
                    this.el.removeState("moveonpath");
                    this.el.addState("endofpath");
                    this.el.emit("movingended");
                } else if ((this.data.loop === true) && i >= 1) {
                    // We have reached the end of the path
                    // but we are looping through the curve,
                    // so restart here.
                    this.el.emit("movingended");
                    this.interval = this.data.delay;
                } else {
                    // We are starting to move or somewhere in the middle of the path…
                    if (!this.el.is("moveonpath")) {
                        this.el.addState("moveonpath");
                        this.el.emit("movingstarted");
                    }

                    // …updating position
                    var p = curve.getPoint(i);
                    this.el.setAttribute('position', p);
                }

                // Update Rotation of Entity
                // Based on http://jsfiddle.net/qGPTT/133/
                if (this.data.rotate === true) {
                    var axis = new THREE.Vector3();
                    var up = new THREE.Vector3(0, 1, 0);
                    var tangent = curve.getTangentAt(i).normalize();

                    axis.crossVectors(up, tangent).normalize();

                    var radians = Math.acos(up.dot(tangent));

                    this.el.object3D.quaternion.setFromAxisAngle(axis, radians);
                }

                // Check for Active-Triggers
                if (this.triggers && (this.triggers.length > 0)) {
                    this.updateActiveTrigger();
                }
            }
        } else {
            console.error("The entity associated with the curve property has no curve component.");
        }
    },

    play: function () {
        if (this.data.resetonplay) {
            this.reset();
        }
    },

    remove: function () {
        this.el.object3D.position.copy(this.initialPosition);
    },

    updateActiveTrigger: function() {
        for (var i = 0; i < this.triggers.length; i++) {
            if (this.triggers[i].object3D) {
                if (this.triggers[i].object3D.position.distanceTo(this.el.object3D.position) <= this.data.triggerRadius) {
                    // If this element is not the active trigger, activate it - and if necessary deactivate other triggers.
                    if (this.activeTrigger && (this.activeTrigger != this.triggers[i])) {
                        this.activeTrigger.removeState("alongpath-active-trigger");
                        this.activeTrigger.emit("alongpath-trigger-deactivated");

                        this.activeTrigger = this.triggers[i];
                        this.activeTrigger.addState("alongpath-active-trigger");
                        this.activeTrigger.emit("alongpath-trigger-activated");
                    } else if (!this.activeTrigger) {
                        this.activeTrigger = this.triggers[i];
                        this.activeTrigger.addState("alongpath-active-trigger");
                        this.activeTrigger.emit("alongpath-trigger-activated");
                    }

                    break;
                } else {
                    // If this Element was the active trigger, deactivate it
                    if (this.activeTrigger && (this.activeTrigger == this.triggers[i])) {
                        this.activeTrigger.removeState("alongpath-active-trigger");
                        this.activeTrigger.emit("alongpath-trigger-deactivated");
                        this.activeTrigger = null;
                    }
                }
            }
        }
    }

});