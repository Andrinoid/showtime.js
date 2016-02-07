'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * --------------------------------------------------------------------------
 * ShowTime.js
 * Licensed under MIT
 * Author: Andri Birgisson
 * --------------------------------------------------------------------------
 */

//Note Modules not tested
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function () {
            root.Showtime = factory();
            return root.Showtime;
        });
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        // Node. Does not work with strict CommonJS.
        module.exports = factory();
    } else {
        // Browser globals.
        window.Showtime = factory();
    }
})(undefined, function () {
    /**
     * ------------------------------------------------------------------------
     * Polyfills
     * ------------------------------------------------------------------------
     */
    //Polyfill for requestAnimationFrame and cancelAnimationFrame
    //Source: https://github.com/darius/requestAnimationFrame
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

    //http://stackoverflow.com/questions/8830839/javascript-dom-remove-element
    (function () {
        var typesToPatch = ['DocumentType', 'Element', 'CharacterData'],
            remove = function remove() {
            // The check here seems pointless, since we're not adding this
            // method to the prototypes of any any elements that CAN be the
            // root of the DOM. However, it's required by spec (see point 1 of
            // https://dom.spec.whatwg.org/#dom-childnode-remove) and would
            // theoretically make a difference if somebody .apply()ed this
            // method to the DOM's root node, so let's roll with it.
            if (this.parentNode != null) {
                this.parentNode.removeChild(this);
            }
        };

        for (var i = 0; i < typesToPatch.length; i++) {
            var type = typesToPatch[i];
            if (window[type] && !window[type].prototype.remove) {
                window[type].prototype.remove = remove;
            }
        }
    })();

    /**
     * ------------------------------------------------------------------------
     * Utilities
     * ------------------------------------------------------------------------
     */

    var capitalize = function capitalize(s) {
        return s[0].toUpperCase() + s.slice(1);
    };

    var throttle = function throttle(fn, threshhold, scope) {
        threshhold || (threshhold = 250);
        var last, deferTimer;
        return function () {
            var context = scope || this;

            var now = +new Date(),
                args = arguments;
            if (last && now < last + threshhold) {
                // hold on to it
                clearTimeout(deferTimer);
                deferTimer = setTimeout(function () {
                    last = now;
                    fn.apply(context, args);
                }, threshhold);
            } else {
                last = now;
                fn.apply(context, args);
            }
        };
    };

    //extend Object
    var extend = function extend() {
        for (var i = 1; i < arguments.length; i++) {
            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) arguments[0][key] = arguments[i][key];
            }
        }return arguments[0];
    };
    //Clone Object
    var clone = function clone(obj) {
        if (obj === null || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || 'isActiveClone' in obj) return obj;

        var temp = obj.constructor(); // changed

        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                obj['isActiveClone'] = null;
                temp[key] = clone(obj[key]);
                delete obj['isActiveClone'];
            }
        }

        return temp;
    };

    var isObject = function isObject(value) {
        return value != null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
    };

    var foreach = function foreach(arg, func) {
        if (!isArray(arg) && !isObject(arg)) var arg = [arg];
        if (isArray(arg)) {
            for (var i = 0; i < arg.length; i++) {
                func.call(window, arg[i], i, arg);
            }
        } else if (isObject(arg)) {
            for (var key in arg) {
                func.call(window, arg[key], key, arg);
            }
        }
    };

    //array map
    var map = function map(arr, func) {
        if (!isArray(arr)) var arg = [arg];
        for (var i = 0; i < arr.length; i++) {
            var result = func.call(window, arr[i]);
            if (typeof result !== 'undefined') arr[i] = result;
        }
        return arr;
    };

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

    function scrollToY(scrollTargetY, speed, easing, cb) {
        //credit http://stackoverflow.com/questions/12199363/scrollto-with-animation/26798337#26798337
        // scrollTargetY: the target scrollY property of the window
        // speed: time in pixels per second
        // easing: easing equation to use

        var scrollY = window.scrollY,
            scrollTargetY = scrollTargetY || 0,
            speed = speed || 2000,
            easing = easing || 'easeOutSine',
            currentTime = 0;

        // min time .1, max time .8 seconds
        var time = Math.max(.1, Math.min(Math.abs(scrollY - scrollTargetY) / speed, .8));

        // easing equations from https://github.com/danro/easing-js/blob/master/easing.js
        var PI_D2 = Math.PI / 2,
            easingEquations = {
            easeOutSine: function easeOutSine(pos) {
                return Math.sin(pos * (Math.PI / 2));
            },
            easeInOutSine: function easeInOutSine(pos) {
                return -0.5 * (Math.cos(Math.PI * pos) - 1);
            },
            easeInOutQuint: function easeInOutQuint(pos) {
                if ((pos /= 0.5) < 1) {
                    return 0.5 * Math.pow(pos, 5);
                }
                return 0.5 * (Math.pow(pos - 2, 5) + 2);
            }
        };

        // add animation loop
        function tick() {
            currentTime += 1 / 60;

            var p = currentTime / time;
            var t = easingEquations[easing](p);

            if (p < 1) {
                requestAnimationFrame(tick);

                window.scrollTo(0, scrollY + (scrollTargetY - scrollY) * t);
            } else {
                cb();
                window.scrollTo(0, scrollTargetY);
            }
        }

        // call it once to get started
        tick();
    }

    function fadeOutRemove(el) {
        el.style.transition = 'ease opacity 0.5s';
        el.style.webkitTransition = 'ease opacity 0.5s';
        el.style.opacity = 0;
        setTimeout(function () {
            el.remove();
        }, 500);
    }

    /**
     * ------------------------------------------------------------------------
     * Element generator check out the standalone version for docs
     * https://github.com/Andrinoid/ElementGenerator.js
     * ------------------------------------------------------------------------
     */

    var Elm = function () {
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
    }();

    /**
     * ------------------------------------------------------------------------
     * Animations
     * Animates element from current location to given style/location
     *
     * TODO Duration is not working and animate-able styles are limeted.
     * ------------------------------------------------------------------------
     */

    var Animator = function () {
        function Animator(elm, options) {
            _classCallCheck(this, Animator);

            //hello
            this.options = {
                effect: 'linear',
                duration: 6000 };
            //duration slow down animation but does not animate all the time
            this.options = extend(this.options, options);

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
                        _this2.complete();
                        return;
                    }
                    _this2.step();
                    _this2.loopID = requestAnimationFrame(repeat);
                };
                this.loopID = requestAnimationFrame(repeat);
            }

            //method to override

        }, {
            key: 'complete',
            value: function complete() {}

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
                //this.fireEvent('tick', this.elm);
                for (var prop in this.styles) {
                    if (!this.styles.hasOwnProperty(prop)) {
                        continue;
                    }
                    var value = this.styles[prop];
                    var from = parseInt(getComputedStyle(this.elm).getPropertyValue(prop)) || 0;
                    var nextValue = Math.round(this.compute(from, value, delta));
                    this.elm.style[prop] = nextValue + 'px';
                }
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
    }();

    /**
     * ------------------------------------------------------------------------
     * Tooltip
     * Creates bootstrap-like tooltip with position relative to given element
     *
     * TODO Create nice animation for show hide
     * TODO prevent overflow of viewport
     * ------------------------------------------------------------------------
     */

    var STYLES = '\n    <style>\n      .popover {\n          position: absolute;\n          box-sizing: border-box;\n          min-width: 250px;\n          top: 0;\n          left: 0;\n          z-index: 1060;\n          display: none;\n          max-width: 276px;\n          padding: 1px;\n          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;\n          font-style: normal;\n          font-weight: normal;\n          letter-spacing: normal;\n          line-break: auto;\n          line-height: 1.42857143;\n          text-align: left;\n          text-align: start;\n          text-decoration: none;\n          text-shadow: none;\n          text-transform: none;\n          white-space: normal;\n          word-break: normal;\n          word-spacing: normal;\n          word-wrap: normal;\n          font-size: 14px;\n          background-color: #fff;\n          background-clip: padding-box;\n          border: 1px solid #ccc;\n          border: 1px solid rgba(0, 0, 0, 0.2);\n          border-radius: 2px;\n          -webkit-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);\n          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);\n      }\n      .popover.top {\n          margin-top: -10px;\n      }\n      .popover.right {\n          margin-left: 10px;\n      }\n      .popover.bottom {\n          margin-top: 10px;\n      }\n      .popover.left {\n          margin-left: -10px;\n      }\n      .popover-title {\n          margin: 0;\n          padding: 8px 14px;\n          font-size: 14px;\n          background-color: #f7f7f7;\n          border-bottom: 1px solid #ebebeb;\n          border-radius: 1px 1px 0 0;\n          box-sizing: border-box;\n      }\n      .popover-content {\n          padding: 9px 14px;\n          box-sizing: border-box;\n      }\n      .popover > .arrow,\n      .popover > .arrow:after {\n          position: absolute;\n          display: block;\n          width: 0;\n          height: 0;\n          border-color: transparent;\n          border-style: solid;\n      }\n      .popover > .arrow {\n          border-width: 11px;\n      }\n      .popover > .arrow:after {\n          border-width: 10px;\n          content: "";\n      }\n      .popover.top > .arrow {\n          left: 50%;\n          margin-left: -11px;\n          border-bottom-width: 0;\n          border-top-color: #999999;\n          border-top-color: rgba(0, 0, 0, 0.25);\n          bottom: -11px;\n      }\n      .popover.top > .arrow:after {\n          content: " ";\n          bottom: 1px;\n          margin-left: -10px;\n          border-bottom-width: 0;\n          border-top-color: #fff;\n      }\n      .popover.right > .arrow {\n          top: 50%;\n          left: -11px;\n          margin-top: -11px;\n          border-left-width: 0;\n          border-right-color: #999999;\n          border-right-color: rgba(0, 0, 0, 0.25);\n      }\n      .popover.right > .arrow:after {\n          content: " ";\n          left: 1px;\n          bottom: -10px;\n          border-left-width: 0;\n          border-right-color: #fff;\n      }\n      .popover.bottom > .arrow {\n          left: 50%;\n          margin-left: -11px;\n          border-top-width: 0;\n          border-bottom-color: #999999;\n          border-bottom-color: rgba(0, 0, 0, 0.25);\n          top: -11px;\n      }\n      .popover.bottom > .arrow:after {\n          content: " ";\n          top: 1px;\n          margin-left: -10px;\n          border-top-width: 0;\n          border-bottom-color: #fff;\n      }\n      .popover.left > .arrow {\n          top: 50%;\n          right: -11px;\n          margin-top: -11px;\n          border-right-width: 0;\n          border-left-color: #999999;\n          border-left-color: rgba(0, 0, 0, 0.25);\n      }\n      .popover.left > .arrow:after {\n          content: " ";\n          right: 1px;\n          border-right-width: 0;\n          border-left-color: #fff;\n          bottom: -10px;\n      }\n      .popover .btns {\n          padding: 9px 14px;\n          text-align: right;\n      }\n      .popover .popBtn {\n          color: #333;\n          font-weight: bold;\n          border: solid 1px #333;\n          display: inline-block;\n          padding: 4px 18px;\n          border-radius: 1px;\n          font-size: 13px;\n          cursor: pointer;\n          margin-left: 8px;\n      }\n      .to_left,\n      .to_right,\n      .to_top,\n      .to_bottom {\n          position: absolute;\n          background: black;\n          opacity: .5;\n          filter: alpha(opacity=50);\n          z-index: 1000;\n      }\n      .ghost-focus {\n          background: transparent;\n      }\n\n      /*** Animations ***/\n      @-webkit-keyframes fadeInDown {\n          from {\n              opacity: 0;\n              -webkit-transform: translate3d(0, -10px, 0);\n              transform: translate3d(0, -10px, 0);\n          }\n          to {\n              opacity: 1;\n              -webkit-transform: none;\n              transform: none;\n          }\n      }\n      @keyframes fadeInDown {\n          from {\n              opacity: 0;\n              -webkit-transform: translate3d(0, -10px, 0);\n              transform: translate3d(0, -10px, 0);\n          }\n          to {\n              opacity: 1;\n              -webkit-transform: none;\n              transform: none;\n          }\n      }\n\n       @-webkit-keyframes fadeInTop {\n          from {\n              opacity: 0;\n              -webkit-transform: translate3d(0, 10px, 0);\n              transform: translate3d(0, 10px, 0);\n          }\n          to {\n              opacity: 1;\n              -webkit-transform: none;\n              transform: none;\n          }\n      }\n      @keyframes fadeInTop {\n          from {\n              opacity: 0;\n              -webkit-transform: translate3d(0, 10px, 0);\n              transform: translate3d(0, 10px, 0);\n          }\n          to {\n              opacity: 1;\n              -webkit-transform: none;\n              transform: none;\n          }\n      }\n\n\n        @-webkit-keyframes fadeInLeft {\n          from {\n            opacity: 0;\n            -webkit-transform: translate3d(-10px, 0, 0);\n            transform: translate3d(-10px, 0, 0);\n          }\n\n          to {\n            opacity: 1;\n            -webkit-transform: none;\n            transform: none;\n          }\n        }\n\n        @keyframes fadeInLeft {\n          from {\n            opacity: 0;\n            -webkit-transform: translate3d(-10px, 0, 0);\n            transform: translate3d(-10px, 0, 0);\n          }\n\n          to {\n            opacity: 1;\n            -webkit-transform: none;\n            transform: none;\n          }\n        }\n\n        @-webkit-keyframes fadeInRight {\n          from {\n            opacity: 0;\n            -webkit-transform: translate3d(10px, 0, 0);\n            transform: translate3d(10px, 0, 0);\n          }\n\n          to {\n            opacity: 1;\n            -webkit-transform: none;\n            transform: none;\n          }\n        }\n\n        @keyframes fadeInRight {\n          from {\n            opacity: 0;\n            -webkit-transform: translate3d(10px, 0, 0);\n            transform: translate3d(10px, 0, 0);\n          }\n\n          to {\n            opacity: 1;\n            -webkit-transform: none;\n            transform: none;\n          }\n        }\n\n      .fadeInDown, .fadeInLeft, .fadeInRight, .fadeInTop {\n          -webkit-animation-fill-mode: both;\n          -webkit-animation-duration: .5s;\n          animation-duration: .5s;\n          animation-fill-mode: both;\n      }\n      .fadeInDown {\n          -webkit-animation-name: fadeInDown;\n          animation-name: fadeInDown;\n      }\n\n      .fadeInLeft {\n          -webkit-animation-name: fadeInLeft;\n          animation-name: fadeInLeft;\n      }\n      .fadeInRight {\n          -webkit-animation-name: fadeInRight;\n          animation-name: fadeInRight;\n      }\n      .fadeInTop {\n          -webkit-animation-name: fadeInTop;\n          animation-name: fadeInTop;\n      }\n    </style>';

    var Tooltip = function () {
        function Tooltip(element, config) {
            _classCallCheck(this, Tooltip);

            this.element = normalizeElement(element);
            this.popover = null;

            this.default = {
                animation: true,
                template: '\n                 <div class="popover" role="tooltip">\n                    <div class="arrow"></div>\n                    <h3 class="popover-title"></h3>\n                    <div class="popover-content"></div>\n                    <div class="btns"></div>\n                 </div>',
                title: '',
                content: '',
                delay: 0,
                placement: 'top', //top, left, right, bottom
                offset: '0 0',
                collision: 'fit', //TODO RIGHT BOTTOM
                buttons: []
            };
            this.default = extend(this.default, config);
            this._injectStyles();
            this.setElementContents();
            this.setDirection();
            this.create();
        }

        _createClass(Tooltip, [{
            key: '_injectStyles',
            value: function _injectStyles() {
                new Elm('div.styleFallback', {
                    html: STYLES
                }, document.body);
            }
        }, {
            key: 'getTipElement',
            value: function getTipElement() {
                return this.tip = this.tip || this.config.template;
            }
        }, {
            key: 'setElementContents',
            value: function setElementContents(selector) {
                var div = document.createElement('div');
                div.innerHTML = this.default.template;
                var title = div.querySelector('.popover-title');
                var inner = div.querySelector('.popover-content');
                var btns = div.querySelector('.btns');

                if (!this.default.content) {
                    throw new Error('Tooltip has no content');
                }
                if (this.default.title) {
                    title.innerText = this.default.title;
                } else {
                    title.style.display = 'none';
                }
                if (this.default.buttons && this.default.buttons.length) {
                    this.addButtons(btns);
                }

                inner.innerHTML = this.default.content;
                this.popover = div.children[0];
            }
        }, {
            key: 'addButtons',
            value: function addButtons(parent) {
                this.default.buttons.forEach(function (item) {
                    var btn = new Elm('div.popBtn', { text: item.label }, parent);
                    btn.onclick = item.click;
                });
            }
        }, {
            key: 'setDirection',
            value: function setDirection() {
                var _this3 = this;

                var opposites = {
                    'top': 'Down',
                    'left': 'Left',
                    'bottom': 'Top',
                    'right': 'Right'
                };
                var animationClass = function animationClass() {
                    return 'fadeIn' + opposites[_this3.default.placement];
                };
                setClass(this.popover, this.default.placement);
                setClass(this.popover, animationClass());
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
            key: 'getOffset',
            value: function getOffset() {
                var val = this.default.offset.split(' ');
                if (!val.length > 1) {
                    return { x: parseInt(val[0]), y: parseInt(val[0]) };
                }
                return { x: parseInt(val[0]), y: parseInt(val[1]) };
            }
        }, {
            key: 'setPosition',
            value: function setPosition() {
                var placement = this.default.placement;
                var elDim = this.element.getBoundingClientRect();
                var popDim = this.popover.getBoundingClientRect();
                var bodyDim = {
                    height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
                    width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
                };

                var top = undefined,
                    left = undefined;
                var offset = this.getOffset();

                if (placement === 'top') {
                    top = elDim.top - popDim.height + offset.y + window.scrollY;
                    left = elDim.left + elDim.width / 2 - popDim.width / 2 + offset.x;
                    //fit to top
                    if (this.default.collision === 'fit' && top < 0) {
                        top = 0;
                    }
                    //fit to left
                    if (this.default.collision === 'fit' && left < 0) {
                        left = 0;
                    }
                    //fit to right
                    if (this.default.collision === 'fit' && left + popDim.width > bodyDim.width) {
                        left = bodyDim.width - popDim.width;
                    }
                }

                if (placement === 'left') {
                    top = elDim.top + elDim.height / 2 - popDim.height / 2 + offset.y + window.scrollY;
                    left = elDim.left - popDim.width + offset.x;
                    //fit to left
                    if (this.default.collision === 'fit' && left < 0) {
                        left = 0;
                    }
                    //fit to top
                    if (this.default.collision === 'fit' && top < 0) {
                        top = 0;
                    }
                    //fit to bottom
                    if (this.default.collision === 'fit' && top + popDim.height > bodyDim.height) {
                        top = bodyDim.height - popDim.height;
                    }
                }
                if (placement === 'right') {
                    top = elDim.top + elDim.height / 2 - popDim.height / 2 + offset.y + window.scrollY;
                    left = elDim.left + elDim.width + offset.x;
                    if (this.default.collision === 'fit' && left + popDim.width > bodyDim.width) {
                        left = bodyDim.width - popDim.width;
                    }
                }
                if (placement === 'bottom') {
                    top = elDim.top + elDim.height + offset.y + window.scrollY;
                    left = elDim.left + elDim.width / 2 - popDim.width / 2 + offset.x;
                    //fit to left
                    if (this.default.collision === 'fit' && left + popDim.width > bodyDim.width) {
                        left = bodyDim.width - popDim.width;
                    }
                    //fit to bottom
                    if (this.default.collision === 'fit' && top + popDim.height > bodyDim.height) {
                        top = bodyDim.height - popDim.height;
                    }
                    //fit to right
                    if (this.default.collision === 'fit' && left + popDim.width > bodyDim.width) {
                        left = bodyDim.width - popDim.width;
                    }
                }

                this.popover.style.top = top + 'px';
                this.popover.style.left = left + 'px';
            }
        }]);

        return Tooltip;
    }();

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

    var Focus = function () {
        function Focus(config) {
            var _this4 = this;

            _classCallCheck(this, Focus);

            this.default = {
                padding: 0
            };
            this.default = extend(this.default, config);
            this.buildDom();

            this.animator = new Animator(this.focusBox.middle, {
                effect: 'easeOut',
                duration: 60000
            });
            this.animator.complete = function () {
                _this4.complete();
            };
        }

        _createClass(Focus, [{
            key: 'complete',
            value: function complete() {}
        }, {
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
                var _this5 = this;

                var focusElm = normalizeElement(elm);
                var styles = focusElm.getBoundingClientRect();

                var animate = function animate() {
                    _this5.animator.start({
                        width: styles.width,
                        height: styles.height,
                        left: styles.left,
                        top: styles.top + window.scrollY
                    });
                    _this5.animator.step = function (el) {
                        _this5.setCoverPos(el);
                    };
                };

                var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                //If element is not in the viewport on the y axis we scroll to that element and then animate the foucus.
                if (styles.top + styles.height > viewportHeight) {
                    var y = styles.top - viewportHeight / 2;
                    scrollToY(y, 1500, 'easeInOutQuint', function () {
                        styles = focusElm.getBoundingClientRect();
                        animate();
                    });
                } else if (styles.top < window.scrollY) {
                    var y = styles.top - viewportHeight / 2;
                    scrollToY(y, 1500, 'easeInOutQuint', function () {
                        styles = focusElm.getBoundingClientRect();
                        animate();
                    });
                } else {
                    animate();
                }
            }
        }, {
            key: 'remove',
            value: function remove() {
                for (var key in this.focusBox) {
                    if (!this.focusBox.hasOwnProperty(key)) {
                        continue;
                    }
                    fadeOutRemove(this.focusBox[key]);
                }
            }
        }, {
            key: 'setCoverPos',
            value: function setCoverPos(el) {
                var _this6 = this;

                var body = document.body;
                var html = document.documentElement;
                var pageHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                var dimentions = this.focusBox.middle.getBoundingClientRect();

                setStyles(this.focusBox.top, {
                    top: 0,
                    left: 0,
                    right: 0,
                    height: function () {
                        return dimentions.top > 0 ? dimentions.top - _this6.default.padding + window.scrollY + 'px' : 0;
                    }() //if element overflow top height is 0
                });
                setStyles(this.focusBox.bottom, {
                    top: dimentions.top + dimentions.height + this.default.padding + window.scrollY + 'px',
                    height: pageHeight - (dimentions.top + dimentions.height + this.default.padding) + 'px', //pageHeight - top position
                    left: dimentions.left - this.default.padding + 'px',
                    width: dimentions.width + this.default.padding * 2 + 'px'
                });
                setStyles(this.focusBox.right, {
                    top: dimentions.top - this.default.padding + window.scrollY + 'px',
                    height: pageHeight + (dimentions.top - this.default.padding) + 'px', //pageHeight - top position
                    right: 0,
                    left: dimentions.left + dimentions.width + this.default.padding + 'px'
                });
                setStyles(this.focusBox.left, {
                    top: dimentions.top - this.default.padding + window.scrollY + 'px',
                    height: pageHeight + (dimentions.top - this.default.padding) + 'px', //pageHeight - top position
                    left: 0,
                    width: function () {
                        return dimentions.left > 0 ? dimentions.left - _this6.default.padding + 'px' : 0;
                    }()
                });
            }
        }]);

        return Focus;
    }();

    /**
     * ------------------------------------------------------------------------
     * Tour / Showtime
     * This class ties it all together
     * ------------------------------------------------------------------------
     */
    //TODO keep focus on scroll and resize

    var showtime = function () {
        function showtime(options) {
            _classCallCheck(this, showtime);

            this.chain = [];
            this.chainIndex = 0;
            this.defaults = {
                debug: false,
                padding: 0,
                autoplay: false,
                autoplayDelay: 1000,
                buttons: []

            };
            //override default with user options
            this.defaults = extend(this.defaults, options);
            this._createFocus();
        }

        _createClass(showtime, [{
            key: '_createFocus',
            value: function _createFocus() {
                this.focus = new Focus({ padding: this.defaults.padding });
            }
        }, {
            key: '_callchain',
            value: function _callchain() {
                var _this7 = this;

                /*
                 * We clone the default settings and merge it with the current chain settings.
                 * Update the focus padding
                 * create tooltip
                 * focus on element
                 */

                var defaults = clone(this.defaults);
                var chainItem = this.chain[this.chainIndex];
                //if chainItem is a function we run it
                if (typeof chainItem === 'function') {
                    chainItem();
                    this.chainIndex++;
                    return;
                }

                var settings = extend(defaults, chainItem);

                //focus is reused until tour.quit() then it gets deleted and we have to create it again.
                if (!this.focus) this._createFocus();
                //override defaults with given for this focus
                this.focus.default.padding = settings.padding;
                //remove last tooltip if any
                try {
                    this.tooltip.remove();
                } catch (err) {}
                //tooltip does not excist

                //We create new tooltip for every focus point. This is easier to manage than collecting them
                this.tooltip = new Tooltip(settings.element, {
                    title: settings.title,
                    content: settings.content,
                    placement: settings.placement, //top, left, right, bottom
                    collision: '',
                    offset: this._resolveOffsets(settings),
                    buttons: settings.buttons
                });
                this.focus.focusOn(settings.element);
                this.focus.complete = function () {
                    _this7.tooltip.show();
                    _this7.chainIndex++;
                    if (_this7.defaults.autoplay) {
                        _this7._callAgain();
                    }
                };
                if (typeof settings.focusClick === "undefined") {
                    this.focus.focusBox.middle.style.pointerEvents = 'none';
                } else {
                    this.focus.focusBox.middle.style.pointerEvents = 'auto';
                    this.focus.focusBox.middle.onclick = settings.focusClick;
                }
            }
        }, {
            key: '_callAgain',
            value: function _callAgain() {
                var _this8 = this;

                setTimeout(function () {
                    _this8.play();
                }, this.defaults.autoplayDelay);
            }
        }, {
            key: '_resolveOffsets',
            value: function _resolveOffsets(settings) {
                var padding = settings.padding;
                if (settings.placement === 'right') {
                    return padding + ' 0';
                }
                if (settings.placement === 'left') {
                    return -padding + ' 0';
                }
                if (settings.placement === 'top') {
                    return '0 ' + -padding;
                }
                if (settings.placement === 'bottom') {
                    return '0 ' + padding;
                }
            }
        }, {
            key: '_isNext',
            value: function _isNext() {
                return this.chainIndex < this.chain.length;
            }
        }, {
            key: 'show',
            value: function show(options) {
                this.chain.push(options);
                return this;
            }
        }, {
            key: 'play',
            value: function play() {
                if (this._isNext()) this._callchain();
            }
        }, {
            key: 'next',
            value: function next() {
                this.play();
            }
        }, {
            key: 'reset',
            value: function reset() {
                this.chainIndex = 0;
            }
        }, {
            key: 'quit',
            value: function quit() {
                this.focus.remove();
                delete this.focus;
                this.tooltip.remove();
            }
        }, {
            key: 'call',
            value: function call(fn) {
                this.chain.push(fn);
                return this;
            }
        }, {
            key: 'previous',
            value: function previous() {
                //control not tested
                this.chainIndex--;
                this.chainIndex < 1 ? this.chainIndex = 0 : this.chainIndex--;
                this._callchain();
            }
        }, {
            key: 'start',
            value: function start() {
                this.chainIndex = 0;
                this.play();
            }
        }]);

        return showtime;
    }();

    return showtime;
});