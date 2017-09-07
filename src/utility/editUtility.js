
let specific_symbol = "___";
import {getReferralInfo} from './facebookUtility.js';
import * as properties from '../properties';
import * as config from '../config'
import randomstring from 'randomstring';

export function deleteSpecificSymbol(str) {
    return str.replace(specific_symbol, "");
}
export function hasConfigVariable(text) {
    if (typeof text === "string") {
        if (text.includes(specific_symbol)) {
            return true;
        }
    }
    return false;
}
export function getConfigVariable(name, config) {
    name = deleteSpecificSymbol(name);
    if (config.hasOwnProperty(name)) {
        var value = config[name];
        return value;
    }
    return "";
}

export function InitStyleWithConfigVariable(values, configs) {
    var styles = Object.assign({}, values);
    Object.keys(styles).forEach(function (key) {
        var value = styles[key];
        if (hasConfigVariable(value)) {
            styles[key] = getConfigVariable(value, configs);
        }
    });
    return styles;
}
export function InitStyle(styles) {
    if (styles) {
        if (!styles.hasOwnProperty("letter-spacing")) {
            styles["letter-spacing"] = "2px";
        }
    }
}
export function processEvents(eventType, name, parameters, store) {
    var is_client_mode = store.state.client_mode;
    switch (name) {
        case "viewToggle":
            store.commit("processViewToggle", parameters);
            break;
        case "playSound":
            var audio = new Audio(parameters[0]);
            audio.play();
            break;
        case "openChat":
            if (is_client_mode) {
                var url = store.state.info.fb_chat_url;
                var open_type = parameters[0];
                var style = parameters[1];
                if (typeof style == "string" && !style.includes("left")) {
                    var left = screen.width - 500;
                    style = style + ",left=" + left.toString();
                }
                var ref = getReferralInfo(store.state.client, false, null);
                window.open(url + "?ref=" + ref, open_type, style);
            }
            break;
        case "openUrl":
            if (is_client_mode) {
                var url = parameters[0];
                var open_type = parameters[1];
                var style = parameters[2];
                if (typeof style == "string" && !style.includes("left")) {
                    var left = screen.width - 500;
                    style = style + ",left=" + left.toString();
                }
                window.open(url, open_type, style);
            }
            break;
        case "analytics":
            if (is_client_mode) {
                store.commit("setAnalythicsUrl", parameters);
            }
            break;
        case "store":
            var value = parameters[0];

            break;
    }
}
export function onDocumentExit(store) {
    // var behaviour = store.state.config.behaviour;
    // var is_client_mode = store.state.client_mode;
    // if (is_client_mode) {
    //     if (behaviour.hasOwnProperty("on_exit")) {
    //         var on_exit = behaviour.on_exit;
    //         Object.keys(on_exit).forEach(function (type) {
    //             var actions = on_exit[type];
    //             if (Array.isArray(actions)) {
    //                 for (var i = 0; i < actions.length; i++) {
    //                     var action = actions[i];
    //                     var action_objectarrays = Object.keys(action);
    //                     if (Array.isArray(action_objectarrays)) {
    //                         var action_type = action_objectarrays[0];
    //                         var action_parameters = action[action_type];
    //                         processEvents("mouseleave", action_type, action_parameters, store);
    //                     }
    //                 }
    //             }
    //         });
    //     }
    // }
}
export function expandWidget(flag, store) {
    var event = "";
    var behaviour = store.state.config.behaviour;
    var actions = {};
    if (flag) {
        event = "expanded";
        if (behaviour.hasOwnProperty("on_expand")) {
            actions = behaviour["on_expand"];
        }

    } else {
        event = "appeared";
        if (behaviour.hasOwnProperty("on_appear")) {
            actions = behaviour["on_appear"];
        }
    }
    if (Array.isArray(actions)) {
        for (var i = 0; i < actions.length; i++) {
            var action = actions[i];
            var action_objectarrays = Object.keys(action);
            if (Array.isArray(action_objectarrays)) {
                var action_type = action_objectarrays[0];
                var action_parameters = action[action_type];
                processEvents(event, action_type, action_parameters, store);
            }
        }
    }
}
export function getScriptSrc() {
    var scripts = document.getElementsByTagName('script');
    var index = scripts.length - 1;
    var myScript = scripts[index];
    return myScript.src;
}

export function getCodeNumber() {
    var src = getScriptSrc();
    var arrays = src.split("chat?code=");
    return arrays[1];
}
export function getScreenSize() {
    var screen = {};
    var w = window,
        d = document,
        e = d.documentElement,
        x = w.innerWidth || e.clientWidth,
        y = w.innerHeight || e.clientHeight;
    screen.width = x;
    screen.height = y;
    return screen;
}
export function getEmulatorSize() {
    var screen = { "width": 100, "height": 100 };
    var elements = document.getElementsByClassName("emulator_screen");
    if (elements.length >= 1) {
        screen.width = elements[0].offsetWidth;
        screen.height = elements[0].offsetHeight;
    }
    return screen;
}
export function getScaleForMobile(configWidth) {
    var screen = getScreenSize();
    /* TODO: Figure out Retina situation */
    var screenWidth = screen.width;
    if (screenWidth < configWidth) {
        var scaleValue = (screenWidth / screenWidth).toFixed(4);
        return scaleValue;
    }
    return 1;
}

export function isHighDensity(){
    return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3));
}


export function isRetina(){
    return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches)) || (window.devicePixelRatio && window.devicePixelRatio >= 2)) && /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
}

export function getScaleForPreview(screenWidth, configWidth) {
    var scaleValue = (screenWidth / configWidth).toFixed(4);
    return scaleValue;
}
export function addDashLine(element) {
    let dash = document.getElementById("modern_dashed_line");
    if (!dash) {
        dash = document.createElement('div');
        dash.style.cssText = "position:absolute; z-index:21474836461;pointer-events:none;";
        dash.setAttribute("id", "modern_dashed_line");
        dash.className = "modern_dashed_line";
        document.body.append(dash);
    }
    let coords = element.getBoundingClientRect();

    dash.style.left = (coords.left - 4) + "px";
    dash.style.top = (coords.top - 4) + "px";
    dash.style.width = (coords.width + 6) + "px";
    dash.style.height = (coords.height + 6) + "px";

}
function moveBubble(element) {
    let bubble = document.getElementById("bubble_notification");
    if (bubble) {
        if (typeof element != "undefined") {
            let coords = element.getBoundingClientRect();
            //Add logic to determine the side
            if ((window.innerWidth - coords.right) < window.innerWidth / 2) {
                //Display on left side ; right side bubble
                bubble.style.left = (coords.left - 125) + "px";
                bubble.style.top = ((coords.bottom + coords.top) / 2 - 15) + "px";
            }
            else {
                //Display on right side ; left side bubble
                bubble.style.left = (coords.right + 20) + "px";
                bubble.style.top = ((coords.bottom + coords.top) / 2 - 15) + "px";
            }
        }
    }
}
export function addBubble(element, type) {
    deleteBubble();
    let bubble = document.createElement('div');
    bubble.style.cssText = "position:absolute; z-index:21474836461";
    bubble.setAttribute("id", "bubble_notification");
    let bubble_con = document.createElement('div');
    if (type == "image") {
        bubble_con.innerHTML = "Change Image";
    } else if (type == "text") {
        bubble_con.innerHTML = "Edit Text";
    }
    if (typeof element != "undefined") {
        let coords = element.getBoundingClientRect();
        //Add logic to determine the side
        if ((window.innerWidth - coords.right) < window.innerWidth / 2) {
            //Display on left side ; right side bubble
            bubble.style.left = (coords.left - 125) + "px";
            bubble.style.top = ((coords.bottom + coords.top) / 2 - 15) + "px";
            bubble_con.className = "bubble_widget f-right";
        }
        else {
            //Display on right side ; left side bubble
            bubble.style.left = (coords.right + 20) + "px";
            bubble.style.top = ((coords.bottom + coords.top) / 2 - 15) + "px";
            bubble_con.className = "bubble_widget f-left";
        }

        bubble.appendChild(bubble_con);
        document.body.append(bubble);
    }

}
export function addEditableHint(element) {
    let img = document.getElementById("editableHintImage");
    if (!img) {
        img = document.createElement('img');
        img.style.cssText = "position:absolute; z-index:21474836461";
        img.src = properties.editTextImageSrc;
        img.style.width = "25px";
        img.style.height = "25px";
        img.setAttribute("id", "editableHintImage");
        document.body.append(img);
    }
    if (typeof element != "undefined") {
        let coords = element.getBoundingClientRect();
        img.style.left = (coords.right - 4) + "px";
        img.style.top = (coords.top - 8) + "px";
    }
}
export function elementMouseUp(event) {
    event.stopImmediatePropagation();
    var element = document.getElementById("modern_dragabble_object");
    if (element) {
        element.setAttribute("id", "");
    }
    window.removeEventListener('mousemove', elementMouseMove, true);
}
export function elementMouseDown(element, type) {
    element.setAttribute("id", "modern_dragabble_object");
    element.setAttribute("w_type", type);
    // document.addEventListener('dragend', function (event) {
    //     interact(event.target).addEventListener('click', function (_event) {
    //         _event.stopImmediatePropagation();
    //     }, false);
    // });
    window.addEventListener('mousemove', elementMouseMove, true);
}
function elementMouseMove(event) {
    var element = document.getElementById("modern_dragabble_object");
    var type = element.getAttribute("w_type");
    var position = element.style.position;
    if (position == "absolute") {
        element.style.top = (element.offsetTop + event.movementY) + "px";
        element.style.left = (element.offsetLeft + event.movementX) + "px";
    } else {
        var left = 0;
        var top = 0;
        if (element.style.left) {
            left = parseInt(element.style.left.replace("px", ""));
        }
        if (element.style.top) {
            top = parseInt(element.style.top.replace("px", ""));
        }
        element.style.top = (top + event.movementY) + "px";
        element.style.left = (left + event.movementX) + "px";
    }
    addDashLine(element);
    if (type == "image") {
        moveBubble(element);
    } else if (type == "text") {
        addEditableHint(element);
    }
}
function elementResizeMouseMove(event) {
    var element = document.getElementById("modern_dragabble_object");
    var type = element.getAttribute("w_type");
    var position = element.style.position;
    if (position == "absolute") {
        element.style.width = (event.clientX - element.offsetLeft) + "px";
        element.style.height = (event.clientY - element.offsetTop) + "px";
    } else {
        element.style.width = (element.offsetWidth + event.movementY) + "px";
        element.style.height = (element.offsetHeight + event.movementX) + "px";
    }
}
export function elementResizeMouseDown() {
    window.removeEventListener('mousemove', elementMouseMove, true);
    window.addEventListener('mousemove', elementResizeMouseMove, true);
}
export function elementResizeMouseUp() {
    //event.stopImmediatePropagation();
    // var element = document.getElementById("modern_dragabble_object");
    // if (element) {
    //     element.setAttribute("id", "");
    // }
    window.removeEventListener('mousemove', elementResizeMouseMove, false);
    window.removeEventListener('mouseup', elementResizeMouseUp, false);
}
export function showResizeMode(element) {
    element.setAttribute("id", "modern_dragabble_object");
    addDashLine(element);
    let dash = document.getElementById("modern_dashed_line");
    let transform_scaleML = document.createElement("div");
    transform_scaleML.className = "transform_scaleML resize_transform_scale";
    let transform_scaleMR = document.createElement("div");
    transform_scaleMR.className = "transform_scaleMR resize_transform_scale";
    let transform_scaleTL = document.createElement("div");
    transform_scaleTL.className = "transform_scaleTL resize_transform_scale";
    let transform_scaleTC = document.createElement("div");
    transform_scaleTC.className = "transform_scaleTC resize_transform_scale";
    let transform_scaleTR = document.createElement("div");
    transform_scaleTR.className = "transform_scaleTR resize_transform_scale";
    let transform_scaleBL = document.createElement("div");
    transform_scaleBL.className = "transform_scaleBL resize_transform_scale";
    let transform_scaleBC = document.createElement("div");
    transform_scaleBC.className = "transform_scaleBC resize_transform_scale";
    let transform_scaleBR = document.createElement("div");
    transform_scaleBR.className = "transform_scaleBR resize_transform_scale";
    dash.append(transform_scaleML);
    dash.append(transform_scaleMR);
    dash.append(transform_scaleTL);
    dash.append(transform_scaleTC);
    dash.append(transform_scaleTR);
    dash.append(transform_scaleBL);
    dash.append(transform_scaleBC);
    dash.append(transform_scaleBR);
    console.log(1)
    // for (var i = 0; i < dash.childNodes.length; i++) {
    //     var child = dash.childNodes[i];
    //     child.addEventListener('mousedown', elementResizeMouseDown, false);
    //     child.addEventListener('mouseup', elementResizeMouseUp, false);
    // }
}
export function deleteBubble() {
    var bubble_widget = document.getElementById("bubble_notification");
    if (bubble_widget) {
        document.body.removeChild(bubble_widget);
    }
}
export function deleteEditableHint() {
    var hint_image = document.getElementById("editableHintImage");
    if (hint_image) {
        document.body.removeChild(hint_image);
    }
}
export function deleteDashLine() {
    var dash_el = document.getElementById("modern_dashed_line");
    if (dash_el) {
        document.body.removeChild(dash_el);
    }

}
export function removePositionInfo(styles) {
    let resize_styles = {};
    Object.keys(styles).forEach(function (key) {
        if (!config.positionArray.includes(key) && !key.includes("margin")) {
            resize_styles[key] = styles[key];
        }
    });
    return resize_styles;
}

export function removeScaleValue(transform) {
    var index = transform.indexOf('scale(');
    var endindex = transform.indexOf(")", index);
    let new_transform = transform.substring(0, index) + transform.substring(endindex + 1);
    return new_transform;
}

export function getAnimationClass(elements) {
    if (elements.hasOwnProperty("body")) {
        var body = elements.body;
        if (body.hasOwnProperty("class")) {
            return elements.body.class;
        }
        return "";
    }
    return "";
}

export function getDisplayInfo(styles) {
    let display_styles = {};
    Object.keys(styles).forEach(function (key) {
        if (key == "display" || key == "animation-iteration-count" || key.includes("margin") || key.includes("max") || key.includes("min")) {
            display_styles[key] = styles[key];
        }
    });
    return display_styles;
}

export function getEnabledHandles(type,client_mode,elements ) {
    if (client_mode) {
        return [];
    }
    if (elements.hasOwnProperty('disableControl')) {
        var disableControl = elements['disableControl'];
        if (disableControl.includes("resize-width") && disableControl.includes("resize-height")) {
            return [];
        }
        if (disableControl.includes("resize-width")) {
            if(type=="text" || type=="button") {
                return [];
            }
            return ['tm', 'bm'];
        }
        if (disableControl.includes("resize-height")) {
            return ['ml', 'mr'];
        }
    }
    if(type=="text" || type=="button") {
        return ['ml', 'mr'];
    }
    return ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'];
}
export function generateUniqueId() {
    var random_str = randomstring.generate(8);
    return random_str;
}
export function generateElement(type, elements) {
    let element = {};
    var timeStamp = generateUniqueId();
    element.type = type;
    element.action = {};
    element.action["click"] = [];
    element.body = {};
    element.styles = generateStyle(type, elements);
    if (type == "image") {
        element.body["src"] = properties.uploadImageSrc;
    } else if (type == "text" || type == "button") {
        element.text = "input text!";
    }
    element.id = type + timeStamp;
    return element;
}

function generateStyle(type, elements) {
    let style = {};
    style["width"] = "80px";
    style["position"] = "absolute";
    style["left"] = "0px";
    style["top"] = "0px";
    style["transform"] = "rotate(0deg)";
    style["border"] = "0px solid #000000";
    style["box-shadow"] = "0px 0px 0px 0px #000000";
    if (type == "button" || type == "text") {
        style["height"] = "30px";
        style["padding"] = "10px";
        style["text-align"] = "left";
        style["letter-spacing"] = "0px";
        style["font-size"] = "12px";
        style["font-weight"] = "300";
        style["line-height"] = "1em";
        style["text-decoration"] = "none";
    } else {
        style["padding"] = "0px";
        style["height"] = "80px";
    }
    if (type == "button" || type == "bg") {
        style["background-color"] = "#4690f7";
    }
    style["color"] = "#000000";
    style["opacity"] = "1";
    style["border-radius"] = "0px 0px 0px 0px";
    let zIndex = 1000 + elements.length;
    style["z-index"] = zIndex.toString();
    return style;
}
