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
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory();
    } else {
        //Browser
        window.Showtime = factory();
    }
}(this, function () {
    /**
     * ------------------------------------------------------------------------
     * Polyfills
     * ------------------------------------------------------------------------
     */
    //Polyfill for requestAnimationFrame and cancelAnimationFrame
    //Source: https://github.com/darius/requestAnimationFrame
    if (!Date.now)
        Date.now = function () {
            return new Date().getTime();
        };

    (function () {
        'use strict';

        var vendors = ['webkit', 'moz'];
        for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
            var vp = vendors[i];
            window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = (window[vp + 'CancelAnimationFrame']
            || window[vp + 'CancelRequestAnimationFrame']);
        }
        if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
            || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
            var lastTime = 0;
            window.requestAnimationFrame = function (callback) {
                var now = Date.now();
                var nextTime = Math.max(lastTime + 16, now);
                return setTimeout(function () {
                        callback(lastTime = nextTime);
                    },
                    nextTime - now);
            };
            window.cancelAnimationFrame = clearTimeout;
        }
    }());

    //http://stackoverflow.com/questions/8830839/javascript-dom-remove-element
    (function () {
        var typesToPatch = ['DocumentType', 'Element', 'CharacterData'],
            remove = function () {
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

    var capitalize = function (s) {
        return s[0].toUpperCase() + s.slice(1);
    };

    var throttle = function (fn, threshhold, scope) {
        threshhold || (threshhold = 250);
        var last,
            deferTimer;
        return function () {
            var context = scope || this;

            var now = +new Date,
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
    var extend = function () {
        for (var i = 1; i < arguments.length; i++)
            for (var key in arguments[i])
                if (arguments[i].hasOwnProperty(key))
                    arguments[0][key] = arguments[i][key];
        return arguments[0];
    };
//Clone Object
    var clone = function (obj) {
        if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
            return obj;

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

    var isObject = function (value) {
        return value != null && typeof value === 'object';
    };

    var foreach = function (arg, func) {
        if (!isArray(arg) && !isObject(arg))
            var arg = [arg];
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
    var map = function (arr, func) {
        if (!isArray(arr))
            var arg = [arg];
        for (var i = 0; i < arr.length; i++) {
            var result = func.call(window, arr[i]);
            if (typeof result !== 'undefined')
                arr[i] = result;
        }
        return arr;
    };

    var normalizeElement = function (element) {
        function isElement(obj) {
            return (obj[0] || obj).nodeType
        }

        if (isElement(element)) {
            return element;
        }
        if (typeof jQuery !== 'undefined') {
            if (element instanceof jQuery)
                return element[0];
        }
        if (typeof(element) === 'string') {
            return document.querySelector(element) || document.querySelector('#' + element) || document.querySelector('.' + element);
        }
    };

    var isElementInViewport = function (el) {
        var rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };

    var getViewPortHeight = function () {
        return (window.innerHeight || document.documentElement.clientHeight);
    };

    var getPageHeight = function () {
        let body = document.body;
        let html = document.documentElement;

        return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    };

    var elementOffsetTop = function (el) {
        return el.offsetTop + ( el.offsetParent ? elementOffsetTop(el.offsetParent) : 0 )
    };

    var setClass = function (el, className) {
        //credit: http://youmightnotneedjquery.com/
        if (el.classList)
            el.classList.add(className);
        else
            el.className += ' ' + className;
    };

    var removeClass = function (el, className) {
        //credit: http://youmightnotneedjquery.com/
        if (el.classList)
            el.classList.remove(className);
        else
            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    };

    var setStyles = function (el, styles) {
        let element = normalizeElement(el);
        for (let prop in styles) {
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
                easeOutSine: function (pos) {
                    return Math.sin(pos * (Math.PI / 2));
                },
                easeInOutSine: function (pos) {
                    return (-0.5 * (Math.cos(Math.PI * pos) - 1));
                },
                easeInOutQuint: function (pos) {
                    if ((pos /= 0.5) < 1) {
                        return 0.5 * Math.pow(pos, 5);
                    }
                    return 0.5 * (Math.pow((pos - 2), 5) + 2);
                }
            };

        // add animation loop
        function tick() {
            currentTime += 1 / 60;

            var p = currentTime / time;
            var t = easingEquations[easing](p);

            if (p < 1) {
                requestAnimationFrame(tick);

                window.scrollTo(0, scrollY + ((scrollTargetY - scrollY) * t));
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
        setTimeout(() => {
            el.remove();
        }, 500);
    }


    /**
     * ------------------------------------------------------------------------
     * Element generator check out the standalone version for docs
     * https://github.com/Andrinoid/ElementGenerator.js
     * ------------------------------------------------------------------------
     */
    class Elm {
        //Simple element generator. Mootools style
        //tries to find method for keys in options and run it
        constructor(type, options, parent) {
            function isElement(obj) {
                return (obj[0] || obj).nodeType
            }

            let args = arguments;
            if (isElement(args[1] || {}) || typeof(args[1]) === 'string') {
                options = {};
                parent = args[1];
            }

            this.element = null;
            if (type.indexOf('.') > -1) {
                let separated = type.split('.');
                let stype = separated[0];
                let clsName = separated[1];
                this.element = document.createElement(stype);
                this._setClass(this.element, clsName);
            }
            else {
                this.element = document.createElement(type);
            }
            this.options = options || {};

            for (let key in this.options) {
                if (!this.options.hasOwnProperty(key)) {
                    continue;
                }
                let val = this.options[key];
                try {
                    if (key === 'class')//fix for class name conflict
                        key = 'cls';
                    this[key](val);
                }
                catch (err) {
                    //pass
                }
            }

            if (parent) {
                this.inject(parent);
            }

            return this.element;
        }

        _setClass(el, className) {
            //Method credit http://youmightnotneedjquery.com/
            if (el.classList) {
                el.classList.add(className);
            }
            else {
                el.className += ' ' + className;
            }
        }

        cls(value) {
            //Name can be comma or space separated values e.q 'foo, bar'
            //Even if one class name is given we clean the string and end up with array
            let clsList = value.replace(/[|&;$%@"<>()+,]/g, "").split(' ');

            clsList.forEach(name=> {
                this._setClass(this.element, name);
            });

        }

        id(value) {
            this.element.id = value;
        }

        html(str) {
            this.element.innerHTML = str;
        }

        text(str) {
            this.element.innerText = str;
        }

        css(obj) {
            for (let prop in obj) {
                if (!obj.hasOwnProperty(prop)) {
                    continue;
                }
                this.element.style[prop] = obj[prop];
            }
        }

        click(fn) {
            this.element.addEventListener('click', function () {
                fn();
            });
        }

        inject(to) {
            let parent = normalizeElement(to);
            parent.appendChild(this.element);
        }

    }
    window.Elm = Elm;

    /**
     * ------------------------------------------------------------------------
     * Animations
     * Animates element from current location to given style/location
     *
     * TODO animate-able styles are limeted.
     * ------------------------------------------------------------------------
     */
    class Animator {

        constructor(elm, options) {

            this.options = {
                speed: 2000,
                easing: 'easeOut',
                slomo: false,
                time: null,
            };
            this.options = extend(this.options, options);
            this.elm = normalizeElement(elm);

            this.currentTime = 0;

            this.time = 1;
            this.easingEquations = {
                easeOutSine: function (pos) {
                    return Math.sin(pos * (Math.PI / 2));
                },
                easeInOutSine: function (pos) {
                    return (-0.5 * (Math.cos(Math.PI * pos) - 1));
                },
                easeInOutQuint: function (pos) {
                    if ((pos /= 0.5) < 1) {
                        return 0.5 * Math.pow(pos, 5);
                    }
                    return 0.5 * (Math.pow((pos - 2), 5) + 2);
                },
                linear: function (progress) {
                    return progress;
                },
                quadratic: function (progress) {
                    return Math.pow(progress, 2);
                },
                swing: function (progress) {
                    return 0.5 - Math.cos(progress * Math.PI) / 2;
                },
                circ: function (progress) {
                    return 1 - Math.sin(Math.acos(progress));
                },
                easeOut: function (t) {
                    return t * (2 - t)
                }
            };
        }

        resolveTime() {
            let computed = getComputedStyle(this.elm);
            let valueMap = ['left', 'right', 'top', 'bottom'];
            let currentStyles = {};
            valueMap.forEach((prop)=> {
                currentStyles[prop] = parseInt(computed.getPropertyValue(prop)) || 0;
            });
            let distance = Math.abs((currentStyles.top - this.styles.top) + (currentStyles.left - this.styles.left) / 2);
            return Math.max(.1, Math.min(distance / this.options.speed, .8));
        }

        tick() {
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

        applyStyles(t) {
            //this.fireEvent('tick', this.elm);
            for (let prop in this.styles) {
                if (!this.styles.hasOwnProperty(prop)) {
                    continue;
                }
                let to = this.styles[prop];
                let from = parseInt(getComputedStyle(this.elm).getPropertyValue(prop)) || 0;
                let nextValue = Math.round(this.compute(from, to, t));
                this.elm.style[prop] = nextValue + 'px';
            }

        }

        compute(from, to, delta) {
            return (to - from) * delta + from;
        }

        complete() {
        }

        step() {
        }

        start(styles) {
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

    }

    //TODO style fallback is injected on every tour start
    var STYLES = `
        <style>
        /* Modal styles */
         body.modal-mode {
             overflow: hidden
         }
         .modal-body,
         .modal-title {
             font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
             line-height: 1.42857143;
             color: #333
         }
         .chain_modal,
         .modal-backdrop {
             position: fixed;
             top: 0;
             right: 0;
             bottom: 0;
             left: 0
         }
         .modal-backdrop {
             z-index: 1040;
             background-color: #000;
             opacity: .5
         }

         .chain_modal {
             z-index: 10000;
             overflow-y: scroll;
             -webkit-overflow-scrolling: touch;
             outline: 0
         }
         .chain_dialog {
             position: relative;
             width: auto;
             margin: 10px
         }
         .modal-header .close {
             margin-top: -2px;
             position: static;
             height: 30px;
         }
         .close.standalone {
             position: absolute;
             right: 15px;
             top: 13px;
             z-index: 1
         }
         .modal-title {
             margin: 0;
             font-size: 18px;
             font-weight: 500
         }
         button.close {
             -webkit-appearance: none;
             padding: 0;
             cursor: pointer;
             background: 0 0;
             border: 0
         }
         .modal-content {
             position: relative;
             background-color: #fff;
             background-clip: padding-box;
             border: 1px solid #999;
             border: 1px solid rgba(0, 0, 0, .2);
             border-radius: 2px;
             outline: 0;
             box-shadow: 0 3px 9px rgba(0, 0, 0, .5)
         }
         .modal-header {
             min-height: 16.43px;
             padding: 15px;
             border-bottom: 1px solid #e5e5e5
         }
         .modal-body {
             position: relative;
             padding: 15px;
             font-size: 14px
         }
         .close {
             float: right;
             font-size: 21px;
             font-weight: 700;
             line-height: 1;
             color: #000;
             text-shadow: 0 1px 0 #fff;
             opacity: .2
         }
         @media (min-width: 768px) {
             .chain_dialog {
                 width: 600px;
                 margin: 30px auto
             }
             .modal-content {
                 box-shadow: 0 5px 15px rgba(0, 0, 0, .5)
             }
             .chain_modal-sm {
                 width: 300px
             }
         }
         @media (min-width: 992px) {
             .chain_modal-lg {
                 width: 900px
             }
         }


         /*popover styles*/
         .popover {
             position: absolute;
             box-sizing: border-box;
             min-width: 250px;
             top: 0;
             left: 0;
             z-index: 1060;
             display: none;
             max-width: 276px;
             padding: 1px;
             font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
             font-style: normal;
             font-weight: normal;
             letter-spacing: normal;
             line-break: auto;
             line-height: 1.42857143;
             text-align: left;
             text-align: start;
             text-decoration: none;
             text-shadow: none;
             text-transform: none;
             white-space: normal;
             word-break: normal;
             word-spacing: normal;
             word-wrap: normal;
             font-size: 14px;
             background-color: #fff;
             background-clip: padding-box;
             border: 1px solid #ccc;
             border: 1px solid rgba(0, 0, 0, 0.2);
             border-radius: 2px;
             -webkit-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
             box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
         }
         .popover.top {
             margin-top: -10px;
         }
         .popover.right {
             margin-left: 10px;
         }
         .popover.bottom {
             margin-top: 10px;
         }
         .popover.left {
             margin-left: -10px;
         }
         .popover-title {
             margin: 0;
             padding: 8px 14px;
             font-size: 14px;
             background-color: #f7f7f7;
             border-bottom: 1px solid #ebebeb;
             border-radius: 1px 1px 0 0;
             box-sizing: border-box;
         }
         .popover-content {
             padding: 9px 14px;
             box-sizing: border-box;
         }
         .popover > .arrow,
         .popover > .arrow:after {
             position: absolute;
             display: block;
             width: 0;
             height: 0;
             border-color: transparent;
             border-style: solid;
         }
         .popover > .arrow {
             border-width: 11px;
         }
         .popover > .arrow:after {
             border-width: 10px;
             content: "";
         }
         .popover.top > .arrow {
             left: 50%;
             margin-left: -11px;
             border-bottom-width: 0;
             border-top-color: #999999;
             border-top-color: rgba(0, 0, 0, 0.25);
             bottom: -11px;
         }
         .popover.top > .arrow:after {
             content: " ";
             bottom: 1px;
             margin-left: -10px;
             border-bottom-width: 0;
             border-top-color: #fff;
         }
         .popover.right > .arrow {
             top: 50%;
             left: -11px;
             margin-top: -11px;
             border-left-width: 0;
             border-right-color: #999999;
             border-right-color: rgba(0, 0, 0, 0.25);
         }
         .popover.right > .arrow:after {
             content: " ";
             left: 1px;
             bottom: -10px;
             border-left-width: 0;
             border-right-color: #fff;
         }
         .popover.bottom > .arrow {
             left: 50%;
             margin-left: -11px;
             border-top-width: 0;
             border-bottom-color: #999999;
             border-bottom-color: rgba(0, 0, 0, 0.25);
             top: -11px;
         }
         .popover.bottom > .arrow:after {
             content: " ";
             top: 1px;
             margin-left: -10px;
             border-top-width: 0;
             border-bottom-color: #fff;
         }
         .popover.left > .arrow {
             top: 50%;
             right: -11px;
             margin-top: -11px;
             border-right-width: 0;
             border-left-color: #999999;
             border-left-color: rgba(0, 0, 0, 0.25);
         }
         .popover.left > .arrow:after {
             content: " ";
             right: 1px;
             border-right-width: 0;
             border-left-color: #fff;
             bottom: -10px;
         }
         .popover .btns {
             padding: 9px 14px;
             text-align: right;
         }
         .popover .popBtn {
             color: #333;
             font-weight: bold;
             border: solid 1px #333;
             display: inline-block;
             padding: 4px 18px;
             border-radius: 1px;
             font-size: 13px;
             cursor: pointer;
             margin-left: 8px;
         }


         /* Focus styles */
         .to_left,
         .to_right,
         .to_top,
         .to_bottom {
             position: absolute;
             background: black;
             opacity: .5;
             filter: alpha(opacity=50);
             z-index: 1000;
         }
         .ghost-focus {
             background: transparent;
             z-index: 1000;
         }


         /*** Animations ***/
         @-webkit-keyframes fadeInDown {
             from {
                 opacity: 0;
                 -webkit-transform: translate3d(0, -10px, 0);
                 transform: translate3d(0, -10px, 0);
             }
             to {
                 opacity: 1;
                 -webkit-transform: none;
                 transform: none;
             }
         }
         @keyframes fadeInDown {
             from {
                 opacity: 0;
                 -webkit-transform: translate3d(0, -10px, 0);
                 transform: translate3d(0, -10px, 0);
             }
             to {
                 opacity: 1;
                 -webkit-transform: none;
                 transform: none;
             }
         }
         @-webkit-keyframes fadeInTop {
             from {
                 opacity: 0;
                 -webkit-transform: translate3d(0, 10px, 0);
                 transform: translate3d(0, 10px, 0);
             }
             to {
                 opacity: 1;
                 -webkit-transform: none;
                 transform: none;
             }
         }
         @keyframes fadeInTop {
             from {
                 opacity: 0;
                 -webkit-transform: translate3d(0, 10px, 0);
                 transform: translate3d(0, 10px, 0);
             }
             to {
                 opacity: 1;
                 -webkit-transform: none;
                 transform: none;
             }
         }
         @-webkit-keyframes fadeOutTop {
             0% {
                 opacity: 1;
                 -webkit-transform: none;
                 transform: none
             }
             100% {
                 opacity: 0;
                 -webkit-transform: translate3d(0, -10px, 0);
                 transform: translate3d(0, -10px, 0)
             }
         }
         @keyframes fadeOutTop {
             0% {
                 opacity: 1;
                 -webkit-transform: none;
                 transform: none
             }
             100% {
                 opacity: 0;
                 -webkit-transform: translate3d(0, -10px, 0);
                 transform: translate3d(0, -10px, 0)
             }
         }
         @-webkit-keyframes fadeInLeft {
             from {
                 opacity: 0;
                 -webkit-transform: translate3d(-10px, 0, 0);
                 transform: translate3d(-10px, 0, 0);
             }
             to {
                 opacity: 1;
                 -webkit-transform: none;
                 transform: none;
             }
         }
         @keyframes fadeInLeft {
             from {
                 opacity: 0;
                 -webkit-transform: translate3d(-10px, 0, 0);
                 transform: translate3d(-10px, 0, 0);
             }
             to {
                 opacity: 1;
                 -webkit-transform: none;
                 transform: none;
             }
         }
         @-webkit-keyframes fadeInRight {
             from {
                 opacity: 0;
                 -webkit-transform: translate3d(10px, 0, 0);
                 transform: translate3d(10px, 0, 0);
             }
             to {
                 opacity: 1;
                 -webkit-transform: none;
                 transform: none;
             }
         }
         @keyframes fadeInRight {
             from {
                 opacity: 0;
                 -webkit-transform: translate3d(10px, 0, 0);
                 transform: translate3d(10px, 0, 0);
             }
             to {
                 opacity: 1;
                 -webkit-transform: none;
                 transform: none;
             }
         }
         .fadeInDown,
         .fadeInLeft,
         .fadeInRight,
         .fadeInTop,
         .fadeOutTop{
             -webkit-animation-fill-mode: both;
             -webkit-animation-duration: .5s;
             animation-duration: .5s;
             animation-fill-mode: both;
         }
         .fadeInDown {
             -webkit-animation-name: fadeInDown;
             animation-name: fadeInDown;
         }
         .fadeInLeft {
             -webkit-animation-name: fadeInLeft;
             animation-name: fadeInLeft;
         }
         .fadeInRight {
             -webkit-animation-name: fadeInRight;
             animation-name: fadeInRight;
         }
         .fadeInTop {
             -webkit-animation-name: fadeInTop;
             animation-name: fadeInTop;
         }
         .fadeOutTop {
             -webkit-animation-name: fadeOutTop;
             animation-name: fadeOutTop;
         }
        </style>`;
    /**
     * ------------------------------------------------------------------------
     * Modal
     * Creates Modal
     * ------------------------------------------------------------------------
     */

    class Modal {

        constructor(options) {

            this.defaults = {
                title: '',
                message: '',
                withBackdrop: true,
                size: 'normal',//large small
                onClose: function () {
                },
                onOpen: function () {
                }
            };
            this.defaults = extend(this.defaults, options);

            this.closeOthers();
            this.__proto__.instances.push(this);
            this._injectStyles();
            this.buildTemplate();
        }

        closeOthers() {
            this.__proto__.instances.forEach(function (item) {
                item.close();
            });
            this.__proto__.instances.length = 0;
        }

        buildTemplate() {
            let sizeMap = {
                'small': 'chain_modal-sm',
                'normal': '',
                'large': 'chain_modal-lg'
            };
            let sizeClass = sizeMap[this.defaults.size];

            if (this.defaults.withBackdrop) {
                this.backdrop = new Elm('div.modal-backdrop', document.body);
            }

            let header = this.defaults.title ?
                `<div class="modal-header">
                    <button type="button" class="close"><span>×</span></button>
                    <h4 class="modal-title" id="myModalLabel">${this.defaults.title}</h4>
                </div>` : '<button type="button" class="close standalone"><span>×</span></button>';


            let main = `
                <div class="chain_modal fadeInDown">
                    <div class="chain_dialog ${sizeClass}">
                        <div class="modal-content">
                            ${header}
                            <div class="modal-body">
                                <div>${this.defaults.message}</div>
                            </div>
                        </div>
                    </div>
                </div>`;

            this.modal = new Elm('div', {html: main}, document.body);

            let btn = this.modal.querySelector('.close');
            this.chainDialog = this.modal.querySelector('.chain_dialog');
            btn.onclick = ()=> {
                this.close();
                this.defaults.onClose();
            };
            setClass(document.body, 'modal-mode');

        }

        _injectStyles() {
            //TODO consider removing styleFallback by splitting styles for each component
            if (!document.querySelector('.styleFallback')) {
                new Elm('div.styleFallback', {
                    html: STYLES
                }, document.body);
            }
        }

        close() {
            if (this.defaults.withBackdrop) {
                fadeOutRemove(this.backdrop);
            }
            setClass(this.chainDialog, 'fadeOutTop');
            setTimeout(()=> {
                this.modal.remove();
                removeClass(document.body, 'modal-mode');
            }, 500);
        }

    }
    Modal.prototype.instances = [];


    /**
     * ------------------------------------------------------------------------
     * Popover
     * Creates bootstrap-like popover with position relative to given element
     * ------------------------------------------------------------------------
     */

    class Popover {
        constructor(element, config) {
            this.element = normalizeElement(element);
            this.popover = null;

            this.default = {
                animation: true,
                template: `
                 <div class="popover">
                    <div class="arrow"></div>
                    <h3 class="popover-title"></h3>
                    <div class="popover-content"></div>
                    <div class="btns"></div>
                 </div>`,
                title: '',
                content: '',
                delay: 0,
                placement: 'top',//top, left, right, bottom
                offset: '0 0',
                collision: 'fit',//TODO RIGHT BOTTOM
                buttons: []
            };
            this.default = extend(this.default, config);
            this._injectStyles();
            this.setElementContents();
            this.setDirection();
            this.create();
        }

        _injectStyles() {
            //TODO consider removing styleFallback
            if (!document.querySelector('.styleFallback')) {
                new Elm('div.styleFallback', {
                    html: STYLES
                }, document.body);
            }

        }

        getTipElement() {
            return (this.tip = this.tip || this.config.template)
        }

        setElementContents(selector) {
            let div = document.createElement('div');
            div.innerHTML = this.default.template;
            let title = div.querySelector('.popover-title');
            let inner = div.querySelector('.popover-content');
            let btns = div.querySelector('.btns');


            if (!this.default.content) {
                throw new Error('Popover has no content');
            }
            if (this.default.title) {
                title.innerText = this.default.title;
            }
            else {
                title.style.display = 'none';
            }
            if (this.default.buttons && this.default.buttons.length) {
                this.addButtons(btns);
            }

            inner.innerHTML = this.default.content;
            this.popover = div.children[0];

        }

        addButtons(parent) {
            this.default.buttons.forEach(function (item) {
                let btn = new Elm('div.popBtn', {text: item.label}, parent);
                btn.onclick = item.click;
            });

        }

        setDirection() {
            let opposites = {
                'top': 'Down',
                'left': 'Left',
                'bottom': 'Top',
                'right': 'Right'
            };
            let animationClass = ()=> {
                return 'fadeIn' + opposites[this.default.placement]
            };
            setClass(this.popover, this.default.placement);
            setClass(this.popover, animationClass());
        }

        create() {
            document.body.appendChild(this.popover);
        }

        remove() {
            this.popover.remove();
        }

        show() {
            this.popover.style.display = 'block';
            this.setPosition();
        }

        getOffset() {
            let val = this.default.offset.split(' ');
            if (!val.length > 1) {
                return {x: parseInt(val[0]), y: parseInt(val[0])};
            }
            return {x: parseInt(val[0]), y: parseInt(val[1])};
        }

        setPosition() {
            let placement = this.default.placement;
            let elDim = this.element.getBoundingClientRect();
            let popDim = this.popover.getBoundingClientRect();
            let bodyDim = {
                height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
                width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
            };

            let top, left;
            let offset = this.getOffset();

            if (placement === 'top') {
                top = elDim.top - popDim.height + offset.y + window.scrollY;
                left = elDim.left + (elDim.width / 2) - (popDim.width / 2) + offset.x;
                //fit to top
                if (this.default.collision === 'fit' && top < 0) {
                    top = 0;
                }
                //fit to left
                if (this.default.collision === 'fit' && left < 0) {
                    left = 0;
                }
                //fit to right
                if (this.default.collision === 'fit' && (left + popDim.width) > bodyDim.width) {
                    left = bodyDim.width - popDim.width;
                }
            }

            if (placement === 'left') {
                top = elDim.top + (elDim.height / 2) - (popDim.height / 2) + offset.y + window.scrollY;
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
                if (this.default.collision === 'fit' && (top + popDim.height) > bodyDim.height) {
                    top = bodyDim.height - popDim.height;
                }
            }
            if (placement === 'right') {
                top = elDim.top + (elDim.height / 2) - (popDim.height / 2) + offset.y + window.scrollY;
                left = elDim.left + elDim.width + offset.x;
                if (this.default.collision === 'fit' && (left + popDim.width) > bodyDim.width) {
                    left = bodyDim.width - popDim.width;
                }
            }
            if (placement === 'bottom') {
                top = elDim.top + elDim.height + offset.y + window.scrollY;
                left = elDim.left + (elDim.width / 2) - (popDim.width / 2) + offset.x;
                //fit to left
                if (this.default.collision === 'fit' && (left + popDim.width) > bodyDim.width) {
                    left = bodyDim.width - popDim.width;
                }
                //fit to bottom
                if (this.default.collision === 'fit' && (top + popDim.height) > bodyDim.height) {
                    top = bodyDim.height - popDim.height;
                }
                //fit to right
                if (this.default.collision === 'fit' && (left + popDim.width) > bodyDim.width) {
                    left = bodyDim.width - popDim.width;
                }
            }

            this.popover.style.top = top + 'px';
            this.popover.style.left = left + 'px';
        }
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
    class Focus {

        constructor(config) {
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
            this.animator.complete = ()=> {
                this.complete();
            };

        }

        complete() {

        }

        buildDom() {
            let elmOptions = this.default.closeOnClick ? {
                click: ()=> {
                    this.remove()
                }
            } : {};
            this.focusBox = {
                middle: new Elm('div.ghost-focus', {
                    css: {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                    }
                }, document.body),
                right: new Elm('div.to_right', elmOptions, document.body),
                top: new Elm('div.to_top', elmOptions, document.body),
                bottom: new Elm('div.to_bottom', elmOptions, document.body),
                left: new Elm('div.to_left', elmOptions, document.body)
            };
        }

        focusOn(elm, customPos) {
            let focusElm = normalizeElement(elm);
            let styles = focusElm.getBoundingClientRect();
            if (typeof customPos !== 'undefined') {
                //ClientRect object only have getters, so we cant extend it and need to clone it
                let styleObj = {
                    bottom: styles.bottom,
                    height: styles.height,
                    left: styles.left,
                    right: styles.right,
                    top: styles.top,
                    width: styles.width
                };
                styles = extend(styleObj, customPos);
            }
            let animate = ()=> {
                this.animator.start({
                    width: styles.width,
                    height: styles.height,
                    left: styles.left,
                    top: styles.top + window.scrollY
                });
                this.animator.step = (el)=> {
                    this.setCoverPos(el);
                }
            };

            let viewportHeight = getViewPortHeight();
            //If element is not in the viewport on the y axis we scroll to that element and then animate the foucus.
            if (!isElementInViewport(focusElm)) {
                console.log('element is not in the viewport');
                //let y = styles.top - (viewportHeight / 2);
                let y = elementOffsetTop(focusElm) - (viewportHeight / 2 );
                console.log(elementOffsetTop(focusElm), viewportHeight);
                scrollToY(y, 1500, 'easeInOutQuint', function () {
                    styles = focusElm.getBoundingClientRect();
                    animate();
                });
            }
            else if (styles.top < window.scrollY) {
                let y = styles.top;
                scrollToY(y, 1500, 'easeInOutQuint', function () {
                    styles = focusElm.getBoundingClientRect();
                    animate();
                });
            }
            else {
                animate();
            }

        }

        coverAll() {
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

        remove() {
            for (let key in this.focusBox) {
                if (!this.focusBox.hasOwnProperty(key)) {
                    continue;
                }
                fadeOutRemove(this.focusBox[key]);
            }
        }

        setCoverPos(el) {
            let body = document.body;
            let html = document.documentElement;
            var pageHeight = Math.max(body.scrollHeight, body.offsetHeight,
                html.clientHeight, html.scrollHeight, html.offsetHeight);
            let dimentions = this.focusBox.middle.getBoundingClientRect();


            setStyles(this.focusBox.top, {
                top: 0,
                left: 0,
                right: 0,
                height: (()=> {
                    return dimentions.top > 0 ? dimentions.top - this.default.padding + window.scrollY + 'px' : 0
                })() //if element overflow top height is 0
            });
            setStyles(this.focusBox.bottom, {
                top: dimentions.top + dimentions.height + this.default.padding + window.scrollY + 'px',
                height: pageHeight - (dimentions.top + dimentions.height + this.default.padding) + 'px', //pageHeight - top position
                left: dimentions.left - this.default.padding + 'px',
                width: dimentions.width + (this.default.padding * 2) + 'px'
            });
            setStyles(this.focusBox.right, {
                top: dimentions.top - this.default.padding + window.scrollY + 'px',
                height: pageHeight - (dimentions.top - this.default.padding) + 'px', //pageHeight - top position
                right: 0,
                left: dimentions.left + dimentions.width + this.default.padding + 'px',
            });
            setStyles(this.focusBox.left, {
                top: dimentions.top - this.default.padding + window.scrollY + 'px',
                height: pageHeight - (dimentions.top - this.default.padding) + 'px', //pageHeight - top position
                left: 0,
                width: (()=> {
                    return dimentions.left > 0 ? dimentions.left - this.default.padding + 'px' : 0
                })()
            });
        }

    }


    /**
     * ------------------------------------------------------------------------
     * Tour / Showtime
     * This class ties it all together
     * ------------------------------------------------------------------------
     */
        //TODO keep focus on scroll and resize add fit options for Popover

    class showtime {

        constructor(options) {
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
            };
            //override default with user options
            this.defaults = extend(this.defaults, options);
            this._createFocus();
        }

        _createFocus() {
            this.focus = new Focus({
                padding: this.defaults.padding,
                closeOnClick: this.defaults.removeOnOuterClick
            });
            //TODO Focus needs to fire event on remove so we can use it here to quit tour
        }

        _callchain() {
            /*
             * We clone the default settings and merge it with the current chain settings.
             * Update the focus padding
             * create popover
             * focus on element
             */
            let chainItem = this.chain[this.chainIndex];
            if (typeof(chainItem) === 'function') {
                chainItem();
                this.chainIndex++;
                return;
            }

            if (chainItem._type === 'modal') {
                this._removePopover();
                this.focus.coverAll();
                new Modal(chainItem);
                this.chainIndex++;
                return;

            }
            let defaults = clone(this.defaults);
            let settings = extend(defaults, chainItem);

            //focus is reused until tour.quit() then it gets deleted and we have to create it again.
            if (!this.focus) this._createFocus();
            //override defaults with given for this focus
            this.focus.default.padding = settings.padding;
            this._removePopover();
            //We create new popover for every focus point. This is easier to manage than collecting them
            this.popover = new Popover(this.focus.focusBox.middle, {
                title: settings.title,
                content: settings.content,
                placement: settings.placement,//top, left, right, bottom
                collision: '',
                offset: this._resolveOffsets(settings),
                buttons: settings.buttons
            });
            this.focus.focusOn(settings.element, settings.dimentions);
            this.focus.complete = ()=> {
                this.popover.show();

                if (this.defaults.autoplay) {
                    this._callAgain()
                }
            };
            this.chainIndex++;
            if (typeof settings.focusClick === "undefined" || !settings.focusClick) {
                this.focus.focusBox.middle.style.pointerEvents = 'none'
            }
            else {
                this.focus.focusBox.middle.style.pointerEvents = 'auto';
                this.focus.focusBox.middle.onclick = settings.focusClick;
            }
        }

        _removePopover() {
            //remove last popover if any
            try {
                this.popover.remove();
            } catch (err) {
                //popover does not excist
            }
        }

        _callAgain() {
            setTimeout(()=> {
                this.next();
            }, this.defaults.autoplayDelay);
        }

        _resolveOffsets(settings) {
            let padding = settings.padding;
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

        _isNext() {
            return this.chainIndex < this.chain.length;
        }

        show(options) {
            options._type = 'show';
            this.chain.push(options);
            return this;
        }

        modal(options) {
            options._type = 'modal';

            options.withBackdrop = false;
            options.onClose = ()=> {
                this.next();
            };
            this.chain.push(options);
            return this;
        }

        next() {
            if (this._isNext())
                this._callchain();
            else
                this.quit();
        }

        reset() {
            this.chainIndex = 0;
        }

        quit() {
            this.focus.remove();
            delete this.focus;
            this.popover.remove();
            Modal.prototype.instances.length = 0;
        }

        call(fn) {
            this.chain.push(fn);
            return this;
        }

        previous() {//control not tested
            this.chainIndex--;
            this.chainIndex < 1 ? this.chainIndex = 0 : this.chainIndex--;
            this._callchain();
        }

        start() {
            this.chainIndex = 0;
            this.next();
        }
    }

    return showtime;


}));
