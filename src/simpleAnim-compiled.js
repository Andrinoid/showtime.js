/**
 * --------------------------------------------------------------------------
 * tour.js
 * Licensed under MIT
 * Author: Andri Birgisson
 * --------------------------------------------------------------------------
 */

//TODO create scope for all

//Polyfill for requestAnimationFrame and cancelAnimationFrame
//Source: https://github.com/darius/requestAnimationFrame
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

if (!Date.now) Date.now = function () {
    return new Date().getTime();
};

(function () {
    'use strict';

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
     || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function (callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function () {
                callback(lastTime = nextTime);
            }, nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
})();

/**
 * ------------------------------------------------------------------------
 * Utilities
 * ------------------------------------------------------------------------
 */

var normalizeElement = function normalizeElement(element) {
    function isElement(obj) {
        return (obj[0] || obj).nodeType;
    }

    if (isElement(element)) {
        return element;
    }
    if (typeof jQuery !== 'undefined') {
        if (element instanceof jQuery) return element[0];
    }
    if (typeof element === 'string') {
        return document.querySelector(element) || document.querySelector('#' + element) || document.querySelector('.' + element);
    }
};

var setClass = function setClass(el, className) {
    if (el.classList) el.classList.add(className);else el.className += ' ' + className;
};

var setStyles = function setStyles(el, styles) {
    var element = normalizeElement(el);
    for (var prop in styles) {
        if (!styles.hasOwnProperty(prop)) {
            continue;
        }
        element.style[prop] = styles[prop];
    }
};

/**
 * ------------------------------------------------------------------------
 * Element generator check out the standalone version for docs
 * https://github.com/Andrinoid/ElementGenerator.js
 * ------------------------------------------------------------------------
 */

var Elm = (function () {
    //Simple element generator. Mootools style
    //tries to find method for keys in options and run it

    function Elm(type, options, parent) {
        _classCallCheck(this, Elm);

        function isElement(obj) {
            return (obj[0] || obj).nodeType;
        }

        var args = arguments;
        if (isElement(args[1] || {}) || typeof args[1] === 'string') {
            options = {};
            parent = args[1];
        }

        this.element = null;
        if (type.indexOf('.') > -1) {
            var separated = type.split('.');
            var stype = separated[0];
            var clsName = separated[1];
            this.element = document.createElement(stype);
            this._setClass(this.element, clsName);
        } else {
            this.element = document.createElement(type);
        }
        this.options = options || {};

        for (var key in this.options) {
            if (!this.options.hasOwnProperty(key)) {
                continue;
            }
            var val = this.options[key];
            try {
                if (key === 'class') //fix for class name conflict
                    key = 'cls';
                this[key](val);
            } catch (err) {
                //pass
            }
        }

        if (parent) {
            this.inject(parent);
        }

        return this.element;
    }

    /**
     * ------------------------------------------------------------------------
     * Animations
     * Animates element from current location to given style/location
     *
     * TODO Duration is not working and animate-able styles are limeted.
     * ------------------------------------------------------------------------
     */

    _createClass(Elm, [{
        key: '_setClass',
        value: function _setClass(el, className) {
            //Method credit http://youmightnotneedjquery.com/
            if (el.classList) {
                el.classList.add(className);
            } else {
                el.className += ' ' + className;
            }
        }
    }, {
        key: 'cls',
        value: function cls(value) {
            var _this = this;

            //Name can be comma or space separated values e.q 'foo, bar'
            //Even if one class name is given we clean the string and end up with array
            var clsList = value.replace(/[|&;$%@"<>()+,]/g, "").split(' ');

            clsList.forEach(function (name) {
                _this._setClass(_this.element, name);
            });
        }
    }, {
        key: 'id',
        value: function id(value) {
            this.element.id = value;
        }
    }, {
        key: 'html',
        value: function html(str) {
            this.element.innerHTML = str;
        }
    }, {
        key: 'text',
        value: function text(str) {
            this.element.innerText = str;
        }
    }, {
        key: 'css',
        value: function css(obj) {
            for (var prop in obj) {
                if (!obj.hasOwnProperty(prop)) {
                    continue;
                }
                this.element.style[prop] = obj[prop];
            }
        }
    }, {
        key: 'inject',
        value: function inject(to) {
            var parent = normalizeElement(to);
            parent.appendChild(this.element);
        }
    }]);

    return Elm;
})();

var Animator = (function () {
    function Animator(elm, options) {
        _classCallCheck(this, Animator);

        //hello
        this.options = {
            effect: 'linear',
            duration: 6000 };
        //duration slow down animation but does not animate all the time
        _.extend(this.options, options);

        this.elm = normalizeElement(elm);

        this.effects = {
            linear: function linear(t) {
                return t;
            },
            easeOut: function easeOut(t) {
                return t * (2 - t);
            },
            easeOutQuart: function easeOutQuart(t) {
                return 1 - --t * t * t * t;
            },
            easeInOutQuint: function easeInOutQuint(t) {
                return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
            },
            b4: function b4(t) {
                return t * t * t;
            }
        };
    }

    /**
     * ------------------------------------------------------------------------
     * Tooltip
     * Creates bootstrap-like tooltip with position relative to given element
     *
     * TODO Create nice animation for show hide
     * TODO prevent overflow of viewport
     * ------------------------------------------------------------------------
     */

    _createClass(Animator, [{
        key: 'animate',
        value: function animate() {
            var _this2 = this;

            var start = new Date();
            var repeat = function repeat() {
                var timePassed = new Date() - start;
                var progress = timePassed / _this2.options.duration * 100;
                if (progress > 1) {
                    progress = 1;
                }
                var delta = _this2.effects[_this2.options.effect](progress);
                _this2.applyStyles(delta);
                if (progress === 1) {

                    return;
                }
                _this2.step();
                _this2.loopID = requestAnimationFrame(repeat);
            };
            this.loopID = requestAnimationFrame(repeat);
        }

        //method to override
    }, {
        key: 'step',
        value: function step() {}
    }, {
        key: 'compute',
        value: function compute(from, to, delta) {
            return (to - from) * delta + from;
        }

        //Note that this function also retrives the current size and position of the focus element
    }, {
        key: 'applyStyles',
        value: function applyStyles(delta) {
            var _this3 = this;

            //this.fireEvent('tick', this.elm);
            _.each(this.styles, function (value, property) {
                var from = parseInt(getComputedStyle(_this3.elm).getPropertyValue(property)) || 0;
                var nextValue = Math.round(_this3.compute(from, value, delta));
                _this3.elm.style[property] = nextValue + 'px';
            });
        }
    }, {
        key: 'disappear',
        value: function disappear() {
            var left = this.styles.width / 2 + this.styles.left;
            var top = this.styles.height / 2 + this.styles.top;
            this.styles = { 'width': 0, 'height': 0, 'left': left, 'top': top };
            //this.animate();
        }
    }, {
        key: 'start',
        value: function start(styles) {
            this.styles = styles;
            this.animate();
        }
    }]);

    return Animator;
})();

var Tooltip = (function () {
    function Tooltip(element, config) {
        _classCallCheck(this, Tooltip);

        this.element = normalizeElement(element);
        this.popover = null;

        this['default'] = {
            animation: true,
            template: '\n             <div class="popover" role="tooltip">\n                <div class="arrow"></div>\n                <h3 class="popover-title"></h3>\n                <div class="popover-content"></div>\n             </div>',
            title: '',
            content: '',
            delay: 0,
            placement: 'top', //top, left, right, bottom
            offset: '0 0',
            collision: 'fit'
        };
        _.extend(this['default'], config);

        this.setElementContents();
        this.setDirection();
        this.create();
    }

    /**
     * ------------------------------------------------------------------------
     * Focus
     * Creates 4 transparent overlay around the given element
     *
     * TODO Create nice animation for show hide
     * TODO prevent overflow of viewport
     * TODO add padding option
     * ------------------------------------------------------------------------
     */

    _createClass(Tooltip, [{
        key: 'getTipElement',
        value: function getTipElement() {
            return this.tip = this.tip || this.config.template;
        }
    }, {
        key: 'setElementContents',
        value: function setElementContents(selector) {
            var div = document.createElement('div');
            div.innerHTML = this['default'].template;
            var title = div.querySelector('.popover-title');
            var inner = div.querySelector('.popover-content');

            if (!this['default'].content) {
                throw new Error('Tooltip has no content');
            }
            if (this['default'].title) {
                title.innerText = this['default'].title;
            } else {
                title.style.display = 'none';
            }

            inner.innerHTML = this['default'].content;
            this.popover = div.children[0];
        }
    }, {
        key: 'setDirection',
        value: function setDirection() {
            setClass(this.popover, this['default'].placement);
        }
    }, {
        key: 'create',
        value: function create() {
            document.body.appendChild(this.popover);
        }
    }, {
        key: 'remove',
        value: function remove() {
            this.popover.parentNode.removeChild(this.popover);
        }
    }, {
        key: 'show',
        value: function show() {
            this.popover.style.display = 'block';
            this.setPosition();
        }
    }, {
        key: 'setPosition',
        value: function setPosition() {
            var placement = this['default'].placement;
            var elDim = this.element.getBoundingClientRect();
            var popDim = this.popover.getBoundingClientRect();
            var top = undefined,
                left = undefined;
            if (placement === 'top') {
                top = elDim.top - popDim.height;
                left = elDim.left + elDim.width / 2 - popDim.width / 2;
                if (this['default'].collision === 'fit' && top < 0) {
                    top = 0;
                }
                if (this['default'].collision === 'fit' && left < 0) {
                    left = 0;
                }
            }
            if (placement === 'left') {
                top = elDim.top + elDim.height / 2 - popDim.height / 2;
                left = elDim.left - popDim.width;
                if (this['default'].collision === 'fit' && left < 0) {
                    left = 0;
                }
            }
            if (placement === 'right') {
                top = elDim.top + elDim.height / 2 - popDim.height / 2;
                left = elDim.left + elDim.width;
            }
            if (placement === 'bottom') {
                top = elDim.top + elDim.height;
                left = elDim.left + elDim.width / 2 - popDim.width / 2;
            }

            this.popover.style.top = top + 'px';
            this.popover.style.left = left + 'px';
        }
    }]);

    return Tooltip;
})();

var Focus = (function () {
    function Focus(config) {
        _classCallCheck(this, Focus);

        this['default'] = {
            padding: 10
        };
        _.extend(this['default'], config);
        this.buildDom();

        this.animator = new Animator(this.focusBox.middle, {
            effect: 'easeOut',
            duration: 60000
        });
        //this.animator.step = function() {
        //    self.setBackdropPos(this.ghost);
        //};
    }

    /**
     * ------------------------------------------------------------------------
     * Chainwork
     * Synchronous way of running components with complete controls
     *
     * TODO This is the whole chainwork framework. we need a lighter version of it in es6
     *
     * ------------------------------------------------------------------------
     */

    //typeOf based on mootools typeOf

    _createClass(Focus, [{
        key: 'buildDom',
        value: function buildDom() {
            this.focusBox = {
                middle: new Elm('div.ghost-focus', {
                    css: {
                        position: 'absolute',
                        top: '50%',
                        left: '50%'
                    }
                }, document.body),
                right: new Elm('div.to_right', {}, document.body),
                top: new Elm('div.to_top', {}, document.body),
                bottom: new Elm('div.to_bottom', {}, document.body),
                left: new Elm('div.to_left', {}, document.body)
            };
        }
    }, {
        key: 'focusOn',
        value: function focusOn(elm) {
            var _this4 = this;

            var focusElm = normalizeElement(elm);
            var styles = focusElm.getBoundingClientRect();

            this.animator.start({
                width: styles.width,
                height: styles.height,
                left: styles.left,
                top: styles.top
            });
            this.animator.step = function (el) {
                _this4.setCoverPos(el);
            };
        }
    }, {
        key: 'setCoverPos',
        value: function setCoverPos(el) {
            var dimentions = this.focusBox.middle.getBoundingClientRect();

            setStyles(this.focusBox.top, {
                top: 0,
                left: 0,
                right: 0,
                height: dimentions.top - this['default'].padding + 'px'
            });
            setStyles(this.focusBox.bottom, {
                top: dimentions.top + dimentions.height + this['default'].padding + 'px',
                bottom: 0,
                left: dimentions.left - this['default'].padding + 'px',
                width: dimentions.width + this['default'].padding * 2 + 'px'
            });
            setStyles(this.focusBox.right, {
                top: dimentions.top - this['default'].padding + 'px',
                bottom: 0,
                right: 0,
                left: dimentions.left + dimentions.width + this['default'].padding + 'px'
            });
            setStyles(this.focusBox.left, {
                top: dimentions.top - this['default'].padding + 'px',
                bottom: 0,
                left: 0,
                width: dimentions.left - this['default'].padding + 'px'
            });
        }
    }]);

    return Focus;
})();

function typeOf(item) {
    'use strict';
    if (item === null) {
        return 'null';
    }
    if (typeof item === 'string') return 'string';
    if (item.nodeName) {
        if (item.nodeType === 1) {
            return 'element';
        }
        if (item.nodeType === 3) {
            return (/\S/.test(item.nodeValue) ? 'textnode' : 'whitespace'
            );
        }
    } else if (typeof item.length === 'number') {
        if (item.callee) {
            return 'arguments';
        }
        if ('item' in item) {
            return 'collection';
        }
    }
    return typeof item;
}

var ChainWork = (function () {
    function ChainWork(options) {
        var self = this;
        var options = options || {};
        this.debug = options['debug'] || false;
        this.autoPlay = options['autoPlay'] || false;
        this.onComplete = options['onComplete'] || function () {};
        //Constructor
        this.chain = [];
        this.isPlay = false;
        this.isAbort = false;
        this.initIndex = 0; //index for added components before chain is started
        this.index = 0;
        this.cycles = 0;
        //cache is not cleared by the chain, but can be overwritten by any component.
        this.cache = null;

        this.parallelsCount = 0;
        this.activeParallel = null;
        this.parallels = {};

        this.collection = {/*collected data by the chain DEPRICATED*/};
        this.stamps = [];
        //Play on load if autoplay is set
        if (this.autoPlay) {
            document.addEventListener('DOMContentLoaded', function () {
                self.play();
            }, false);
        }
    }

    //This is a trail of the components that have executed used for dependancy checks
    ChainWork.prototype.componentStamp = function () {
        this.stamps.push(this.chain[this.index].componentName);
        if (this.debug) {
            var name = this.getComponentProperty('name');
            console.log('running component: ' + name);
        }
    };

    ChainWork.prototype.getComponentProperty = function (property) {
        return components[this.chain[this.index].componentName][property];
    };

    ChainWork.prototype.getChainProperty = function (property) {
        return this.chain[this.index][property];
    };

    ChainWork.prototype.chainHasProperty = function (property) {
        return this.chain[this.index] ? hasOwnProperty.call(this.chain[this.index], property) : false;
    };

    ChainWork.prototype.componentHasProperty = function (property) {
        return components[this.chain[this.index].componentName] ? hasOwnProperty.call(components[this.chain[this.index].componentName], property) : false;
    };

    ChainWork.prototype._setProperty = function (property, value) {
        components[this.chain[this.index].componentName][property] = value;
    };

    //take the information provided by component and store them
    ChainWork.prototype.extendGlobal = function () {
        var provides = this.getComponentProperty('provides');
        _.extend(this.collection, provides);
    };

    ChainWork.prototype._applySettings = function () {
        //this method might have a problem because it overrides the component settings so it doesn't have the same init settings for next run
        var settings = _.mapValues(this.getChainProperty('settings'), function (value, key) {
            //dont reveal function that start with on or call.
            if (key.slice(0, 2) === 'on' || key.slice(0, 4) === 'call') return value;
            //reveal functions values. this allows the chain to give settings as function to reveal values on chain runtime insted of being collected as static values onLoad
            if (typeOf(value) === 'function') return value();
            return value;
        });
        var compontentSettings = this.getComponentProperty('settings');

        _.assign(compontentSettings, settings);
    };

    ChainWork.prototype._checkForDependancies = function () {
        var self = this;
        var dependancies = this.getComponentProperty('dependsOn');
        if (!dependancies) return false;
        var errorList = _.map(dependancies, function (item) {
            if (self.stamps.indexOf(item) === -1) {
                return item;
            }
        });
        if (errorList[0]) return errorList;
        return false;
    };

    ChainWork.prototype._checkForOnce = function () {
        //If the component has property once and if it is true then skip it
        if (this.chainHasProperty('once')) {
            if (this.getChainProperty('once')) {
                this.componentDone();
                return true;
            }
        }
        //if the component has property once then mark it as true to prevent it from running again.
        if (this.chainHasProperty('once')) {
            this.chain[this.index].once = true;
        }
        return false;
    };

    ChainWork.prototype._checkForAssignment = function () {
        //if component has assignment to next component or this component has assignment from previous we take care of it here.
        //We must add the assigned function to "this" for binding and give the function access to this class
        //This occurs if the previous component have added the assignToNext property to the component

        if (this.chainHasProperty('assigned')) {
            this.assignment = this.getChainProperty('assigned');
            this.assignment();
            delete this.chain[this.index]['assigned'];
        }

        if (this.componentHasProperty('assignToNext')) {
            var assignment = this.getComponentProperty('assignToNext');
            try {
                this.chain[this.index + 1]['assigned'] = assignment;
            } catch (err) {
                //pass
                //this error happens when pause component is added to the end of the chain.
            }
        }
    };

    ChainWork.prototype._checkForOutOfRange = function () {
        //has chain reached the end?
        if (this.index >= this.chain.length) {
            // if(this.autoReset) {
            //     this.reset();
            // }

            if (this.debug) console.log('chain has reached the end');
            this.cycles++;
            if (this.cycles > 50) {
                throw 'Chainwork is running an unexpected loop and was stoped after 50 cycles';
                return false;
            }
            //event triggered when chain has reached end
            this.onComplete(this.collection);
            return true;
        }
        return false;
    };

    ChainWork.prototype.callchain = function (caller) {
        var self = this;
        if (this._checkForOutOfRange()) return false;
        if (this._checkForOnce()) return false;
        this._checkForAssignment();
        this.caller = caller || 'user'; // if caller is not defined we asume its a user action

        //if dependancies are listed run them before
        var depsErrorList = this._checkForDependancies();
        if (depsErrorList.length) {
            if (this.debug) console.warn(this.chain[this.index].componentName, 'might be missing dependancy, please add them before. Missing:' + depsErrorList.toString());
        }
        this._applySettings();
        //inject the this class as parent of all components. so components can access it with this.parent
        this._setProperty('parent', this);

        if (this.componentHasProperty('pre')) {
            components[this.chain[this.index].componentName].pre();
        }
        //this gives pre function chance to abort if needed e.g force user action
        if (this.isAbort) {
            return false;
        }
        components[this.chain[this.index].componentName].job();
        //this gives job function chance to abort if needed e.g force user action
        if (this.isAbort) {
            return false;
        }
        this.componentStamp();
    };

    ChainWork.prototype.runSingle = function (componentRef, onDone) {
        var self = this;
        var component = _.cloneDeep(components[componentRef.componentName]);
        //apply settings
        //var refSettings = componentRef.settings;
        var refSettings = _.mapValues(componentRef.settings, function (value, key) {
            //dont reveal function that start with on or call.
            if (key.slice(0, 2) === 'on' || key.slice(0, 4) === 'call') return value;
            //reveal functions values. this allows the chain to give settings as function to reveal values on chain runtime insted of being collected as static values onLoad
            if (typeOf(value) === 'function') return value();
            return value;
        });
        var compontentSettings = component['settings'];
        _.assign(compontentSettings, refSettings);

        //set parent property to component. We dont want the parallel components to affect the rest of the chain so the get a fake parent
        var fakeParent = {
            componentDone: function componentDone() {
                onDone();
                self.extendGlobal(); //DEPRICATED
                //We should collect componentDone calls to know when the par component is done and user could set it to whait for it
                //we must know how many par component is in the collection maybe we can do it in the component
            },
            caller: 'chain', //?
            stop: self.stop,
            debug: self.debug

        };
        component['parent'] = fakeParent;

        //Check if component has pre function
        if (component ? hasOwnProperty.call('pre') : false) {
            component.pre();
        }
        //this gives pre function chance to abort if needed e.g force user action
        if (this.isAbort) {
            return false;
        }
        component.job();
        //this gives job function chance to abort if needed e.g force user action
        if (this.isAbort) {
            return false;
        }
        //set component stamp
        this.stamps.push(componentRef.componentName);
        if (this.debug) {
            var name = component['name'];
            console.log('running component: ' + name);
        }
    };

    ChainWork.prototype.componentDone = function () {
        var self = this;
        //Force this to the bottom of execution
        setTimeout(function () {
            //DEPRICATED. NO COMPONENT USES IT AND IT DOESN'T MAKE SENS
            if (self.getComponentProperty('post')) {
                components[self.chain[self.index].componentName].post();
            }
            //
            self.extendGlobal(); //DEPRICATED
            self.index++;
            if (self.isPlay) {
                self.callchain('chain');
            }
        });
    };

    ChainWork.prototype.injectBefore = function (component) {
        this.chain.splice(this.index - 1, 0, component);
    };

    ChainWork.prototype.injectAfter = function (component) {
        this.chain.splice(this.index + 1, 0, component);
    };

    ChainWork.prototype.remove = function (index) {
        if (index === 'last') {
            index = this.chain.length - 1;
        }
        if (index === 'first') {
            index = 0;
        }
        this.chain.splice(index, 1);
    };

    ChainWork.prototype.play = function (caller) {
        var caller = caller || 'user';
        this.isPlay = true;
        this.isAbort = false;
        this.callchain(caller);
        return this;
    };

    ChainWork.prototype.reset = function (index) {
        if (!this._checkForOutOfRange()) {
            //if the chain is at the end the index is larger then the chain length at this point. so we cannot check for assignment on next component as it is not defined.
            this._checkForAssignment();
        }
        this.isAbort = true;
        this.collection = {};
        this.stamps.length = index || 0;
        this.index = index || 0;
    };

    ChainWork.prototype.seek = function (index) {
        //if index is string wee try to find a call functoin by that name and get the index value fom the match
        if (typeof index === 'string') {
            _.forEach(this.chain, function (ref, i) {
                if (_.findKey(ref, 'call') && ref.settings.call.name === index) {
                    index = i;
                    return;
                }
            });
        }

        this.reset(index);
    };

    ChainWork.prototype.next = function (caller) {
        var caller = caller || 'user';
        this.isPlay = false;
        this.isAbort = false;
        this.callchain(caller);
    };

    ChainWork.prototype.previous = function (caller) {
        var caller = caller || 'user';
        this.isPlay = false;
        this.isAbort = false;
        this.index < 1 ? this.index = 0 : this.index--;
        this.callchain(caller);
    };

    ChainWork.prototype.stop = function () {
        this.isPlay = false;
        this.isAbort = true;
    };

    /*
     *Add supports two syntax styles
     *chain.add(name, {})
     *chain.add({componentName: name, settings: {}})
     */
    ChainWork.prototype._add = function (args) {
        //this a base function for other methods that can add components to the chain e.g once and async
        var component;
        if (args.length > 1 || typeOf(args[0]) === 'string') {
            component = {
                componentName: args[0],
                settings: args[1] ? args[1] : {}
            };
        } else {
            component = args[0];
        }

        //Run init function on when components are added
        try {
            //inject chain as parent to access in init functions
            components[component.componentName]['parent'] = this;
            components[component.componentName]['init'](component);
        } catch (err) {
            //pass
        }
        return component;
    };

    ChainWork.prototype.add = function (name, settings, isParallel) {
        if (typeof arguments[0] === 'function') {
            //if first argument is a function we port that function in a call component with the injection type
            //call generates the call component and call this function back
            this.call(arguments[0], 'add');
            return this;
        }

        if (!isParallel) {
            this.activeParallel = null;
        }
        var component = this._add(arguments);
        this.chain.push(component);
        this.initIndex++;
        return this;
    };

    ChainWork.prototype.once = function (name, settings, isParallel) {
        //same as add except for the once property thats added to the component.
        //once makes component disposable. When compnent get's called first time the once property is set to true.
        if (typeof arguments[0] === 'function') {
            //if first argument is a function we port that function in a call component with the injection type
            //call generates the call component and call this function back
            this.call(arguments[0], 'once');
            return this;
        }

        if (!isParallel) {
            this.activeParallel = null;
        }
        var component = this._add(arguments);
        component['once'] = false;
        this.chain.push(component);
        this.initIndex++;
        return this;
    };

    ChainWork.prototype._newParCollector = function () {
        this.parallels[++this.parallelsCount] = [];
        return this.parallelsCount;
    };

    //**********************
    // Shortcuts to core components
    // It gives more readable syntax but follows the component standard
    //**********************
    ChainWork.prototype.par = function (name, settings) {
        //par collects all par siblings in a par collection. and replace all these components with one parallel component
        //The parallel component has an id for the parallel collection and exetutes all components at "once"

        if (typeof arguments[0] === 'function') {
            //if first argument is a function we port that function in a call component with the injection type
            //call generates the call component and call this function back
            this.call(arguments[0], 'par');
            return this;
        }

        var component = this._add(arguments);
        if (!this.activeParallel) {
            this.activeParallel = this._newParCollector();

            this.add('parallel', { uid: this.activeParallel }, true);
        }
        this.parallels[this.activeParallel].push(component);
        return this;
    };

    ChainWork.prototype.call = function (fn, injectType) {
        var injectType = injectType || 'add';
        var componentName;
        _.includes(fn.toString(), 'sync') ? componentName = 'callSync' : componentName = 'callAsync';
        this[injectType]({ // injectType can be add, once, par
            componentName: componentName,
            settings: {
                call: fn
            }
        });
        return this;
    };

    return ChainWork;
})();

/*
 ---
 *Component
 *
 *returns one compenent and runs it
 *e.g Component.run('name', {someSettings: 'foo'});
 */
var _Component = (function () {

    function Component() {
        this.run = function (name, settings) {
            var component = {
                componentName: name,
                settings: settings
            };
            var link = new ChainWork();
            link.add(component);
            link.play();
        };
    }

    return Component;
})();

var Component = new _Component();

/*
 ---
 *Core components for ChainWork.
 *
 *Core components follows the component standard.
 *They extend the chainwork methods and have short method defined in the Chainwork class
 *e.g chain.call(Fn);
 */

var components = {

    parallel: {
        name: 'parallel',
        settings: {
            uid: null
        },
        job: function job() {
            var self = this;
            var collection = this.parent.parallels[this.settings.uid];
            var doneCounter = 0;
            for (var i = 0; i < collection.length; i++) {
                this.parent.runSingle(collection[i], function () {
                    if (++doneCounter === collection.length) {
                        self.parent.componentDone();
                    }
                });
            }
        }
    },

    callAsync: {
        name: 'callAsync',
        requirements: [],
        provides: {},
        settings: {
            call: null
        },
        job: function job() {
            var self = this;
            //If provided function has name extend it to this component name for debug and clarity
            this.name = this.settings.call.name ? 'callAsync-' + this.settings.call.name : 'callAsync';
            this.settings.call();
            setTimeout(function () {
                self.parent.componentDone();
            });
        }
    },

    callSync: {
        name: 'callSync',
        settings: {
            call: null
        },
        job: function job() {
            var self = this;
            //If provided function has name extend it to this component name for debug and clarity
            this.name = this.settings.call.name ? 'callSync-' + this.settings.call.name : 'callAsync';
            var onComplete = function onComplete() {
                self.parent.componentDone();
            };
            this.settings.call(onComplete);
        }
    },

    /*
     * This component is wierd for a good reason.
     * Pause stops the chain and removes it self from the chain. So next component has a trusted event if needed e.g window popup
     * The removed component must be added again so the chain doesn't break if reseted.
     * so the component makes a clone of itself and assignToNext will replace the component.
     *
     * More on trusted events http://www.w3.org/TR/DOM-Level-3-Events/#trusted-events
     */
    pause: {
        name: 'pause',
        requirements: [],
        provides: {},
        settings: {
            delay: null
        },
        job: function job() {
            var self = this;
            this.parent.stop();
            this.parent.cache = _.clone(this.parent.chain[this.parent.index]);
            setTimeout(function () {
                self.parent.chain.splice(self.parent.index, 1);
            });
            if (this.settings.delay) {
                setTimeout(function () {
                    self.parent.play('chain');
                }, this.settings.delay);
            }
        },
        assignToNext: function assignToNext() {
            this.index++;
            this.injectBefore(this.cache);
        }
    },

    reset: {
        name: 'reset',
        settings: {
            index: 0
        },
        job: function job() {
            this.parent.isAbort = true;
            this.parent.collection = {};
            this.parent.stamps.length = this.settings.index;
            this.parent.index = this.settings.index;
        }
    }
};

components.showtime = {
    name: 'showtime',
    settings: {
        element: null,
        padding: 10,
        clickThrough: true, //TODO
        title: '',
        placement: 'right',
        focus: null,
        content: ''
    },
    job: function job() {
        //remove last tooltip
        try {
            this.parent.tooltip.remove();
        } catch (err) {
            //tooltip does not excist
        }
        console.log(this.settings.content);
        var tooltip = this.parent.tooltip = new Tooltip(this.settings.element, {
            content: this.settings.content,
            title: this.settings.title,
            placement: this.settings.placement
        });

        tooltip.show();
        this.settings.focus.focusOn(this.settings.element);
        this.parent.componentDone();
    }
};

/**
 * ------------------------------------------------------------------------
 * Tour / Showtime
 * This class ties it all together
 * ------------------------------------------------------------------------
 */

var Tour = (function () {
    function Tour(options) {
        _classCallCheck(this, Tour);

        this.chain = new ChainWork();
        this.focus = new Focus();

        this['default'] = {
            focus: new Focus()
        };
    }

    _createClass(Tour, [{
        key: 'show',
        value: function show(settings) {
            _.extend(settings, this['default']);
            this.chain.add('showtime', settings).add('pause');
            return this;
        }
    }, {
        key: 'start',
        value: function start() {
            this.chain.reset();
            this.chain.play();
        }
    }, {
        key: 'next',
        value: function next() {
            console.log('next');
            this.chain.play();
        }
    }, {
        key: 'previous',
        value: function previous() {
            this.chain.previous();
        }
    }, {
        key: 'reset',
        value: function reset() {
            this.chain.reset();
        }
    }, {
        key: 'startOver',
        value: function startOver() {
            this.chain.reset();
            this.chain.play();
        }
    }]);

    return Tour;
})();

//# sourceMappingURL=simpleAnim-compiled.js.map