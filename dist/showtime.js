;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Showtime = factory();
  }
}(this, function() {
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
        for (;;) {
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
    };
}

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

//Get element offset position
var getScreenPosition = function getScreenPosition(node) {
    var x = document.documentElement.offsetLeft,
        y = document.documentElement.offsetTop;

    if (node.offsetParent) {
        do {
            x += node.offsetLeft;
            y += node.offsetTop;
        } while (node = node.offsetParent);
    }

    return { x: x, y: y };
};

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

var isArray = function () {
    if (typeof Array.isArray === 'undefined') {
        return function (value) {
            return toString.call(value) === '[object Array]';
        };
    }
    return Array.isArray;
}();

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
    if (isElement(arg)) {
        for (var i = 0; i < arg.length; i++) {
            if (isElement(arg[i])) func.call(window, arg[i], i, arg);
        }
        return false;
    }

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

var isElement = function isElement(item) {
    return (item[0] || item).nodeType;
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

var getHigestBoundingRect = function getHigestBoundingRect(nodes) {
    if (!nodes.length) {
        return nodes.getBoundingClientRect();
    }
    var rect = { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0 };
    for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var r = el.getBoundingClientRect();
        rect.bottom = Math.min(rect.bottom, r.bottom);
        rect.height = Math.min(rect.height, r.height);
        rect.left = Math.max(rect.left, r.left);
        rect.right = Math.max(rect.right, r.right);
        rect.top = Math.max(rect.top, r.top);
        rect.width = Math.max(rect.width, r.width);
    }
    return rect;
};

var isElementInViewport = function isElementInViewport(el) {
    var rect = getHigestBoundingRect(el);
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
};
window.foo = isElementInViewport;

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
    var element = el;
    for (var prop in styles) {
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

function roundUp(num) {
    return Math.ceil(num * 10) / 10;
}

function randomstring(L) {
    var s = '';
    var randomchar = function randomchar() {
        var n = Math.floor(Math.random() * 62);
        if (n < 10) return n; //1-10
        if (n < 36) return String.fromCharCode(n + 55); //A-Z
        return String.fromCharCode(n + 61); //a-z
    };
    while (s.length < L) {
        s += randomchar();
    }return s;
}

function getFnName(fn) {
    return fn.toString().split(' ')[1].split('(')[0];
}

var MAX_ZINDEX = 2147483647;

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
            this.element.addEventListener('click', function (e) {
                fn(e);
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

//TODO style fallback is injected on every tour start

var STYLES = '\n        <style>\n        /* Modal styles */\n         body.modal-mode {\n             overflow: hidden\n         }\n         .modal-body,\n         .modal-title {\n             line-height: 1.42857143;\n             color: #333\n         }\n         .modal-footer {\n             padding: 15px;\n             text-align: center;\n             //border-top: 1px solid #e5e5e5;\n         }\n\n         .chain_modal,\n         .modal-backdrop {\n             position: fixed;\n             top: 0;\n             right: 0;\n             bottom: 0;\n             left: 0\n         }\n\n         .chain_modal {\n             z-index: ' + MAX_ZINDEX + ';\n             overflow-y: scroll;\n             -webkit-overflow-scrolling: touch;\n             outline: 0\n         }\n         .chain_dialog {\n             font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;\n             position: relative;\n             width: auto;\n             margin: 10px\n         }\n         .modal-content .close {\n             margin-top: -2px;\n             position: static;\n             height: 30px;\n         }\n         .modal-theme-blue .close {\n             text-shadow: none;\n             opacity: 1;\n             font-size: 31px;\n             font-weight: normal;\n         }\n         .modal-theme-blue .close span {\n             color: white;\n         }\n         .modal-theme-blue .close span:hover {\n             color: #fbc217;\n         }\n         .close.standalone {\n             position: absolute;\n             right: 15px;\n             top: 13px;\n             z-index: ' + MAX_ZINDEX + ';\n             height: 30px;\n         }\n         .modal-title {\n             margin: 0;\n             font-size: 18px;\n             font-weight: 500\n         }\n         button.close {\n             -webkit-appearance: none;\n             padding: 0;\n             cursor: pointer;\n             background: 0 0;\n             border: 0\n         }\n         .modal-content {\n             position: relative;\n             background-color: #fff;\n             background-clip: padding-box;\n             border: 1px solid #999;\n             border: 1px solid rgba(0, 0, 0, .2);\n             border-radius: 2px;\n             outline: 0;\n             box-shadow: 0 3px 9px rgba(0, 0, 0, .5)\n         }\n         .modal-theme-blue .modal-content {\n            background-color: #4a6173;\n         }\n         .modal-header {\n             min-height: 16.43px;\n             padding: 15px;\n             border-bottom: 1px solid #e5e5e5;\n             min-height: 50px\n         }\n         .modal-theme-blue .modal-header {\n            border-bottom: none;\n         }\n         .modal-body {\n             position: relative;\n             padding: 15px;\n             font-size: 14px\n         }\n         .close {\n             float: right;\n             font-size: 21px;\n             font-weight: 700;\n             line-height: 1;\n             color: #000;\n             text-shadow: 0 1px 0 #fff;\n             opacity: .2\n         }\n\n\n         /* Carousel */\n\n         .pag-dot {\n            display: inline-block;\n            width: 10px;\n            height: 10px;\n            background: white;\n            border: solid 1px #c0c0c0;\n            border-radius: 50%;\n            margin: 7px;\n         }\n         .pag-dot.active {\n            background: #c0c0c0;\n         }\n\n         @media (min-width: 768px) {\n             .chain_dialog {\n                 width: 600px;\n                 margin: 30px auto\n             }\n             .modal-content {\n                 box-shadow: 0 5px 15px rgba(0, 0, 0, .5)\n             }\n             .chain_modal-sm {\n                 width: 300px\n             }\n         }\n         @media (min-width: 992px) {\n             .chain_modal-lg {\n                 width: 900px\n             }\n         }\n\n\n         /*popover styles*/\n         .popover {\n             position: absolute;\n             box-sizing: border-box;\n             min-width: 250px;\n             top: 0;\n             left: 0;\n             z-index: ' + MAX_ZINDEX + ';\n             display: none;\n             max-width: 276px;\n             padding: 1px;\n             font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;\n             font-style: normal;\n             font-weight: normal;\n             letter-spacing: normal;\n             line-break: auto;\n             line-height: 1.42857143;\n             text-align: left;\n             text-align: start;\n             text-decoration: none;\n             text-shadow: none;\n             text-transform: none;\n             white-space: normal;\n             word-break: normal;\n             word-spacing: normal;\n             word-wrap: normal;\n             font-size: 14px;\n             background-color: #fff;\n             background-clip: padding-box;\n             border: 1px solid #ccc;\n             border: 1px solid rgba(0, 0, 0, 0.2);\n             border-radius: 2px;\n             -webkit-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);\n             box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);\n         }\n         .popover.top {\n             margin-top: -10px;\n         }\n         .popover.right {\n             margin-left: 10px;\n         }\n         .popover.bottom {\n             margin-top: 10px;\n         }\n         .popover.left {\n             margin-left: -10px;\n         }\n         .popover-title {\n             margin: 0;\n             padding: 8px 14px;\n             font-size: 14px;\n             background-color: #f7f7f7;\n             border-bottom: 1px solid #ebebeb;\n             border-radius: 1px 1px 0 0;\n             box-sizing: border-box;\n         }\n         .popover-content {\n             padding: 9px 14px;\n             box-sizing: border-box;\n         }\n         .popover > .arrow,\n         .popover > .arrow:after {\n             position: absolute;\n             display: block;\n             width: 0;\n             height: 0;\n             border-color: transparent;\n             border-style: solid;\n         }\n         .popover > .arrow {\n             border-width: 11px;\n         }\n         .popover > .arrow:after {\n             border-width: 10px;\n             content: "";\n         }\n         .popover.top > .arrow {\n             left: 50%;\n             margin-left: -11px;\n             border-bottom-width: 0;\n             border-top-color: #999999;\n             border-top-color: rgba(0, 0, 0, 0.25);\n             bottom: -11px;\n         }\n         .popover.top > .arrow:after {\n             content: " ";\n             bottom: 1px;\n             margin-left: -10px;\n             border-bottom-width: 0;\n             border-top-color: #fff;\n         }\n         .popover.right > .arrow {\n             top: 50%;\n             left: -11px;\n             margin-top: -11px;\n             border-left-width: 0;\n             border-right-color: #999999;\n             border-right-color: rgba(0, 0, 0, 0.25);\n         }\n         .popover.right > .arrow:after {\n             content: " ";\n             left: 1px;\n             bottom: -10px;\n             border-left-width: 0;\n             border-right-color: #fff;\n         }\n         .popover.bottom > .arrow {\n             left: 50%;\n             margin-left: -11px;\n             border-top-width: 0;\n             border-bottom-color: #999999;\n             border-bottom-color: rgba(0, 0, 0, 0.25);\n             top: -11px;\n         }\n         .popover.bottom > .arrow:after {\n             content: " ";\n             top: 1px;\n             margin-left: -10px;\n             border-top-width: 0;\n             border-bottom-color: #fff;\n         }\n         .popover.left > .arrow {\n             top: 50%;\n             right: -11px;\n             margin-top: -11px;\n             border-right-width: 0;\n             border-left-color: #999999;\n             border-left-color: rgba(0, 0, 0, 0.25);\n         }\n         .popover.left > .arrow:after {\n             content: " ";\n             right: 1px;\n             border-right-width: 0;\n             border-left-color: #fff;\n             bottom: -10px;\n         }\n         .popover .btns {\n             padding: 9px 14px;\n             text-align: right;\n         }\n         .popover .popBtn {\n             color: #333;\n             font-weight: bold;\n             border: solid 1px #333;\n             display: inline-block;\n             padding: 4px 18px;\n             border-radius: 1px;\n             font-size: 13px;\n             cursor: pointer;\n             margin-left: 8px;\n         }\n\n\n         /* Focus styles */\n         .to_left,\n         .to_right,\n         .to_top,\n         .to_bottom {\n             position: absolute;\n             background: black;\n             opacity: .5;\n             filter: alpha(opacity=50);\n             z-index: 1000;\n         }\n         .ghost-focus {\n             background: transparent;\n             z-index: 1000;\n         }\n\n\n         /*** Animations ***/\n         @-webkit-keyframes fadeInDown {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, -10px, 0);\n                 transform: translate3d(0, -10px, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @keyframes fadeInDown {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, -10px, 0);\n                 transform: translate3d(0, -10px, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @-webkit-keyframes fadeInTop {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, 10px, 0);\n                 transform: translate3d(0, 10px, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @keyframes fadeInTop {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, 10px, 0);\n                 transform: translate3d(0, 10px, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @-webkit-keyframes fadeOutTop {\n             0% {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none\n             }\n             100% {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, -10px, 0);\n                 transform: translate3d(0, -10px, 0)\n             }\n         }\n         @keyframes fadeOutTop {\n             0% {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none\n             }\n             100% {\n                 opacity: 0;\n                 -webkit-transform: translate3d(0, -10px, 0);\n                 transform: translate3d(0, -10px, 0)\n             }\n         }\n         @-webkit-keyframes fadeInLeft {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(-10px, 0, 0);\n                 transform: translate3d(-10px, 0, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @keyframes fadeInLeft {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(-10px, 0, 0);\n                 transform: translate3d(-10px, 0, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @-webkit-keyframes fadeInRight {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(10px, 0, 0);\n                 transform: translate3d(10px, 0, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         @keyframes fadeInRight {\n             from {\n                 opacity: 0;\n                 -webkit-transform: translate3d(10px, 0, 0);\n                 transform: translate3d(10px, 0, 0);\n             }\n             to {\n                 opacity: 1;\n                 -webkit-transform: none;\n                 transform: none;\n             }\n         }\n         .fadeInDown,\n         .fadeInLeft,\n         .fadeInRight,\n         .fadeInTop,\n         .fadeOutTop{\n             -webkit-animation-fill-mode: both;\n             -webkit-animation-duration: .5s;\n             animation-duration: .5s;\n             animation-fill-mode: both;\n         }\n         .fadeInDown {\n             -webkit-animation-name: fadeInDown;\n             animation-name: fadeInDown;\n         }\n         .fadeInLeft {\n             -webkit-animation-name: fadeInLeft;\n             animation-name: fadeInLeft;\n         }\n         .fadeInRight {\n             -webkit-animation-name: fadeInRight;\n             animation-name: fadeInRight;\n         }\n         .fadeInTop {\n             -webkit-animation-name: fadeInTop;\n             animation-name: fadeInTop;\n         }\n         .fadeOutTop {\n             -webkit-animation-name: fadeOutTop;\n             animation-name: fadeOutTop;\n         }\n        </style>';

/**
 * ------------------------------------------------------------------------
 * Carousel
 * It's really simple take on it. it's not even a carousel yet
 * plenty of room for improvements
 * ------------------------------------------------------------------------
 */

var Carousel = function () {
    function Carousel(options) {
        var parent = arguments.length <= 1 || arguments[1] === undefined ? document.body : arguments[1];

        _classCallCheck(this, Carousel);

        this.defaults = {};
        this.defaults = extend(this.defaults, options);

        this.parent = parent;
        this.slides = this.parent.querySelectorAll('.carousel');
        this.pagers = [];
        this.arangeSlides();
        this.currentSlide = 0;
    }

    _createClass(Carousel, [{
        key: 'arangeSlides',
        value: function arangeSlides() {
            var _this2 = this;

            foreach(this.slides, function (item, i) {

                item.style.display = 'none';

                _this2.pagers.push(new Elm('div.pag-dot', {
                    'id': 'pag-' + i
                }, //'click': ()=> {
                //    this.setSlide(i)
                //}
                _this2.parent.querySelector('.modal-footer')));
            });

            this.slides[0].style.display = 'block';
            setClass(this.pagers[0], 'active');
        }
    }, {
        key: 'next',
        value: function next() {
            if (this.currentSlide + 1 >= this.slides.length) return false;
            this.setSlide(++this.currentSlide);
        }
    }, {
        key: 'prev',
        value: function prev() {
            if (this.currentSlide === 0) return false;
            this.setSlide(--this.currentSlide);
        }
    }, {
        key: 'setSlide',
        value: function setSlide(i) {
            // update current
            this.currentSlide = i;
            // Get selected
            var currentPag = this.pagers[i];
            var currentSlide = this.slides[i];

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
    }]);

    return Carousel;
}();

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
            footer: '',
            theme: 'classic',
            closeButton: true,
            size: 'normal', //large small
            uid: null, //if uid is given, the modal vill create an global var on that id and store it self.
            onClose: function onClose() {},
            onOpen: function onOpen() {}
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

    _createClass(Modal, [{
        key: 'buildTemplate',
        value: function buildTemplate() {
            var _this3 = this;

            //The Modal ships with three sizes bootstrap style
            var sizeMap = {
                'small': 'chain_modal-sm',
                'normal': '',
                'large': 'chain_modal-lg'
            };
            var sizeClass = sizeMap[this.defaults.size];

            //TODO default message can be rich html so message is not a god name for it
            var content = this.defaults.message;

            //if message is array we create carousel content
            if (isArray(this.defaults.message)) {
                this.isCarousel = true;
                var merge = '';
                this.defaults.message.forEach(function (item, i) {
                    merge += '<div class="carousel slide' + i + '">' + item + '</div>';
                });
                content = merge;
            }

            //Add header if we have a title. if not we only add the close button.
            var header = '';
            if (this.defaults.title) {
                header = '\n                <div class="modal-header">\n                    <button type="button" class="close"><span>×</span></button>\n                    <h4 class="modal-title" id="myModalLabel">' + this.defaults.title + '</h4>\n                </div>';
            }
            if (this.defaults.title && !this.defaults.closeButton) {
                header = '\n                <div class="modal-header">\n                    <h4 class="modal-title" id="myModalLabel">' + this.defaults.title + '</h4>\n                </div>';
            }
            if (!this.defaults.title && this.defaults.closeButton) {
                header = '<button type="button" class="close standalone"><span>×</span></button>';
            }

            var footer = '\n                <div class="modal-footer">\n                    ' + this.defaults.footer + '\n                </div>';

            //TODO sameina footer of iscarousel þetta er tvítekið
            if (this.isCarousel) {
                //let pagers = '<div class="pag-dot"></div>'.repeat(slides); depricated
                footer = '\n                <div class="modal-footer">\n                    ' + this.defaults.footer + '\n                </div>';
            }

            var main = '\n                <div class="chain_modal fadeInDown">\n                    <div class="chain_dialog ' + sizeClass + '">\n                        <div class="modal-content">\n                            ' + header + '\n                            <div class="modal-body">\n                                <div>' + content + '</div>\n                            </div>\n                            ' + footer + '\n                        </div>\n                    </div>\n                </div>';

            this.modal = new Elm('div', { html: main, 'class': 'modal-theme-' + this.defaults.theme }, document.body);

            if (this.defaults.closeButton) {
                var btn = this.modal.querySelector('.close');
                btn.onclick = function () {
                    _this3.close();
                };
            }

            if (this.isCarousel) {
                this.carousel = new Carousel({}, this.modal);
            }

            this.chainDialog = this.modal.querySelector('.chain_dialog');
            setClass(document.body, 'modal-mode');
            this.defaults.onOpen();
        }
    }, {
        key: '_injectStyles',
        value: function _injectStyles() {
            //TODO consider removing styleFallback by splitting styles for each component
            if (!document.querySelector('.showtimeStyles')) {
                new Elm('div.showtimeStyles', {
                    html: STYLES
                }, document.head);
            }
        }
    }, {
        key: '_close',
        value: function _close() {
            var _this4 = this;

            var cb = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

            setClass(this.chainDialog, 'fadeOutTop');
            setTimeout(function () {
                // remove dom
                _this4.modal.remove();
                // remove instance from global
                ////window[this.defaults.uid] = null;
                // remove the modal class from body
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

/**
 * ------------------------------------------------------------------------
 * Popover
 * Creates bootstrap-like popover with position relative to given element
 * ------------------------------------------------------------------------
 */

var Popover = function () {
    function Popover(element, config) {
        _classCallCheck(this, Popover);

        this.element = element;
        console.log('da elm', element);
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
            buttons: []
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
            var _this5 = this;

            var opposites = {
                'top': 'Down',
                'left': 'Left',
                'bottom': 'Top',
                'right': 'Right'
            };
            var animationClass = function animationClass() {
                return 'fadeIn' + opposites[_this5.default.placement];
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
            var elDim = getHigestBoundingRect(this.element);

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

            var popDim = this.popover.getBoundingClientRect();
            var bodyDim = {
                height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
                width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
            };

            var top = undefined,
                left = undefined;
            var offset = this.getOffset();

            //TODO this needs some love
            //the fit calculations dont work on all sides
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
                //if (this.default.collision === 'fit' && (left + popDim.width) > bodyDim.width) {
                //    left = bodyDim.width - popDim.width;
                //}
            }
            if (placement === 'bottom') {
                top = elDim.top + elDim.height + offset.y + window.scrollY;
                left = elDim.left + elDim.width / 2 - popDim.width / 2 + offset.x;
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
    }]);

    return Popover;
}();

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

var Focus = function () {
    function Focus(config) {
        _classCallCheck(this, Focus);

        this.options = {
            padding: 5
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
        this.selectedRegion = { left: 0, top: 0, right: 0, bottom: 0 };
        // Currently cleared region
        this.clearedRegion = { left: 0, top: 0, right: 0, bottom: 0 };
        //setja overlay sem canvas
        this.overlay = document.createElement('canvas');
        this.overlayContext = this.overlay.getContext('2d');

        // Place the canvas on top of everything
        //fletja canvas yfir skjáinn
        this.overlay.style.position = 'fixed';
        this.overlay.style.left = 0;
        this.overlay.style.top = 0;
        this.overlay.style.zIndex = MAX_ZINDEX - 1; //just about as high as it can get
        this.overlay.style.pointerEvents = 'none';
        this.overlay.style.background = 'transparent';

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        //window.addEventListener('scroll', this.updateSelection.bind(this), false);

        // Trigger an initial resize
        this.onWindowResize();
    }

    _createClass(Focus, [{
        key: 'fadeIn',
        value: function fadeIn() {
            this._fadeIn = true;
        }
    }, {
        key: 'fadeOut',
        value: function fadeOut() {
            this._fadeIn = false;
        }
    }, {
        key: 'remove',
        value: function remove() {
            this._fadeIn = false;
        }
    }, {
        key: 'scrollToView',
        value: function scrollToView(elm) {
            var styles = getScreenPosition(elm);
            var viewportHeight = getViewPortHeight();

            //If element is not in the viewport on the y axis we scroll to that element.
            if (!isElementInViewport(elm)) {
                var y = elementOffsetTop(elm) - viewportHeight / 2;
                scrollToY(y);
            } else if (styles.top < window.scrollY) {
                var y = styles.top;
                scrollToY(y);
            }
        }
    }, {
        key: 'focusOnElement',
        value: function focusOnElement(elm) {
            this.cover = false;
            this.scrollToView(elm);
            this.fadeIn();
            this.ELEMENT = elm;
            this.updateSelection();
        }
    }, {
        key: 'coverAll',
        value: function coverAll() {
            this.cover = true;
            var x = window.innerWidth / 2;
            var y = window.innerHeight / 2;
            this.selectedRegion = { left: x, top: y, right: x, bottom: y };
            this.redraw();
        }
    }, {
        key: 'onWindowResize',
        value: function onWindowResize(event) {
            this.overlay.width = window.innerWidth;
            this.overlay.height = window.innerHeight;
            this.updateSelection();
        }
    }, {
        key: 'updateSelection',
        value: function updateSelection() {
            var immediate = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            // Default to negative space
            var currentRegion = { left: Number.MAX_VALUE, top: Number.MAX_VALUE, right: 0, bottom: 0 };

            //TODO make sure multiple elements is valid
            if (this.ELEMENT == null) return false;
            var nodes = this.ELEMENT.length ? this.ELEMENT : [this.ELEMENT];
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
                if (node && typeof x === 'number' && typeof w === 'number' && (w > 0 || h > 0) && !node.nodeName.match(/^br$/gi)) {
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
    }, {
        key: 'animationComplete',
        value: function animationComplete() {
            var left = Math.round(this.clearedRegion.left) === Math.round(this.selectedRegion.left);
            var top = Math.round(this.clearedRegion.top) === Math.round(this.selectedRegion.top);
            var right = Math.round(this.clearedRegion.right) === Math.round(this.selectedRegion.right);
            var bottom = Math.round(this.clearedRegion.bottom) === Math.round(this.selectedRegion.bottom);
            var overlay = Math.round(this.overlayAlpha * 100) / 100 === this.OPACITY;

            //returns true if all cleared and selected regions are identical and overlay is same as opacity
            return left && top && right && bottom && overlay;
        }
    }, {
        key: 'hasSelection',
        value: function hasSelection() {
            return this.selectedRegion.left < this.selectedRegion.right && this.selectedRegion.top < this.selectedRegion.bottom;
        }
    }, {
        key: 'complete',
        value: function complete() {}
    }, {
        key: 'redraw',
        value: function redraw() {
            var _this6 = this;

            //if (this.idleState) return false; // TODO deal with scroll and fadeout delema
            // Reset to a solid (less opacity) overlay fill
            this.overlayContext.clearRect(0, 0, this.overlay.width, this.overlay.height);
            this.overlayContext.fillStyle = 'rgba( 0, 0, 0, ' + this.overlayAlpha + ' )';
            this.overlayContext.fillRect(0, 0, this.overlay.width, this.overlay.height);

            if (this.overlayAlpha < 0.1) {
                // Clear the selection instantly if we're just fading in
                this.clearedRegion = this.selectedRegion;
            } else {
                // Ease the cleared region towards the selected selection
                this.clearedRegion.left += (this.selectedRegion.left - this.clearedRegion.left) * 0.118;
                this.clearedRegion.top += (this.selectedRegion.top - this.clearedRegion.top) * 0.118;
                this.clearedRegion.right += (this.selectedRegion.right - this.clearedRegion.right) * 0.118;
                this.clearedRegion.bottom += (this.selectedRegion.bottom - this.clearedRegion.bottom) * 0.118;
            }

            // Cut out the cleared region
            var padding = this.cover ? 0 : this.PADDING;
            this.overlayContext.clearRect(this.clearedRegion.left - window.scrollX - padding, this.clearedRegion.top - window.scrollY - padding, this.clearedRegion.right - this.clearedRegion.left + padding * 2, this.clearedRegion.bottom - this.clearedRegion.top + padding * 2);
            // Fade in if there's a valid selection...
            if (this._fadeIn) {
                this.overlayAlpha += (this.OPACITY - this.overlayAlpha) * 0.08;
            }
            // Otherwise fade out
            else {
                    this.overlayAlpha = Math.max(this.overlayAlpha * 0.85 - 0.02, 0);
                }

            // Ensure there is no overlap
            cancelAnimationFrame(this.redrawAnimation);

            if (this.animationComplete()) {
                this.complete();
            }
            // Continue so long as there is content selected or we are fading out
            if (this.overlayAlpha > 0) {
                // Append the overlay if it isn't already in the DOM
                if (!this.overlay.parentNode) document.body.appendChild(this.overlay);

                // Stage a new animation frame
                this.redrawAnimation = requestAnimationFrame(function () {
                    _this6.redraw();
                });
            } else {
                document.body.removeChild(this.overlay);
            }
        }
    }]);

    return Focus;
}();

/**
 *
 * Tour / Showtime
 * This class ties it all together
 *
 */
//TODO keep focus on scroll and resize add fit options for Popover

var Showtime = function () {
    function Showtime(options) {
        _classCallCheck(this, Showtime);

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
        this._createFocus();
    }

    /*
     * Events Methods
     */

    _createClass(Showtime, [{
        key: 'onStart',
        value: function onStart() {}
    }, {
        key: 'onStep',
        value: function onStep(index, maxStep) {}
    }, {
        key: 'onQuit',
        value: function onQuit() {}

        /*
         * Event Methods end
         */

    }, {
        key: '_uniqueNameGenerator',
        value: function _uniqueNameGenerator() {
            /*
             * Find all elements given in the chain and make an hopefully uniqe name form classes and id
             */
            var name = '';
            foreach(this.chain, function (item) {
                var elm = item.element || document;
                var cls = elm.id || elm.className;
                if (cls) name += cls;
            });

            return name;
        }
    }, {
        key: '_createFocus',
        value: function _createFocus() {
            this.focus = new Focus({
                padding: this.defaults.padding
            });
            //TODO Focus needs to fire event on remove so we can use it here to quit tour
        }
    }, {
        key: '_callchain',
        value: function _callchain() {
            var _this7 = this;

            /*
             * We clone the default settings and merge it with the current chain settings.
             * Update the focus padding
             * create popover
             * focus on element
             */
            //focus is reused until tour.quit() then it gets deleted and we have to create it again.
            if (!this.focus) this._createFocus();

            var chainItem = this._resolveChainItem();
            // if chainItem is a function it means it either a carousel next function
            // or function that returns the settings object dynamically
            if (typeof chainItem === 'function') {
                var fnName = getFnName(chainItem);

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
                var modal = new Modal(chainItem);
                this.chainIndex++;
                return;
            }
            var defaults = clone(this.defaults);
            var settings = extend(defaults, chainItem);

            //override defaults with given for this focus
            //this.focus.default.padding = settings.padding; //TODO fix this
            this._removePopover();
            //We create new popover for every focus point. This is easier to manage than collecting them
            this.popover = new Popover(settings.element, {
                title: settings.title,
                content: settings.content,
                placement: settings.placement, //top, left, right, bottom
                collision: 'fit',
                offset: this._resolveOffsets(settings),
                buttons: settings.buttons
            });
            this.focus.focusOnElement(settings.element);
            if (defaults.popoverTimer !== 'auto') {
                var time = parseInt(defaults.popoverTimer) || 0;
                setTimeout(function () {
                    _this7.popover.show();
                }, time);
            }
            this.focus.complete = throttle(function () {
                if (defaults.popoverTimer === 'auto') {
                    _this7.popover.show();
                }
                if (_this7.defaults.autoplay) {
                    _this7._callAgain();
                }
            }, 4000); //TODO can we modify this to act like once

            this.chainIndex++;
            //if (typeof settings.focusClick === "undefined" || !settings.focusClick) {
            //    this.focus.focusBox.middle.style.pointerEvents = 'none'
            //}
            //else {
            //    this.focus.focusBox.middle.style.pointerEvents = 'auto';
            //    this.focus.focusBox.middle.onclick = settings.focusClick;
            //}
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
            var _this8 = this;

            setTimeout(function () {
                _this8.next();
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
        key: '_getNameSpace',
        value: function _getNameSpace() {
            if (!this.defaults.nameSpace) {
                this.defaults.nameSpace = this._uniqueNameGenerator();
            }
            this.completedSteps = parseInt(localStorage.getItem(this.defaults.nameSpace) || 0);
        }
    }, {
        key: 'clearCache',
        value: function clearCache() {
            this._getNameSpace();
            localStorage.removeItem(this.defaults.nameSpace);
        }
    }, {
        key: '_resolveChainItem',
        value: function _resolveChainItem() {
            /*
             * This function just returns the current settings item.
             * If we need any special cases this is where to resolve it.
             */
            var item = this.chain[this.chainIndex];
            if (typeof item === 'function') {
                var fnName = getFnName(item);
                // if item is an anonymous function reslove the results
                if (!fnName) {
                    return item();
                }
            }
            // here the item can be named function or a settings object. do nothing
            return item;
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
            var _this9 = this;

            options._type = 'modal';
            // unique id that the modal will create on the global
            options.uid = randomstring(9);
            this.chain.push(options);

            // if message is array. We have a carousel in the modal
            // So we generate functions in the chain for each slide
            if (options.message && isArray(options.message)) {
                var _loop = function _loop(i) {
                    _this9.chain.push(function _carouselNext() {
                        window[options.uid].carousel.setSlide(i);
                    });
                };

                for (var i = 1; i < options.message.length; i++) {
                    _loop(i);
                }
            }
            return this;
        }
    }, {
        key: 'next',
        value: function next() {
            var item = this._resolveChainItem();

            if (this.chainIndex) {
                // Dont close the modal if we have a function
                if (typeof item !== 'function') {
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
            } else {
                this.quit();
            }
            return this;
        }
    }, {
        key: 'reset',
        value: function reset() {
            this.chainIndex = 0;
            return this;
        }
    }, {
        key: 'quit',
        value: function quit() {
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
            return this;
        }
    }, {
        key: 'call',
        value: function call(fn) {
            //TODO change to option type to keep consitant
            this.chain.push(function call() {
                fn();
            });

            return this;
        }
    }, {
        key: 'previous',
        value: function previous() {
            this.chainIndex--;
            this.chainIndex < 1 ? this.chainIndex = 0 : this.chainIndex--;
            this._callchain();
            this.onStep(this.chainIndex, this.completedSteps);
            return this;
        }
    }, {
        key: 'start',
        value: function start() {
            // get the unique name for this instance for cache
            this._getNameSpace();

            // fire the onStart event
            this.onStart();
            this.chainIndex = 0;
            this.next();
            return this;
        }
    }, {
        key: 'play',
        value: function play() {
            this._getNameSpace();
            this.onStart();
            this.next();
            return this;
        }
    }, {
        key: 'goto',
        value: function goto(index) {
            this.chainIndex = index - 1;
            return this;
        }
    }, {
        key: 'resume',
        value: function resume() {
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
    }]);

    return Showtime;
}();
return Showtime;
}));
