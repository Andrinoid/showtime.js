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

    .to_left,
    .to_right,
    .to_top,
    .to_bottom {
        position: fixed;
        background: black;
        opacity: .5;
        filter: alpha(opacity=50);
        z-index: 1000;
    }

    .ghost-focus {
        background: transparent;
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
             </div>`,
                title: '',
                content: '',
                delay: 0,
                placement: 'top',//top, left, right, bottom
                offset: '0 0',
                collision: 'fit',//TODO RIGHT BOTTOM
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

            if (!this.default.content) {
                throw new Error('Tooltip has no content');
            }
            if (this.default.title) {
                title.innerText = this.default.title;
            }
            else {
                title.style.display = 'none';
            }

            inner.innerHTML = this.default.content;
            this.popover = div.children[0];

        }

        setDirection() {
            setClass(this.popover, this.default.placement);
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
                top = elDim.top - popDim.height + offset.y;
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
                top = elDim.top + (elDim.height / 2) - (popDim.height / 2) + offset.y;
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
                top = elDim.top + (elDim.height / 2) - (popDim.height / 2) + offset.y;
                left = elDim.left + elDim.width + offset.x;
                if (this.default.collision === 'fit' && (left + popDim.width) > bodyDim.width) {
                    left = bodyDim.width - popDim.width;
                }
            }
            if (placement === 'bottom') {
                top = elDim.top + elDim.height + offset.y;
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
    window.Tooltip = Tooltip;//////////////////////////////////////////////Má ekki

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
                padding: 10
            };
            this.default = extend(this.default, config);
            this.buildDom();

            this.animator = new Animator(this.focusBox.middle, {
                effect: 'easeOut',
                duration: 60000
            });
            this.animator.complete = ()=> {
                this.complete();
            }

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

            this.animator.start({
                width: styles.width,
                height: styles.height,
                left: styles.left,
                top: styles.top
            });
            this.animator.step = (el)=> {
                this.setCoverPos(el);
            }
        }

        setCoverPos(el) {
            let dimentions = this.focusBox.middle.getBoundingClientRect();

            setStyles(this.focusBox.top, {
                top: 0,
                left: 0,
                right: 0,
                height: dimentions.top - this.default.padding + 'px'
            });
            setStyles(this.focusBox.bottom, {
                top: dimentions.top + dimentions.height + this.default.padding + 'px',
                bottom: 0,
                left: dimentions.left - this.default.padding + 'px',
                width: dimentions.width + (this.default.padding * 2) + 'px'
            });
            setStyles(this.focusBox.right, {
                top: dimentions.top - this.default.padding + 'px',
                bottom: 0,
                right: 0,
                left: dimentions.left + dimentions.width + this.default.padding + 'px',
            });
            setStyles(this.focusBox.left, {
                top: dimentions.top - this.default.padding + 'px',
                bottom: 0,
                left: 0,
                width: dimentions.left - this.default.padding + 'px'
            });
        }

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
    function typeOf(item) {
        'use strict';
        if (item === null) {
            return 'null';
        }
        if (typeof(item) === 'string')
            return 'string';
        if (item.nodeName) {
            if (item.nodeType === 1) {
                return 'element';
            }
            if (item.nodeType === 3) {
                return (/\S/).test(item.nodeValue) ? 'textnode' : 'whitespace';
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
            this.onComplete = options['onComplete'] || function () {
                };
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
            this.collection = extend(this.collection, provides);
        };

        ChainWork.prototype._applySettings = function () {
            //this method might have a problem because it overrides the component settings so it doesn't have the same init settings for next run
            var obj = this.getChainProperty('settings');
            var settings = {};
            for (let key in obj) {
                if (!obj.hasOwnProperty(key)) {
                    continue;
                }
                let value = obj[key];

                //reveal functions values. this allows the chain to give settings as function to reveal values on chain runtime instead of being collected as static values onLoad
                if (typeOf(value) === 'function') {
                    //dont reveal function that start with on or call.
                    if (key.slice(0, 2) === 'on' || key.slice(0, 4) === 'call')
                        settings[key] = value;
                    else
                        settings[key] = value();
                }
                else {
                    settings[key] = value;
                }
            }

            var compontentSettings = this.getComponentProperty('settings');
            //##
            //##
            //TODO Finna lausn til að grípa alltaf í clone-að version af settings
            //##
            //##
            compontentSettings = extend(compontentSettings, settings);
        };

        //ChainWork.prototype._checkForDependancies = function () {
        //    var self = this;
        //    var dependancies = this.getComponentProperty('dependsOn');
        //    if (!dependancies) return false;
        //    var errorList = _.map(dependancies, function (item) {
        //        if (self.stamps.indexOf(item) === -1) {
        //            return item;
        //        }
        //    });
        //    if (errorList[0])
        //        return errorList;
        //    return false;
        //};

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
                }
                catch (err) {
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
                    throw 'Chainwork is running an unexpected loop and was stoped after 50 cycles'
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
            //var depsErrorList = this._checkForDependancies();//////////////////////////////remove
            //if (depsErrorList.length) {
            //    if (this.debug)
            //        console.warn(this.chain[this.index].componentName, 'might be missing dependancy, please add them before. Missing:' + depsErrorList.toString());
            //}
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
            //var component = _.cloneDeep(components[componentRef.componentName]);
            var component = clone(components[componentRef.componentName]);
            //apply settings
            //var refSettings = componentRef.settings;


            var refSettings = _.mapValues(componentRef.settings, function (value, key) {
                //dont reveal function that start with on or call.
                if (key.slice(0, 2) === 'on' || key.slice(0, 4) === 'call')
                    return value;
                //reveal functions values. this allows the chain to give settings as function to reveal values on chain runtime insted of being collected as static values onLoad
                if (typeOf(value) === 'function')
                    return value();
                return value;
            });
            var compontentSettings = component['settings'];


            //_.assign(compontentSettings, refSettings);
            compontentSettings = extend(compontentSettings, refSettings);


            //set parent property to component. We dont want the parallel components to affect the rest of the chain so the get a fake parent
            var fakeParent = {
                componentDone: function () {
                    onDone();
                    self.extendGlobal();//DEPRICATED
                    //We should collect componentDone calls to know when the par component is done and user could set it to whait for it
                    //we must know how many par component is in the collection maybe we can do it in the component
                },
                caller: 'chain',//?
                stop: self.stop,
                debug: self.debug,

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
                self.extendGlobal();//DEPRICATED
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
                }
            }
            else {
                component = args[0];
            }
            //cloneOrginal settings
            components[component.componentName]['orginalSettings'] = 'hello';

            try {
                //inject chain as parent to access in init functions
                components[component.componentName]['parent'] = this;
                components[component.componentName]['init'](component);
            }
            catch (err) {
                //pass
            }
            return component;
        };

        ChainWork.prototype.add = function (name, settings, isParallel) {
            if (typeof(arguments[0]) === 'function') {
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
            if (typeof(arguments[0]) === 'function') {
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

            if (typeof(arguments[0]) === 'function') {
                //if first argument is a function we port that function in a call component with the injection type
                //call generates the call component and call this function back
                this.call(arguments[0], 'par');
                return this;
            }

            var component = this._add(arguments);
            if (!this.activeParallel) {
                this.activeParallel = this._newParCollector();

                this.add('parallel', {uid: this.activeParallel}, true);
            }
            this.parallels[this.activeParallel].push(component);
            return this;
        };

        ChainWork.prototype.call = function (fn, injectType) {
            var injectType = injectType || 'add';
            var componentName;
            //_.includes(fn.toString(), 'sync') ? componentName = 'callSync' : componentName = 'callAsync';
            fn.toString().indexOf('sync') > -1 ? componentName = 'callSync' : componentName = 'callAsync';
            this[injectType]({// injectType can be add, once, par
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
                }
                var link = new ChainWork();
                link.add(component);
                link.play();
            }
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
            job: function () {
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
            job: function () {
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
            job: function () {
                var self = this;
                //If provided function has name extend it to this component name for debug and clarity
                this.name = this.settings.call.name ? 'callSync-' + this.settings.call.name : 'callAsync';
                var onComplete = function () {
                    self.parent.componentDone();
                };
                this.settings.call(onComplete);
            }
        },

        /*
         * This component is wierd for a good reason.
         * Pause stops the chain and removes it °self from the chain. So next component has a trusted event if needed e.g window popup
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
            job: function () {
                var self = this;
                this.parent.stop();
                this.parent.cache = clone(this.parent.chain[this.parent.index]);
                setTimeout(function () {
                    self.parent.chain.splice(self.parent.index, 1);
                });
                if (this.settings.delay) {
                    setTimeout(function () {
                        self.parent.play('chain');
                    }, this.settings.delay);
                }
            },
            assignToNext: function () {
                this.index++;
                this.injectBefore(this.cache);
            }
        },

        reset: {
            name: 'reset',
            settings: {
                index: 0
            },
            job: function () {
                this.parent.isAbort = true;
                this.parent.collection = {};
                this.parent.stamps.length = this.settings.index;
                this.parent.index = this.settings.index;

            }
        }
    };

    window.mainfocus = new Focus();
    components.showtime = {
        name: 'showtime',
        settings: {
            element: null,
            padding: 10,
            clickThrough: true,//TODO
            title: '',
            placement: 'right',
            focus: null,
            content: ''
        },

        resolveOffsets: function () {
            if (this.settings.placement === 'right') {
                return this.settings.padding + ' 0';
            }
            if (this.settings.placement === 'left') {
                return -this.settings.padding + ' 0';
            }
            if (this.settings.placement === 'top') {
                return '0 ' + -this.settings.padding;
            }
            if (this.settings.placement === 'bottom') {
                return '0 ' + this.settings.padding;
            }
        },

        job: function () {
            //remove last tooltip
            try {
                this.parent.tooltip.remove();
            } catch (err) {
                //tooltip does not excist
            }
            let tooltip = this.parent.tooltip = new Tooltip(this.settings.element, {
                content: this.settings.content,
                title: this.settings.title,
                placement: this.settings.placement,
                offset: this.resolveOffsets()
            });


            mainfocus.focusOn(this.settings.element);
            mainfocus.complete = function () {
                tooltip.show();
            };
            this.parent.componentDone();

        }
    };


    /**
     * ------------------------------------------------------------------------
     * Tour / Showtime
     * This class ties it all together
     * ------------------------------------------------------------------------
     */


    class showtime {

        constructor() {
            this.chain = [];
            this.chainIndex = 0;
            this.focus = new Focus();
        }


        _callchain() {
            let settings = this.chain[this.chainIndex];

            //remove last tooltip
            try {
                this.tooltip.remove();
            } catch (err) {
                //tooltip does not excist
            }
            //let tooltip = this.tooltip = new Tooltip(settings.element, {
            //    content: settings.content,
            //    title: settings.title,
            //    placement: settings.placement,
            //    offset: this._resolveOffsets(settings)
            //});
            //tooltip.show();
            this.tooltip = new Tooltip(settings.element, {
                title: settings.title,
                content: settings.content,
                placement: settings.placement,//top, left, right, bottom
            });

            this.focus.focusOn(settings.element);
            this.focus.complete = ()=> {
                this.tooltip.show();

            };

            this.chainIndex++;
        }

        _resolveOffsets(settings) {
            if (settings.placement === 'right') {
                return settings.padding + ' 0';
            }
            if (settings.placement === 'left') {
                return -settings.padding + ' 0';
            }
            if (settings.placement === 'top') {
                return '0 ' + -settings.padding;
            }
            if (settings.placement === 'bottom') {
                return '0 ' + settings.padding;
            }
        }


        show(options) {
            this.chain.push(options);
            return this;
        }

        play() {
            this._callchain();
        }

        start() {

        }

    }


    return showtime;


}));
