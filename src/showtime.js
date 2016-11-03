/**
 * --------------------------------------------------------------------------
 * ShowTime.js
 * Licensed under MIT
 * Repository: https://github.com/Andrinoid/showtime.js
 * Author: Andri Birgisson
 * --------------------------------------------------------------------------
 */


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

//Pollyfill for string repeat
if (!String.prototype.repeat) {
    String.prototype.repeat = function (count) {
        'use strict';
        if (this == null) {
            throw new TypeError('can\'t convert ' + this + ' to object');
        }
        var str = '' + this;
        count = +count;
        if (count != count) {
            count = 0;
        }
        if (count < 0) {
            throw new RangeError('repeat count must be non-negative');
        }
        if (count == Infinity) {
            throw new RangeError('repeat count must be less than infinity');
        }
        count = Math.floor(count);
        if (str.length == 0 || count == 0) {
            return '';
        }
        // Ensuring count is a 31-bit integer allows us to heavily optimize the
        // main part. But anyway, most current (August 2014) browsers can't handle
        // strings 1 << 28 chars or longer, so:
        if (str.length * count >= 1 << 28) {
            throw new RangeError('repeat count must not overflow maximum string size');
        }
        var rpt = '';
        for (; ;) {
            if ((count & 1) == 1) {
                rpt += str;
            }
            count >>>= 1;
            if (count == 0) {
                break;
            }
            str += str;
        }

        return rpt;
    }
}

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

//Get element offset position
var getScreenPosition = function (node) {
    var x = document.documentElement.offsetLeft,
        y = document.documentElement.offsetTop;

    if (node.offsetParent || document.body) {
        do {
            x += node.offsetLeft;
            y += node.offsetTop;
        } while (node = node.offsetParent);
    }

    return {x: x, y: y};
};

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

var isArray = (function () {
    if (typeof Array.isArray === 'undefined') {
        return function (value) {
            return toString.call(value) === '[object Array]';
        };
    }
    return Array.isArray;
})();

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
    if (isElement(arg)) {
        for (var i = 0; i < arg.length; i++) {
            if (isElement(arg[i]))
                func.call(window, arg[i], i, arg);
        }
        return false;
    }

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

var isElement = function (item) {
    return (item[0] || item).nodeType
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

var getHigestBoundingRect = function (nodes) {
    if (!nodes.length) {
        return nodes.getBoundingClientRect();
    }
    let rect = {bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0};
    for (let i = 0; i < nodes.length; i++) {
        let el = nodes[i];
        let r = el.getBoundingClientRect();
        rect.bottom = Math.min(rect.bottom, r.bottom);
        rect.height = Math.min(rect.height, r.height);
        rect.left = Math.max(rect.left, r.left);
        rect.right = Math.max(rect.right, r.right);
        rect.top = Math.max(rect.top, r.top);
        rect.width = Math.max(rect.width, r.width);
    }
    return rect
};

var isElementInViewport = function (el) {
    let rect = getHigestBoundingRect(el);
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};
window.foo = isElementInViewport;

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
    let element = el;
    for (let prop in styles) {
        if (!styles.hasOwnProperty(prop)) {
            continue;
        }
        element.style[prop] = styles[prop];
    }
};

function scrollToY(scrollTargetY) {
    //credit http://stackoverflow.com/questions/12199363/scrollto-with-animation/26798337#26798337
    // scrollTargetY: the target scrollY property of the window
    // speed: time in pixels per second
    // easing: easing equation to use

    var scrollY = window.scrollY,
        scrollTargetY = scrollTargetY || 0,
        speed = 2000,
        easing = 'linear',
        currentTime = 0;

    // min time .1, max time .8 seconds
    var time = Math.max(.1, Math.min(Math.abs(scrollY - scrollTargetY) / speed, 0.9));

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
            },
            linear: function (progress) {
                return progress;
            },
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

function roundUp(num) {
    return Math.ceil(num * 10) / 10;
}

function randomstring(L) {
    var s = '';
    var randomchar = function () {
        var n = Math.floor(Math.random() * 62);
        if (n < 10) return n; //1-10
        if (n < 36) return String.fromCharCode(n + 55); //A-Z
        return String.fromCharCode(n + 61); //a-z
    };
    while (s.length < L) s += randomchar();
    return s;
}

function getFnName(fn) {
    return fn.toString().split(' ')[1].split('(')[0];
}

const MAX_ZINDEX = 2147483647;


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
        this.element.addEventListener('click', function (e) {
            fn(e);
        });
    }

    inject(to) {
        let parent = normalizeElement(to);
        parent.appendChild(this.element);
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
             line-height: 1.42857143;
             color: #333
         }
         .modal-footer {
             padding: 15px;
             text-align: center;
             //border-top: 1px solid #e5e5e5;
         }

         .chain_modal,
         .modal-backdrop {
             position: fixed;
             top: 0;
             right: 0;
             bottom: 0;
             left: 0
         }

         .chain_modal {
             z-index: ${MAX_ZINDEX};
             overflow-y: scroll;
             -webkit-overflow-scrolling: touch;
             outline: 0
         }
         .chain_dialog {
             font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
             position: relative;
             width: auto;
             margin: 10px
         }
         .modal-content .close {
             margin-top: -2px;
             position: static;
             height: 30px;
         }
         .modal-theme-blue .close {
             text-shadow: none;
             opacity: 1;
             font-size: 31px;
             font-weight: normal;
         }
         .modal-theme-blue .close span {
             color: white;
         }
         .modal-theme-blue .close span:hover {
             color: #fbc217;
         }
         .close.standalone {
             position: absolute;
             right: 15px;
             top: 13px;
             z-index: ${MAX_ZINDEX};
             height: 30px;
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
         .modal-theme-blue .modal-content {
            background-color: #4a6173;
         }
         .modal-header {
             min-height: 16.43px;
             padding: 15px;
             border-bottom: 1px solid #e5e5e5;
             min-height: 50px
         }
         .modal-theme-blue .modal-header {
            border-bottom: none;
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


         /* Carousel */

         .pag-dot {
            display: inline-block;
            width: 10px;
            height: 10px;
            background: white;
            border: solid 1px #c0c0c0;
            border-radius: 50%;
            margin: 7px;
         }
         .pag-dot.active {
            background: #c0c0c0;
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
             z-index: ${MAX_ZINDEX};
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
 * Carousel
 * It's really simple take on it. it's not even a carousel yet
 * plenty of room for improvements
 * ------------------------------------------------------------------------
 */
class Carousel {

    constructor(options, parent = document.body) {
        this.defaults = {};
        this.defaults = extend(this.defaults, options);

        this.parent = parent;
        this.slides = this.parent.querySelectorAll('.carousel');
        this.pagers = [];
        this.arangeSlides();
        this.currentSlide = 0;

    }

    arangeSlides() {

        foreach(this.slides, (item, i) => {

            item.style.display = 'none';

            this.pagers.push(new Elm('div.pag-dot', {
                'id': 'pag-' + i,
                //'click': ()=> {
                //    this.setSlide(i)
                //}
            }, this.parent.querySelector('.modal-footer')));

        });

        this.slides[0].style.display = 'block';
        setClass(this.pagers[0], 'active');
    }

    next() {
        if (this.currentSlide + 1 >= this.slides.length)
            return false;
        this.setSlide(++this.currentSlide);
    }

    prev() {
        if (this.currentSlide === 0)
            return false;
        this.setSlide(--this.currentSlide);
    }

    setSlide(i) {
        // update current
        this.currentSlide = i;
        // Get selected
        let currentPag = this.pagers[i];
        let currentSlide = this.slides[i];

        // remove active from previous pags
        foreach(this.pagers, function (item) {
            removeClass(item, 'active');
        });
        setClass(currentPag, 'active');

        // hide all and show current slide
        foreach(this.slides, function (item) {
            item.style.display = 'none';
        });
        currentSlide.style.display = 'block';

    }
}


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
            footer: '',
            theme: 'classic',
            closeButton: true,
            size: 'normal',//large small
            uid: null, //if uid is given, the modal vill create an global var on that id and store it self.
            onClose: function () {
            },
            onOpen: function () {
            }
        };
        this.isCarousel = false; //maybe these two can merge
        this.carousel = null; //maybe these two can merge
        this.defaults = extend(this.defaults, options);

        if (this.defaults.uid) {
            window[this.defaults.uid] = this;
        }
        this.__proto__.closeAll();
        this.__proto__.instances.push(this);
        this._injectStyles();
        this.buildTemplate();
    }

    buildTemplate() {
        //The Modal ships with three sizes bootstrap style
        let sizeMap = {
            'small': 'chain_modal-sm',
            'normal': '',
            'large': 'chain_modal-lg'
        };
        let sizeClass = sizeMap[this.defaults.size];

        //TODO default message can be rich html so message is not a god name for it
        let content = this.defaults.message;

        //if message is array we create carousel content
        if (isArray(this.defaults.message)) {
            this.isCarousel = true;
            let merge = '';
            this.defaults.message.forEach((item, i) => {
                merge += `<div class="carousel slide${i}">${item}</div>`;
            });
            content = merge;
        }

        //Add header if we have a title. if not we only add the close button.
        let header = '';
        if (this.defaults.title) {
            header = `
                <div class="modal-header">
                    <button type="button" class="close"><span>×</span></button>
                    <h4 class="modal-title" id="myModalLabel">${this.defaults.title}</h4>
                </div>`;
        }
        if (this.defaults.title && !this.defaults.closeButton) {
            header = `
                <div class="modal-header">
                    <h4 class="modal-title" id="myModalLabel">${this.defaults.title}</h4>
                </div>`;
        }
        if (!this.defaults.title && this.defaults.closeButton) {
            header = '<button type="button" class="close standalone"><span>×</span></button>';
        }

        let footer = `
                <div class="modal-footer">
                    ${this.defaults.footer}
                </div>`;

        //TODO sameina footer of iscarousel þetta er tvítekið
        if (this.isCarousel) {
            //let pagers = '<div class="pag-dot"></div>'.repeat(slides); depricated
            footer = `
                <div class="modal-footer">
                    ${this.defaults.footer}
                </div>`;
        }

        let main = `
                <div class="chain_modal fadeInDown">
                    <div class="chain_dialog ${sizeClass}">
                        <div class="modal-content">
                            ${header}
                            <div class="modal-body">
                                <div>${content}</div>
                            </div>
                            ${footer}
                        </div>
                    </div>
                </div>`;


        this.modal = new Elm('div', {html: main, 'class': `modal-theme-${this.defaults.theme}`}, document.body);

        if (this.defaults.closeButton) {
            let btn = this.modal.querySelector('.close');
            btn.onclick = ()=> {
                this.close();
            };
        }

        if (this.isCarousel) {
            this.carousel = new Carousel({}, this.modal);
        }

        this.chainDialog = this.modal.querySelector('.chain_dialog');
        setClass(document.body, 'modal-mode');
        this.defaults.onOpen();

    }

    _injectStyles() {
        //TODO consider removing styleFallback by splitting styles for each component
        if (!document.querySelector('.showtimeStyles')) {
            new Elm('div.showtimeStyles', {
                html: STYLES
            }, document.head);
        }
    }

    _close(cb = ()=> {
    }) {
        setClass(this.chainDialog, 'fadeOutTop');
        setTimeout(()=> {
            // remove dom
            this.modal.remove();
            // remove instance from global
            ////window[this.defaults.uid] = null;
            // remove the modal class from body
            removeClass(document.body, 'modal-mode');
            cb();
        }, 500);
    }

    close() {
        this._close(this.defaults.onClose);
    }

}
Modal.prototype.instances = [];
Modal.prototype.closeAll = function () {
    this.instances.forEach(function (item) {
        item._close();
    });
    this.instances.length = 0;
};


/**
 * ------------------------------------------------------------------------
 * Popover
 * Creates bootstrap-like popover with position relative to given element
 * ------------------------------------------------------------------------
 */

class Popover {
    constructor(element, config) {
        this.element = element;
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
        let elDim = getHigestBoundingRect(this.element);




        ///////
        //for (var i = 0, len = nodes.length; i < len; i++) {
        //    var node = nodes[i];
        //
        //    // Fetch the screen coordinates for this element
        //    var position = getScreenPosition(node);
        //
        //    var x = position.x,
        //        y = position.y,
        //        w = node.offsetWidth,
        //        h = node.offsetHeight;
        //
        //    // 1. offsetLeft works
        //    // 2. offsetWidth works
        //    // 3. Element is larger than zero pixels
        //    // 4. Element is not <br>
        //    if (node && typeof x === 'number' && typeof w === 'number' && ( w > 0 || h > 0 ) && !node.nodeName.match(/^br$/gi)) {
        //        currentRegion.left = Math.min(currentRegion.left, x);
        //        currentRegion.top = Math.min(currentRegion.top, y);
        //        currentRegion.right = Math.max(currentRegion.right, x + w);
        //        currentRegion.bottom = Math.max(currentRegion.bottom, y + h);
        //    }
        //}
        //
        ///////



        let popDim = this.popover.getBoundingClientRect();
        let bodyDim = {
            height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
            width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
        };

        let top, left;
        let offset = this.getOffset();


        //TODO this needs some love
        //the fit calculations dont work on all sides
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
            //if (this.default.collision === 'fit' && (left + popDim.width) > bodyDim.width) {
            //    left = bodyDim.width - popDim.width;
            //}
        }
        if (placement === 'bottom') {
            top = elDim.top + elDim.height + offset.y + window.scrollY;
            left = elDim.left + (elDim.width / 2) - (popDim.width / 2) + offset.x;
            ////fit to left
            //if (this.default.collision === 'fit' && (left + popDim.width) > bodyDim.width) {
            //    left = bodyDim.width - popDim.width;
            //}
            ////fit to bottom
            //if (this.default.collision === 'fit' && (top + popDim.height) > bodyDim.height) {
            //    top = bodyDim.height - popDim.height;
            //}
            ////fit to right
            //if (this.default.collision === 'fit' && (left + popDim.width) > bodyDim.width) {
            //    left = bodyDim.width - popDim.width;
            //}
        }

        this.popover.style.top = top + 'px';
        this.popover.style.left = left + 'px';
    }
}

/**
 * ------------------------------------------------------------------------
 * Focus
 * Creates a overlay with focus on the given element.
 * It includes linear animation between elements and animated scroll to
 * ensure the given element is in view
 * ------------------------------------------------------------------------
 */
    // In the first version we created 4 transparent overlays around the given element. That had a blinking line problem on mobile.
    // This Class is based on https://github.com/hakimel/Fokus. A better approach with fixed canvas as overlay and clearRect for
    // selected area
class Focus {
    constructor(config) {
        this.options = {
            padding: 5,
            removeOnOuterClick: false
        };
        this.options = extend(this.options, config);
        this.ELEMENT = null;
        // Padding around the selection
        this.PADDING = this.options.padding;
        // Opacity of the overlay
        this.OPACITY = 0.5;
        this.idleState = false;
        this._fadeIn = true;
        //padding is disregarded if cover is true
        this.cover = false;
        this.overlayAlpha = 0;
        // Reference to the redraw animation so it can be cancelled
        this.redrawAnimation;
        // Currently selected region
        this.selectedRegion = {left: 0, top: 0, right: 0, bottom: 0};
        // Currently cleared region
        this.clearedRegion = {left: 0, top: 0, right: 0, bottom: 0};
        //setja overlay sem canvas
        this.overlay = document.createElement('canvas');
        this.overlayContext = this.overlay.getContext('2d');

        // Place the canvas on top of everything
        //fletja canvas yfir skjáinn
        this.overlay.style.position = 'fixed';
        this.overlay.style.left = 0;
        this.overlay.style.top = 0;
        this.overlay.style.zIndex = MAX_ZINDEX - 1; //just about as high as it can get
        //this.overlay.style.pointerEvents = 'none';
        this.overlay.style.background = 'transparent';

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        //window.addEventListener('scroll', this.updateSelection.bind(this), false);
        if(this.options.removeOnOuterClick) {
            this.overlay.addEventListener('click', ()=> {
                this.onOuterClick();
            }, false);
        }

        // Trigger an initial resize
        this.onWindowResize();
    }

    onOuterClick() {
    }

    fadeIn() {
        this._fadeIn = true;
    }

    fadeOut() {
        this._fadeIn = false;
    }

    remove() {
        this._fadeIn = false;
    }

    scrollToView(elm) {
        let styles = getScreenPosition(elm);
        let viewportHeight = getViewPortHeight();

        //If element is not in the viewport on the y axis we scroll to that element.
        if (!isElementInViewport(elm)) {
            let y = elementOffsetTop(elm) - (viewportHeight / 2 );
            scrollToY(y);
        }
        else if (styles.top < window.scrollY) {
            let y = styles.top;
            scrollToY(y);
        }
    }

    focusOnElement(elm) {
        this.cover = false;
        this.scrollToView(elm);
        this.fadeIn();
        this.ELEMENT = elm;
        this.updateSelection();
    }

    coverAll() {
        this.cover = true;
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;
        this.selectedRegion = {left: x, top: y, right: x, bottom: y};
        this.redraw();
    }

    onWindowResize(event) {
        this.overlay.width = window.innerWidth;
        this.overlay.height = window.innerHeight;
        this.updateSelection();
    }

    updateSelection(immediate = false) {
        // Default to negative space
        let currentRegion = {left: Number.MAX_VALUE, top: Number.MAX_VALUE, right: 0, bottom: 0};

        //TODO make sure multiple elements is valid
        if (this.ELEMENT == null) return false;
        let nodes = this.ELEMENT.length ? this.ELEMENT : [this.ELEMENT];
        for (var i = 0, len = nodes.length; i < len; i++) {
            var node = nodes[i];

            // Fetch the screen coordinates for this element
            var position = getScreenPosition(node);

            var x = position.x,
                y = position.y,
                w = node.offsetWidth,
                h = node.offsetHeight;

            // 1. offsetLeft works
            // 2. offsetWidth works
            // 3. Element is larger than zero pixels
            // 4. Element is not <br>
            if (node && typeof x === 'number' && typeof w === 'number' && ( w > 0 || h > 0 ) && !node.nodeName.match(/^br$/gi)) {
                currentRegion.left = Math.min(currentRegion.left, x);
                currentRegion.top = Math.min(currentRegion.top, y);
                currentRegion.right = Math.max(currentRegion.right, x + w);
                currentRegion.bottom = Math.max(currentRegion.bottom, y + h);
            }
        }

        this.selectedRegion = currentRegion;

        // If flagged, update the cleared region immediately
        if (immediate) {
            this.clearedRegion = this.selectedRegion;
        }

        if (this.hasSelection()) {
            this.idleState = false;
            this.redraw();
        }
    }

    animationComplete() {
        let left = Math.round(this.clearedRegion.left) === Math.round(this.selectedRegion.left);
        let top = Math.round(this.clearedRegion.top) === Math.round(this.selectedRegion.top);
        let right = Math.round(this.clearedRegion.right) === Math.round(this.selectedRegion.right);
        let bottom = Math.round(this.clearedRegion.bottom) === Math.round(this.selectedRegion.bottom);
        let overlay = Math.round(this.overlayAlpha * 100) / 100 === this.OPACITY;

        //returns true if all cleared and selected regions are identical and overlay is same as opacity
        return left && top && right && bottom && overlay;
    }

    hasSelection() {
        return this.selectedRegion.left < this.selectedRegion.right && this.selectedRegion.top < this.selectedRegion.bottom;
    }

    complete() {
    }


    redraw() {
        //if (this.idleState) return false; // TODO deal with scroll and fadeout delema
        // Reset to a solid (less opacity) overlay fill
        this.overlayContext.clearRect(0, 0, this.overlay.width, this.overlay.height);
        this.overlayContext.fillStyle = 'rgba( 0, 0, 0, ' + this.overlayAlpha + ' )';
        this.overlayContext.fillRect(0, 0, this.overlay.width, this.overlay.height);

        if (this.overlayAlpha < 0.1) {
            // Clear the selection instantly if we're just fading in
            this.clearedRegion = this.selectedRegion;
        }
        else {
            // Ease the cleared region towards the selected selection
            this.clearedRegion.left += ( this.selectedRegion.left - this.clearedRegion.left ) * 0.118;
            this.clearedRegion.top += ( this.selectedRegion.top - this.clearedRegion.top ) * 0.118;
            this.clearedRegion.right += ( this.selectedRegion.right - this.clearedRegion.right ) * 0.118;
            this.clearedRegion.bottom += ( this.selectedRegion.bottom - this.clearedRegion.bottom ) * 0.118;
        }

        // Cut out the cleared region
        let padding = this.cover ? 0 : this.PADDING;
        this.overlayContext.clearRect(
            this.clearedRegion.left - window.scrollX - padding,
            this.clearedRegion.top - window.scrollY - padding,
            ( this.clearedRegion.right - this.clearedRegion.left ) + ( padding * 2 ),
            ( this.clearedRegion.bottom - this.clearedRegion.top ) + ( padding * 2 )
        );
        // Fade in if there's a valid selection...
        if (this._fadeIn) {
            this.overlayAlpha += ( this.OPACITY - this.overlayAlpha ) * 0.08;
        }
        // Otherwise fade out
        else {
            this.overlayAlpha = Math.max(( this.overlayAlpha * 0.85 ) - 0.02, 0);
        }

        // Ensure there is no overlap
        cancelAnimationFrame(this.redrawAnimation);

        if (this.animationComplete() && this.notify) {
            this.complete();
        }
        // Continue so long as there is content selected or we are fading out
        if (this.overlayAlpha > 0) {
            // Append the overlay if it isn't already in the DOM
            if (!this.overlay.parentNode) document.body.appendChild(this.overlay);

            // Stage a new animation frame
            this.redrawAnimation = requestAnimationFrame(() => {
                this.redraw();
            });
        }

        else {
            document.body.removeChild(this.overlay);
        }

    }
}

/**
 *
 * Tour / Showtime
 * This class ties it all together
 *
 */
    //TODO keep focus on scroll and resize add fit options for Popover

class Showtime {

    constructor(options) {
        this.chain = [];
        this.chainIndex = 0;
        this.defaults = {
            nameSpace: null,
            padding: 0,
            placement: 'right',
            autoplay: false,
            autoplayDelay: 1000,
            buttons: [],
            focusClick: null,
            removeOnOuterClick: false,
            popoverTimer: 'auto' //adjust when popover is animated. auto, false or milliseconds
        };
        //override default with user options
        this.defaults = extend(this.defaults, options);
        // this.tmpSettings might change on every _callAgain as it is merged with the given settings
        this.tmpSettings = this.defaults;
        this._createFocus();

        this.focus.notify = true;
        this.focus.complete = throttle(()=> {
            if(this.focus.notify) {
                this.focus.notify = false;
                if (this.tmpSettings.popoverTimer === 'auto') {
                    this.popover.show();
                }
                if (this.defaults.autoplay) {
                    this._callAgain()
                }
            }
        }, 500);
        this.focus.onOuterClick = ()=> {
            this.quit();
        }
    }

    /*
     * Events Methods
     */
    onStart() {
    }

    onStep(index, maxStep) {
    }

    onQuit() {
    }

    /*
     * Event Methods end
     */

    _uniqueNameGenerator() {
        /*
         * Find all elements given in the chain and make an hopefully uniqe name form classes and id
         */
        var name = '';
        foreach(this.chain, item => {
            let elm = item.element || document;
            let cls = elm.id || elm.className;
            if (cls) name += cls;
        });

        return name;
    }

    _createFocus() {
        this.focus = new Focus({
            padding: this.defaults.padding,
            removeOnOuterClick: this.defaults.removeOnOuterClick
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
        //focus is reused until tour.quit() then it gets deleted and we have to create it again.
        if (!this.focus) this._createFocus();
        this.focus.notify = true;
        let chainItem = this._resolveChainItem();
        // if chainItem is a function it means it either a carousel next function
        // or function that returns the settings object dynamically
        if (typeof(chainItem) === 'function') {
            let fnName = getFnName(chainItem);

            // Carousel next
            if (fnName === '_carouselNext') {
                chainItem();
                this.chainIndex++;
                return;
            }

            //call function
            if (fnName === 'call') {
                chainItem();
                this.chainIndex++;
                this.next();
                return;
            }
        }

        if (chainItem._type === 'modal') {
            this._removePopover();
            this.focus.coverAll();
            let modal = new Modal(chainItem);
            this.chainIndex++;
            return;
        }
        let defaults = clone(this.defaults);
        let settings = extend(defaults, chainItem);
        this.tmpSettings = settings;//TODO merge above

        this._removePopover();
        //We create new popover for every focus point. This is easier to manage than collecting them
        this.popover = new Popover(settings.element, {
            title: settings.title,
            content: settings.content,
            placement: settings.placement,//top, left, right, bottom
            collision: 'fit',
            offset: this._resolveOffsets(settings),
            buttons: settings.buttons
        });
        this.focus.PADDING = settings.padding;
        this.focus.focusOnElement(settings.element);
        if (defaults.popoverTimer !== 'auto') {
            let time = parseInt(defaults.popoverTimer) || 0;
            setTimeout(()=> {
                this.popover.show();
            }, time);
        }


        this.chainIndex++;
        //if (typeof settings.focusClick === "undefined" || !settings.focusClick) {
        //    this.focus.focusBox.middle.style.pointerEvents = 'none'
        //}
        //else {
        //    this.focus.focusBox.middle.style.pointerEvents = 'auto';
        //    this.focus.focusBox.middle.onclick = settings.focusClick;
        //}
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

    _getNameSpace() {
        if (!this.defaults.nameSpace) {
            this.defaults.nameSpace = this._uniqueNameGenerator();
        }
        this.completedSteps = parseInt(localStorage.getItem(this.defaults.nameSpace) || 0);
    }

    clearCache() {
        this._getNameSpace();
        localStorage.removeItem(this.defaults.nameSpace);
    }

    _resolveChainItem() {
        /*
         * This function just returns the current settings item.
         * If we need any special cases this is where to resolve it.
         */
        let item = this.chain[this.chainIndex];
        if (typeof item === 'function') {
            let fnName = getFnName(item);
            // if item is an anonymous function reslove the results
            if (!fnName) {
                return item();
            }
        }
        if(item.hasOwnProperty('element')) {
            if(typeof item.element === 'function') {
                item.element = item.element();
            }
        }
        // here the item can be named function or a settings object. do nothing
        return item;
    }

    show(options) {
        options._type = 'show';
        this.chain.push(options);
        return this;
    }

    modal(options) {
        options._type = 'modal';
        // unique id that the modal will create on the global
        options.uid = randomstring(9);
        this.chain.push(options);

        // if message is array. We have a carousel in the modal
        // So we generate functions in the chain for each slide
        if (options.message && isArray(options.message)) {
            for (let i = 1; i < options.message.length; i++) {
                this.chain.push(function _carouselNext() {
                    window[options.uid].carousel.setSlide(i)
                });
            }
        }
        return this;
    }

    next() {
        this.__proto__.isTour = true;
        let item = this._resolveChainItem();

        if (this.chainIndex) {
            // Dont close the modal if we have a function
            if (typeof(item) !== 'function') {
                Modal.prototype.closeAll();
            }
        }
        if (this._isNext()) {
            this._callchain();

            // cache the higest seen step to local storage
            if (this.chainIndex > this.completedSteps) {
                this.completedSteps = this.chainIndex;
                localStorage.setItem(this.defaults.nameSpace, this.chainIndex);
            }
            this.onStep(this.chainIndex, this.completedSteps);
            if (this.completedSteps === this.chain.length) {
                console.warn('Tour' + this.defaults.nameSpace + ' is alredy completed. Use start method to go again.');
            }
        }
        else {
            this.quit();
        }
        return this;
    }

    reset() {
        this.chainIndex = 0;
        return this;
    }

    quit() {
        Modal.prototype.closeAll();
        this.focus.remove();
        delete this.focus;
        try {
            this.popover.remove();
        } catch (err) {
            //pass
        }
        Modal.prototype.instances.length = 0;
        this.onQuit();
        this.__proto__.isTour = false;
        return this;
    }

    call(fn) {
        //TODO change to option type to keep consitant
        this.chain.push(function call() {
            fn();
        });

        return this;
    }

    previous() {
        this.chainIndex--;
        this.chainIndex < 1 ? this.chainIndex = 0 : this.chainIndex--;
        this._callchain();
        this.onStep(this.chainIndex, this.completedSteps);
        return this;
    }

    start() {
        // get the unique name for this instance for cache
        this._getNameSpace();

        // fire the onStart event
        this.onStart();
        this.chainIndex = 0;
        this.next();
        return this;
    }


    play() {
        this._getNameSpace();
        this.onStart();
        this.next();
        return this;
    }

    goto(index) {
        this.chainIndex = index - 1;
        return this;
    }


    resume() {
        // get the unique name for this instangulpce for cache
        this._getNameSpace();

        // fire the onStart event
        this.onStart();

        // set index to the last completed step from cache
        this.chainIndex = this.completedSteps;

        // TODO this needs some thinking. It fails if previous steps are a pagnation functions on a modal
        // Possible solution is to rewind to the modal function run it and pagnate to the last slide
        try {
            this.previous();
        } catch (err) {
            --this.chainIndex;
            this.previous();
        }
        return this;
    }

}

// Is set to true if tour is running. This gives developers change to check globaly.
Showtime.prototype.isTour = false;
