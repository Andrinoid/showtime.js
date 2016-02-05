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
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS.
        module.exports = factory();
    } else {
        // Browser globals.
        window.Showtime = factory();
    }
}(this, function () {

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

    var setClass = function (el, className) {
        if (el.classList)
            el.classList.add(className);
        else
            el.className += ' ' + className;
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

        inject(to) {
            let parent = normalizeElement(to);
            parent.appendChild(this.element);
        }

    }


    /**
     * ------------------------------------------------------------------------
     * Animations
     * Animates element from current location to given style/location
     *
     * TODO Duration is not working and animate-able styles are limeted.
     * ------------------------------------------------------------------------
     */
    class Animator {

        constructor(elm, options) {
            //hello
            this.options = {
                effect: 'linear',
                duration: 6000, //duration slow down animation but does not animate all the time
            };
            this.options = extend(this.options, options);

            this.elm = normalizeElement(elm);

            this.effects = {
                linear: function (t) {
                    return t
                },
                easeOut: function (t) {
                    return t * (2 - t)
                },
                easeOutQuart: function (t) {
                    return 1 - (--t) * t * t * t
                },
                easeInOutQuint: function (t) {
                    return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
                },
                b4: function (t) {
                    return t * t * t
                }
            };
        }

        animate() {
            let start = new Date();
            let repeat = ()=> {
                let timePassed = new Date() - start;
                let progress = timePassed / this.options.duration * 100;
                if (progress > 1) {
                    progress = 1;
                }
                let delta = this.effects[this.options.effect](progress);
                this.applyStyles(delta);
                if (progress === 1) {
                    this.complete();
                    return;
                }
                this.step();
                this.loopID = requestAnimationFrame(repeat);
            };
            this.loopID = requestAnimationFrame(repeat);

        }

        complete() {

        }

        //method to override
        step() {

        }

        compute(from, to, delta) {
            return (to - from) * delta + from;
        }

        //Note that this function also retrives the current size and position of the focus element
        applyStyles(delta) {
            //this.fireEvent('tick', this.elm);
            for (let prop in this.styles) {
                if (!this.styles.hasOwnProperty(prop)) {
                    continue;
                }
                let value = this.styles[prop];
                let from = parseInt(getComputedStyle(this.elm).getPropertyValue(prop)) || 0;
                let nextValue = Math.round(this.compute(from, value, delta));
                this.elm.style[prop] = nextValue + 'px';
            }

        }

        disappear() {
            let left = this.styles.width / 2 + this.styles.left;
            let top = this.styles.height / 2 + this.styles.top;
            this.styles = {'width': 0, 'height': 0, 'left': left, 'top': top};
            //this.animate();
        }

        start(styles) {
            this.styles = styles;
            this.animate();
        }
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

    var STYLES = `
    <style>
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

      .fadeInDown, .fadeInLeft, .fadeInRight, .fadeInTop {
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
    </style>`;

    class Tooltip {
        constructor(element, config) {
            this.element = normalizeElement(element);
            this.popover = null;

            this.default = {
                animation: true,
                template: `
                 <div class="popover" role="tooltip">
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
            new Elm('div.styleFallback', {
                html: STYLES
            }, document.body);
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
                throw new Error('Tooltip has no content');
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
            let animationClass = ()=> {return 'fadeIn' + opposites[this.default.placement]};
            setClass(this.popover, this.default.placement);
            setClass(this.popover, animationClass());
        }

        create() {
            document.body.appendChild(this.popover);
        }

        remove() {
            this.popover.parentNode.removeChild(this.popover);
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
                padding: 0
            };
            this.default = extend(this.default, config);
            this.buildDom();

            this.animator = new Animator(this.focusBox.middle, {
                effect: 'easeOut',
                duration: 60000
            });
            this.animator.complete = ()=> {
                this.complete();
            };

        }

        complete() {

        }

        buildDom() {
            this.focusBox = {
                middle: new Elm('div.ghost-focus', {
                    css: {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                    }
                }, document.body),
                right: new Elm('div.to_right', {}, document.body),
                top: new Elm('div.to_top', {}, document.body),
                bottom: new Elm('div.to_bottom', {}, document.body),
                left: new Elm('div.to_left', {}, document.body)
            };

        }

        focusOn(elm) {
            let focusElm = normalizeElement(elm);
            let styles = focusElm.getBoundingClientRect();

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

            let viewportHeight = (window.innerHeight || document.documentElement.clientHeight);
            //If element is not in the viewport on the y axis we scroll to that element and then animate the foucus.
            if (styles.top > viewportHeight) {
                let y = styles.top - (viewportHeight / 2);
                scrollToY(y, 1500, 'easeInOutQuint', function () {
                    animate();
                });
            }
            else if (styles.top < window.scrollY) {
                let y = styles.top - (viewportHeight / 2);
                scrollToY(y, 1500, 'easeInOutQuint', function () {
                    styles = focusElm.getBoundingClientRect();
                    animate();
                });
            }
            else {
                animate();
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
                    return dimentions.top > 0 ? dimentions.top - this.default.padding + 'px' : 0
                })() //if element overflow top height is 0
            });
            setStyles(this.focusBox.bottom, {
                top: dimentions.top + dimentions.height + this.default.padding + 'px',
                height: pageHeight - (dimentions.top + dimentions.height + this.default.padding) + 'px', //pageHeight - top position
                left: dimentions.left - this.default.padding + 'px',
                width: dimentions.width + (this.default.padding * 2) + 'px'
            });
            setStyles(this.focusBox.right, {
                top: dimentions.top - this.default.padding + 'px',
                height: pageHeight + (dimentions.top - this.default.padding) + 'px', //pageHeight - top position
                right: 0,
                left: dimentions.left + dimentions.width + this.default.padding + 'px',
            });
            setStyles(this.focusBox.left, {
                top: dimentions.top - this.default.padding + 'px',
                height: pageHeight + (dimentions.top - this.default.padding) + 'px', //pageHeight - top position
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
        //TODO keep focus on scroll and resize

    class showtime {

        constructor(options) {
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
            this.focus = window.focus =  new Focus({padding: this.defaults.padding});
        }

        _callchain() {
            /*
             * We clone the default settings and merge it with the current chain settings.
             * Update the focus padding
             * create tooltip
             * focus on element
             */

            //override defaults with given for this focus
            let defaults = clone(this.defaults);
            let settings = extend(defaults, this.chain[this.chainIndex]);
            this.focus.default.padding = settings.padding;
            //remove last tooltip if any
            try {
                this.tooltip.remove();
            } catch (err) {
                //tooltip does not excist
            }
            //We create new tooltip for every focus point. This is easier to manage than collecting them
            this.tooltip = new Tooltip(settings.element, {
                title: settings.title,
                content: settings.content,
                placement: settings.placement,//top, left, right, bottom
                collision: '',
                offset: this._resolveOffsets(settings),
                buttons: settings.buttons
            });
            this.focus.focusOn(settings.element);
            this.focus.complete = ()=> {
                this.tooltip.show();
                this.chainIndex++;
                if (this.defaults.autoplay) {
                    this._callAgain()
                }
            };
            if (typeof settings.focusClick === "undefined") {
                this.focus.focusBox.middle.style.pointerEvents = 'none'
            }
            else {
                this.focus.focusBox.middle.style.pointerEvents = 'auto';
                this.focus.focusBox.middle.onclick = settings.focusClick;
            }
        }

        _callAgain() {
            setTimeout(()=> {
                this.play();
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
            this.chain.push(options);
            return this;
        }

        play() {
            if (this._isNext())
                this._callchain();
        }

        next() {
            this.play();
        }

        reset() {
            this.chainIndex = 0;
        }

        quit() {

        }

        previous() {//control not tested
            this.chainIndex--;
            this.chainIndex < 1 ? this.chainIndex = 0 : this.chainIndex--;

            this._callchain();
        }

        start() {

        }

    }


    return showtime;


}));
