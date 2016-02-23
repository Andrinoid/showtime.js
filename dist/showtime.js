'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * --------------------------------------------------------------------------
 * ShowTime.js
 * Licensed under MIT
 * Repository: https://github.com/Andrinoid/showtime.js
 * Author: Andri Birgisson
 * --------------------------------------------------------------------------
 */

//Note Modules not tested
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(function () {
            root.Showtime = factory();
            return root.Showtime;
        });
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        // CommonJS
        module.exports = factory();
    } else {
        //Browser
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

    var isElementInViewport = function isElementInViewport(el) {
        var rect = el.getBoundingClientRect();

        return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
    };

    var getViewPortHeight = function getViewPortHeight() {
        return window.innerHeight || document.documentElement.clientHeight;
    };

    var getPageHeight = function getPageHeight() {
        var body = document.body;
        var html = document.documentElement;

        return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    };

    var elementOffsetTop = function elementOffsetTop(el) {
        return el.offsetTop + (el.offsetParent ? elementOffsetTop(el.offsetParent) : 0);
    };

    var setClass = function setClass(el, className) {
        //credit: http://youmightnotneedjquery.com/
        if (el.classList) el.classList.add(className);else el.className += ' ' + className;
    };

    var removeClass = function removeClass(el, className) {
        //credit: http://youmightnotneedjquery.com/
        if (el.classList) el.classList.remove(className);else el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
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
            key: 'click',
            value: function click(fn) {
                this.element.addEventListener('click', function () {
                    fn();
                });
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

    window.Elm = Elm;

    /**
     * ------------------------------------------------------------------------
     * Animations
     * Animates element from current location to given style/location
     *
     * TODO animate-able styles are limeted.
     * ------------------------------------------------------------------------
     */

    var Animator = function () {
        function Animator(elm, options) {
            _classCallCheck(this, Animator);

            this.options = {
                speed: 2000,
                easing: 'easeOut',
                slomo: false,
                time: null
            };
            this.options = extend(this.options, options);
            this.elm = normalizeElement(elm);

            this.currentTime = 0;

            this.time = 1;
            this.easingEquations = {
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
                },
                linear: function linear(progress) {
                    return progress;
                },
                quadratic: function quadratic(progress) {
                    return Math.pow(progress, 2);
                },
                swing: function swing(progress) {
                    return 0.5 - Math.cos(progress * Math.PI) / 2;
                },
                circ: function circ(progress) {
                    return 1 - Math.sin(Math.acos(progress));
                },
                easeOut: function easeOut(t) {
                    return t * (2 - t);
                }
            };
        }

        _createClass(Animator, [{
            key: 'resolveTime',
            value: function resolveTime() {
                var computed = getComputedStyle(this.elm);
                var valueMap = ['left', 'right', 'top', 'bottom'];
                var currentStyles = {};
                valueMap.forEach(function (prop) {
                    currentStyles[prop] = parseInt(computed.getPropertyValue(prop)) || 0;
                });
                var distance = Math.abs(currentStyles.top - this.styles.top + (currentStyles.left - this.styles.left) / 2);
                return Math.max(.1, Math.min(distance / this.options.speed, .8));
            }
        }, {
            key: 'tick',
            value: function tick() {
                this.currentTime += 1 / 60;

                var p = this.currentTime / this.time;
                var t = this.easingEquations[this.options.easing](p);

                if (p < 1) {
                    this.step();
                    requestAnimationFrame(this.tick.bind(this));
                    this.applyStyles(t);
                } else {
                    this.complete();
                    this.currentTime = 0;
                }
            }
        }, {
            key: 'applyStyles',
            value: function applyStyles(t) {
                //this.fireEvent('tick', this.elm);
                for (var prop in this.styles) {
                    if (!this.styles.hasOwnProperty(prop)) {
                        continue;
                    }
                    var to = this.styles[prop];
                    var from = parseInt(getComputedStyle(this.elm).getPropertyValue(prop)) || 0;
                    var nextValue = Math.round(this.compute(from, to, t));
                    this.elm.style[prop] = nextValue + 'px';
                }
            }
        }, {
            key: 'compute',
            value: function compute(from, to, delta) {
                return (to - from) * delta + from;
            }
        }, {
            key: 'complete',
            value: function complete() {}
        }, {
            key: 'step',
            value: function step() {}
        }, {
            key: 'start',
            value: function start(styles) {
                this.styles = styles;
                this.time = this.resolveTime();
                if (this.options.slomo) {
                    this.time = 5;
                }
                if (this.options.time) {
                    this.time = this.options.time;
                }
                this.tick();
            }
        }]);

        return Animator;
    }();

    //TODO style fallback is injected on every tour start

    var STYLES = '\n        <style>\n        /* Modal styles */\n         body.modal-mode {\n             overflow: hidden\n         }\n         .modal-body,\n         .modal-title {\n             font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;\n             line-height: 1.42857143;\n             color: #333\n         }\n         .chain_modal,\n         .modal-backdrop {\n             position: fixed;\n             top: 0;\n             right: 0;\n             bottom: 0;\n             left: 0\n         }\n         .modal-backdrop {\n             z-index: 1040;\n             background-color: #000;\n             opacity: .5\n         }\n\n         .chain_modal {\n             z-index: 10000;\n             overflow-y: scroll;\n             -webkit-overflow-scrolling: touch;\n             outline: 0\n         }\n         .modal-theme-blue input[type="text"] {/*Temporary*/\n                -moz-appearance: none;\n                -webkit-appearance: none;\n                -ms-appearance: none;\n                appearance: none;\n                border-radius: 4px;\n                border: solid 1px #c8cccf;\n                color: inherit;\n                display: block;\n                outline: 0;\n                padding: 0 1em;\n                text-decoration: none;\n                width: 100%;\n                height: 2.75em;\n                box-sizing: border-box;\n         }\n         .chain_dialog {\n             position: relative;\n             width: auto;\n             margin: 10px\n         }\n         .modal-header .close {\n             margin-top: -2px;\n             position: static;\n             height: 30px;\n         }\n         .modal-theme-blue .close {\n             text-shadow: none;\n             opacity: 1;\n             font-size: 31px;\n             font-weight: normal;\n         }\n         .modal-theme-blue .close span {\n             color: white;\n         }\n         .modal-theme-blue .close span:hover {\n             color: #fbc217;\n         }\n         .close.standalone {\n             position: absolute;\n             right: 15px;\n             top: 13px;\n             z-index: 1;\n             height: 30px;\n         }\n         .modal-title {\n             margin: 0;\n             font-size: 18px;\n             font-weight: 500\n         }\n         button.close {\n             -webkit-appearance: none;\n             padding: 0;\n             cursor: pointer;\n             background: 0 0;\n             border: 0\n         }\n         .modal-content {\n             position: relative;\n             background-color: #fff;\n             background-clip: padding-box;\n             border: 1px solid #999;\n             border: 1px solid rgba(0, 0, 0, .2);\n             border-radius: 2px;\n             outline: 0;\n             box-shadow: 0 3px 9px rgba(0, 0, 0, .5)\n         }\n         .modal-theme-blue .modal-content {\n            background-color: #4a6173;\n         }\n         .modal-header {\n             min-height: 16.43px;\n             padding: 15px;\n             border-bottom: 1px solid #e5e5e5;\n             min-height: 50px\n         }\n         .modal-theme-blue .modal-header {\n            border-bottom: none;\n         }\n         .modal-body {\n             position: relative;\n             padding: 15px;\n             font-size: 14px\n         }\n         .close {\n             float: right;\n             font-size: 21px;\n             font-weight: 700;\n             line-height: 1;\n             color: #000;\n             text-shadow: 0 1px 0 #fff;\n             opacity: .2\n         }\n         @media (min-width: 768px) {\n             .chain_dialog {\n                 width: 600px;\n                 margin: 30px auto\n             }\n             .modal-content {\n                 box-shadow: 0 5px 15px rgba(0, 0, 0, .5)\n             }\n             .chain_modal-sm {\n                 width: 300px\n             }\n         }\n         @media (min-width: 992px) {\n             .chain_modal-lg {\n                 width: 900px\n             }\n         }\n\n\n         /*popover styles*/\n         .popover {\n             position: absolute;\n             box-sizing: border-box;\n             min-width: 250px;\n             top: 0;\n             left: 0;\n             z-index: 1060;\n             display: none;\n             max-width: 276px;\n             padding: 1px;\n             font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;\n             font-style: normal;\n             font-weight: normal;\n             letter-spacing: normal;\n             line-break: auto;\n             line-height: 1.42857143;\n             text-align: left;\n             text-align: start;\n             text-decoration: none;\n             text-shadow: none;\n             text-transform: none;\n             white-space: normal;\n             word-break: normal;\n             word-spacing: normal;\n             word-wrap: normal;\n             font-size: 14px;\n             background-color: #fff;\n             background-clip: padding-box;\n             border: 1px solid #ccc;\n             border: 1px solid rgba(0, 0, 0, 0.2);\n             border-radius: 2px;\n             -webkit-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);\n             box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);\n         }\n         .popover-theme-blue.popover {\n            color: white;\n            background-color: #465a6a;\n            border: 1px solid rgb(70, 90, 106);\n            padding: 20px;\n         }\n         .popover-theme-blue b, .popover-theme-blue strong {\n            font-weight: bold;\n            color: white;\n         }\n         .popover.top {\n             margin-top: -10px;\n         }\n         .popover.right {\n             margin-left: 10px;\n         }\n         .popover.bottom {\n             margin-top: 10px;\n         }\n         .popover.left {\n             margin-left: -10px;\n         }\n         .popover-title {\n             margin: 0;\n             font-size: 14px;\n             background-color: #f7f7f7;\n             border-bottom: 1px solid #ebebeb;\n             border-radius: 1px 1px 0 0;\n             box-sizing: border-box;\n             padding: 8px 0;\n         }\n         .popover-theme-blue .popover-title {\n            background-color: #465A6B;\n            border-top: 2px solid #ffcc01;\n            border-bottom: 2px solid #ffcc01;\n            color: white;\n         }\n         .popover-content {\n             padding: 9px 14px;\n             box-sizing: border-box;\n         }\n         .popover-theme-blue .popover-content {\n             padding: 9px 0px;\n         }\n         .popover > .arrow,\n         .popover > .arrow:after {\n             position: absolute;\n             display: block;\n             width: 0;\n             height: 0;\n             border-color: transparent;\n             border-style: solid;\n         }\n         .popover > .arrow {\n             border-width: 11px;\n         }\n         .popover > .arrow:after {\n             border-width: 10px;\n             content: "";\n         }\n         .popover.top > .arrow {\n             left: 50%;\n             margin-left: -11px;\n             border-bottom-width: 0;\n             border-top-color: #999999;\n             border-top-color: rgba(0, 0, 0, 0.25);\n             bottom: -11px;\n         }\n\n         .popover.top > .arrow:after {\n             content: " ";\n             bottom: 1px;\n             margin-left: -10px;\n             border-bottom-width: 0;\n             border-top-color: #fff;\n         }\n         .popover-theme-blue.popover.top > .arrow:after {\n             border-top-color: #465A6A;\n         }\n         .popover.right > .arrow {\n             top: 50%;\n             left: -11px;\n             margin-top: -11px;\n             border-left-width: 0;\n             border-right-color: #999999;\n             border-right-color: rgba(0, 0, 0, 0.25);\n         }\n         .popover.right > .arrow:after {\n             content: " ";\n             left: 1px;\n             bottom: -10px;\n             border-left-width: 0;\n             border-right-color: #fff;\n         }\n         .popover-theme-blue.popover.right > .arrow:after {\n             border-right-color: #465A6A;\n         }\n         .popover.bottom > .arrow {\n             left: 50%;\n             margin-left: -11px;\n             border-top-width: 0;\n             border-bottom-color: #999999;\n             border-bottom-color: rgba(0, 0, 0, 0.25);\n             top: -11px;\n         }\n         .popover.bottom > .arrow:after {\n             content: " ";\n             top: 1px;\n             margin-left: -10px;\n             border-top-width: 0;\n             border-bottom-color: #fff;\n         }\n         .popover-theme-blue.popover.bottom > .arrow:after {\n             border-bottom-color: #465A6A;\n         }\n         .popover.left > .arrow {\n             top: 50%;\n             right: -11px;\n             margin-top: -11px;\n             border-right-width: 0;\n             border-left-color: #999999;\n             border-left-color: rgba(0, 0, 0, 0.25);\n         }\n         .popover.left > .arrow:after {\n             content: " ";\n             right: 1px;\n             border-right-width: 0;\n             border-left-color: #fff;\n             bottom: -10px;\n         }\n         .popover-theme-blue.popover.left > .arrow:after {\n             border-left-color: #465A6A;\n         }\n         .popover .btns {\n             padding: 9px 14px;\n             text-align: left;\n         }\n         .popover-theme-blue .btns {\n             padding: 9px 0px;\n         }\n\n         .popover .popBtn {\n             display: inline-block;\n             padding: 6px 12px;\n             margin-bottom: 0;\n             font-size: 14px;\n             font-weight: 400;\n             line-height: 1.42857143;\n             text-align: center;\n             white-space: nowrap;\n             vertical-align: middle;\n             -ms-touch-action: manipulation;\n             touch-action: manipulation;\n             cursor: pointer;\n             -webkit-user-select: none;\n             -moz-user-select: none;\n             -ms-user-select: none;\n             user-select: none;\n             background-image: none;\n             border: 1px solid transparent;\n             border-radius: 2px;\n             color: #333;\n             background-color: #fff;\n             border-color: #ccc;\n             margin-right: 5px;\n         }\n         .popover .popBtn:hover {\n            color: #333;\n            background-color: #e6e6e6;\n            border-color: #adadad;\n         }\n         .popover-theme-blue .popBtn {\n            background: #ffcc01;\n            border-color: #ffcc01;\n            color: #465A6A;\n            font-weight: bold;\n         }\n         .popover-theme-blue .popBtn:hover {\n             background: #465A6A;\n             color: white;\n          }\n\n         /* Focus styles */\n         .to_left,\n         .to_right,\n         .to_top,\n         .to_bottom {\n             position: absolute;\n             background: black;\n             opacity: .5;\n             filter: alpha(opacity=50);\n             z-index: 1000;\n         }\n         .ghost-focus {\n             background: transparent;\n             z-index: 1000;\n         }\n\n\n         /*** Animations ***/\n         @-webkit-keyframes fadeInDown {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, -10px, 0);\n                 transform: translate3d(0, -10px, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @keyframes fadeInDown {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, -10px, 0);\n                 transform: translate3d(0, -10px, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @-webkit-keyframes fadeInTop {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, 10px, 0);\n                 transform: translate3d(0, 10px, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @keyframes fadeInTop {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, 10px, 0);\n                 transform: translate3d(0, 10px, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @-webkit-keyframes fadeOutTop {\n             0% {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none\n             }\n             100% {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, -10px, 0);\n                 transform: translate3d(0, -10px, 0)\n             }\n         }\n         @keyframes fadeOutTop {\n             0% {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none\n             }\n             100% {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, -10px, 0);\n                 transform: translate3d(0, -10px, 0)\n             }\n         }\n         @-webkit-keyframes fadeInLeft {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(-10px, 0, 0);\n                 transform: translate3d(-10px, 0, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @keyframes fadeInLeft {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(-10px, 0, 0);\n                 transform: translate3d(-10px, 0, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @-webkit-keyframes fadeInRight {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(10px, 0, 0);\n                 transform: translate3d(10px, 0, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @keyframes fadeInRight {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(10px, 0, 0);\n                 transform: translate3d(10px, 0, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         .fadeInDown,\n         .fadeInLeft,\n         .fadeInRight,\n         .fadeInTop,\n         .fadeOutTop{\n             -webkit-animation-fill-mode: both;\n             -webkit-animation-duration: .5s;\n             animation-duration: .5s;\n             animation-fill-mode: both;\n         }\n         .fadeInDown {\n             -webkit-animation-name: fadeInDown;\n             animation-name: fadeInDown;\n         }\n         .fadeInLeft {\n             -webkit-animation-name: fadeInLeft;\n             animation-name: fadeInLeft;\n         }\n         .fadeInRight {\n             -webkit-animation-name: fadeInRight;\n             animation-name: fadeInRight;\n         }\n         .fadeInTop {\n             -webkit-animation-name: fadeInTop;\n             animation-name: fadeInTop;\n         }\n         .fadeOutTop {\n             -webkit-animation-name: fadeOutTop;\n             animation-name: fadeOutTop;\n         }\n        </style>';
    /**
     * ------------------------------------------------------------------------
     * Modal
     * Creates Modal
     * ------------------------------------------------------------------------
     */

    var Modal = function () {
        function Modal(options) {
            _classCallCheck(this, Modal);

            this.defaults = {
                title: '',
                message: '',
                theme: 'classic',
                withBackdrop: true,
                size: 'normal', //large small
                onClose: function onClose() {},
                onOpen: function onOpen() {}
            };
            this.defaults = extend(this.defaults, options);

            this.__proto__.closeAll();
            this.__proto__.instances.push(this);
            this._injectStyles();
            this.buildTemplate();
        }

        _createClass(Modal, [{
            key: 'buildTemplate',
            value: function buildTemplate() {
                var _this2 = this;

                var sizeMap = {
                    'small': 'chain_modal-sm',
                    'normal': '',
                    'large': 'chain_modal-lg'
                };
                var sizeClass = sizeMap[this.defaults.size];

                if (this.defaults.withBackdrop) {
                    this.backdrop = new Elm('div.modal-backdrop', document.body);
                }

                var header = this.defaults.title ? '<div class="modal-header">\n                    <button type="button" class="close"><span>×</span></button>\n                    <h4 class="modal-title" id="myModalLabel">' + this.defaults.title + '</h4>\n                </div>' : '<button type="button" class="close standalone"><span>×</span></button>';

                var main = '\n                <div class="chain_modal fadeInDown">\n                    <div class="chain_dialog ' + sizeClass + '">\n                        <div class="modal-content">\n                            ' + header + '\n                            <div class="modal-body">\n                                <div>' + this.defaults.message + '</div>\n                            </div>\n                        </div>\n                    </div>\n                </div>';

                this.modal = new Elm('div', { html: main, 'class': 'modal-theme-' + this.defaults.theme }, document.body);

                var btn = this.modal.querySelector('.close');
                this.chainDialog = this.modal.querySelector('.chain_dialog');
                btn.onclick = function () {
                    _this2.close();
                };
                setClass(document.body, 'modal-mode');
            }
        }, {
            key: '_injectStyles',
            value: function _injectStyles() {
                //TODO consider removing styleFallback by splitting styles for each component
                if (!document.querySelector('.styleFallback')) {
                    new Elm('div.styleFallback', {
                        html: STYLES
                    }, document.body);
                }
            }
        }, {
            key: '_close',
            value: function _close() {
                var _this3 = this;

                var cb = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

                if (this.defaults.withBackdrop) {
                    fadeOutRemove(this.backdrop);
                }
                setClass(this.chainDialog, 'fadeOutTop');
                setTimeout(function () {
                    _this3.modal.remove();
                    removeClass(document.body, 'modal-mode');
                    cb();
                }, 500);
            }
        }, {
            key: 'close',
            value: function close() {
                this._close(this.defaults.onClose);
            }
        }]);

        return Modal;
    }();

    Modal.prototype.instances = [];
    Modal.prototype.closeAll = function () {
        this.instances.forEach(function (item) {
            item._close();
        });
        this.instances.length = 0;
    };
    window.modal = Modal;

    /**
     * ------------------------------------------------------------------------
     * Popover
     * Creates bootstrap-like popover with position relative to given element
     * ------------------------------------------------------------------------
     */

    var Popover = function () {
        function Popover(element, config) {
            _classCallCheck(this, Popover);

            this.element = normalizeElement(element);
            this.popover = null;

            this.default = {
                animation: true,
                template: '\n                 <div class="popover">\n                    <div class="arrow"></div>\n                    <h3 class="popover-title"></h3>\n                    <div class="popover-content"></div>\n                    <div class="btns"></div>\n                 </div>',
                title: '',
                content: '',
                delay: 0,
                placement: 'top', //top, left, right, bottom
                offset: '0 0',
                collision: 'fit', //TODO RIGHT BOTTOM
                buttons: [],
                theme: 'classic'
            };
            this.default = extend(this.default, config);
            this._injectStyles();
            this.setElementContents();
            this.setDirection();
            this.create();
        }

        _createClass(Popover, [{
            key: '_injectStyles',
            value: function _injectStyles() {
                //TODO consider removing styleFallback
                if (!document.querySelector('.styleFallback')) {
                    new Elm('div.styleFallback', {
                        html: STYLES
                    }, document.body);
                }
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
                    throw new Error('Popover has no content');
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
                setClass(this.popover, 'popover-theme-' + this.default.theme);
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
                var _this4 = this;

                var opposites = {
                    'top': 'Down',
                    'left': 'Left',
                    'bottom': 'Top',
                    'right': 'Right'
                };
                var animationClass = function animationClass() {
                    return 'fadeIn' + opposites[_this4.default.placement];
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
                this.popover.remove();
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

        return Popover;
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
            var _this5 = this;

            _classCallCheck(this, Focus);

            this.default = {
                padding: 0,
                removeOnClick: false
            };
            this.default = extend(this.default, config);
            this.buildDom();

            this.animator = new Animator(this.focusBox.middle, {
                //effect: 'easeOut',
                //duration: 60000
            });
            this.animator.complete = function () {
                _this5.complete();
            };
        }

        _createClass(Focus, [{
            key: 'complete',
            value: function complete() {}
        }, {
            key: 'buildDom',
            value: function buildDom() {
                var _this6 = this;

                var elmOptions = this.default.closeOnClick ? {
                    click: function click() {
                        _this6.remove();
                    }
                } : {};
                this.focusBox = {
                    middle: new Elm('div.ghost-focus', {
                        css: {
                            position: 'absolute',
                            top: '50%',
                            left: '50%'
                        }
                    }, document.body),
                    right: new Elm('div.to_right', elmOptions, document.body),
                    top: new Elm('div.to_top', elmOptions, document.body),
                    bottom: new Elm('div.to_bottom', elmOptions, document.body),
                    left: new Elm('div.to_left', elmOptions, document.body)
                };
            }
        }, {
            key: 'focusOn',
            value: function focusOn(elm, customPos) {
                var _this7 = this;

                var focusElm = normalizeElement(elm);
                var styles = focusElm.getBoundingClientRect();
                if (typeof customPos !== 'undefined') {
                    //ClientRect object only have getters, so we cant extend it and need to clone it
                    var styleObj = {
                        bottom: styles.bottom,
                        height: styles.height,
                        left: styles.left,
                        right: styles.right,
                        top: styles.top,
                        width: styles.width
                    };
                    styles = extend(styleObj, customPos);
                }
                var animate = function animate() {
                    _this7.animator.start({
                        width: styles.width,
                        height: styles.height,
                        left: styles.left,
                        top: styles.top + window.scrollY
                    });
                    _this7.animator.step = function (el) {
                        _this7.setCoverPos(el);
                    };
                };

                var viewportHeight = getViewPortHeight();
                //If element is not in the viewport on the y axis we scroll to that element and then animate the foucus.
                if (!isElementInViewport(focusElm)) {
                    //let y = styles.top - (viewportHeight / 2);
                    var y = elementOffsetTop(focusElm) - viewportHeight / 2;
                    scrollToY(y, 1500, 'easeInOutQuint', function () {
                        styles = focusElm.getBoundingClientRect();
                        animate();
                    });
                } else if (styles.top < window.scrollY) {
                    var y = styles.top;
                    scrollToY(y, 1500, 'easeInOutQuint', function () {
                        styles = focusElm.getBoundingClientRect();
                        animate();
                    });
                } else {
                    animate();
                }
            }
        }, {
            key: 'coverAll',
            value: function coverAll() {
                setStyles(this.focusBox.top, {
                    top: 0,
                    left: 0,
                    right: 0,
                    height: getPageHeight() + 'px'
                });
                setStyles(this.focusBox.bottom, {
                    top: 0,
                    height: 0,
                    left: 0,
                    width: 0
                });
                setStyles(this.focusBox.right, {
                    top: 0,
                    height: 0,
                    right: 0,
                    left: 0
                });
                setStyles(this.focusBox.left, {
                    top: 0,
                    height: 0,
                    left: 0,
                    width: 0
                });
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
                var _this8 = this;

                var body = document.body;
                var html = document.documentElement;
                var pageHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                var dimentions = this.focusBox.middle.getBoundingClientRect();

                setStyles(this.focusBox.top, {
                    top: 0,
                    left: 0,
                    right: 0,
                    height: function () {
                        return dimentions.top > 0 ? dimentions.top - _this8.default.padding + window.scrollY + 'px' : 0;
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
                    height: pageHeight - (dimentions.top - this.default.padding) + 'px', //pageHeight - top position
                    right: 0,
                    left: dimentions.left + dimentions.width + this.default.padding + 'px'
                });
                setStyles(this.focusBox.left, {
                    top: dimentions.top - this.default.padding + window.scrollY + 'px',
                    height: pageHeight - (dimentions.top - this.default.padding) + 'px', //pageHeight - top position
                    left: 0,
                    width: function () {
                        return dimentions.left > 0 ? dimentions.left - _this8.default.padding + 'px' : 0;
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
    //TODO keep focus on scroll and resize add fit options for Popover

    var showtime = function () {
        function showtime(options) {
            _classCallCheck(this, showtime);

            this.chain = [];
            this.chainIndex = 0;
            this.defaults = {
                padding: 0,
                placement: 'right',
                autoplay: false,
                autoplayDelay: 1000,
                buttons: [],
                focusClick: null,
                dimentions: null,
                removeOnOuterClick: false,
                theme: 'classic'
            };
            //override default with user options
            this.defaults = extend(this.defaults, options);
            this._createFocus();
        }

        _createClass(showtime, [{
            key: '_createFocus',
            value: function _createFocus() {
                this.focus = new Focus({
                    padding: this.defaults.padding,
                    closeOnClick: this.defaults.removeOnOuterClick
                });
                //TODO Focus needs to fire event on remove so we can use it here to quit tour
            }
        }, {
            key: '_callchain',
            value: function _callchain() {
                var _this9 = this;

                /*
                 * We clone the default settings and merge it with the current chain settings.
                 * Update the focus padding
                 * create popover
                 * focus on element
                 */
                var chainItem = this.chain[this.chainIndex];
                var defaults = clone(this.defaults);
                var settings = extend(defaults, chainItem);

                if (typeof chainItem === 'function') {
                    chainItem();
                    this.chainIndex++;
                    return;
                }

                if (chainItem._type === 'modal') {
                    this._removePopover();
                    this.focus.coverAll();
                    new Modal(settings);
                    this.chainIndex++;
                    return;
                }

                //focus is reused until tour.quit() then it gets deleted and we have to create it again.
                if (!this.focus) this._createFocus();
                //override defaults with given for this focus
                this.focus.default.padding = settings.padding;
                this._removePopover();
                //We create new popover for every focus point. This is easier to manage than collecting them
                this.popover = new Popover(this.focus.focusBox.middle, {
                    title: settings.title,
                    content: settings.content,
                    placement: settings.placement, //top, left, right, bottom
                    collision: '',
                    offset: this._resolveOffsets(settings),
                    buttons: settings.buttons,
                    theme: settings.theme
                });
                this.focus.focusOn(settings.element, settings.dimentions);
                this.focus.complete = function () {
                    _this9.popover.show();

                    if (_this9.defaults.autoplay) {
                        _this9._callAgain();
                    }
                };
                this.chainIndex++;
                if (typeof settings.focusClick === "undefined" || !settings.focusClick) {
                    this.focus.focusBox.middle.style.pointerEvents = 'none';
                } else {
                    this.focus.focusBox.middle.style.pointerEvents = 'auto';
                    this.focus.focusBox.middle.onclick = settings.focusClick;
                }
            }
        }, {
            key: '_removePopover',
            value: function _removePopover() {
                //remove last popover if any
                try {
                    this.popover.remove();
                } catch (err) {
                    //popover does not excist
                }
            }
        }, {
            key: '_callAgain',
            value: function _callAgain() {
                var _this10 = this;

                setTimeout(function () {
                    _this10.next();
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
                options._type = 'show';
                this.chain.push(options);
                return this;
            }
        }, {
            key: 'modal',
            value: function modal(options) {
                var _this11 = this;

                options._type = 'modal';
                options.withBackdrop = false;
                options.onClose = function () {
                    _this11.next();
                };
                this.chain.push(options);
                return this;
            }
        }, {
            key: 'next',
            value: function next() {
                if (this.chainIndex) Modal.prototype.closeAll();
                if (this._isNext()) this._callchain();else this.quit();
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
                this.popover.remove();
                Modal.prototype.instances.length = 0;
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
                this.next();
            }
        }]);

        return showtime;
    }();

    return showtime;
});