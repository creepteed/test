<template>
  <div class="vdr" :class="{ draggable: draggable, resizable: resizable, active: active }" v-bind:style="style">
    <div v-if="!client_mode" v-bind:style="getTransForm()" class="control-border">
      <div v-if="rotatable" class="transform_rotate" :style="{ display: active ? 'block' : 'none'}"
           @mousedown.stop.prevent="rotateDown($event)"></div>
      <div v-if="resizable || draggable || rotatable" class="vdr_outer"
           :style="{ display: active ? 'block' : 'none'}"></div>
      <div class="handle" v-if="resizable" v-for="handle in handles" :class="'handle-' + handle"
           :style="{ display: active ? 'block' : 'none'}"
           @mousedown.stop.prevent="handleDown(handle, $event)"></div>
    </div>
    <slot></slot>
  </div>
</template>
<script>

  import {mapGetters, mapState} from 'vuex';
  import {getRotateString, getRotateValue, describeChangedScreenValue} from '../utility/parseUtility.js';
  import {getScaleForMobile, getScaleForPreview, removeScaleValue} from '../utility/editUtility.js';

  export default {
    replace: true,
    name: 'vue-draggable-resizable',
    props: {
      draggable: {
        type: Boolean, default: true
      },
      resizable: {
        type: Boolean, default: true
      },
      rotatable: {
        type: Boolean, default: true
      },
      w: {
        type: Number,
        default: 200,
        validator: function (val) {
          return val > 0
        }
      },
      h: {
        type: Number,
        default: 200,
        validator: function (val) {
          return val > 0
        }
      },
      minw: {
        type: Number,
        default: 30,
        validator: function (val) {
          return val > 0
        }
      },
      minh: {
        type: Number,
        default: 10,
        validator: function (val) {
          return val > 0
        }
      },
      x: {
        type: Number,
        default: 0
      },
      y: {
        type: Number,
        default: 0
      },
      pos: {
        type: String,
        default: 'absolute'
      },
      hdirect: {
        type: String,
        default: 'left'
      },
      vdirect: {
        type: String,
        default: 'top'
      },
      handles: {
        type: Array,
        default: function () {
          return ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml']
        }
      },
      axis: {
        type: String,
        default: 'both',
        validator: function (val) {
          return ['x', 'y', 'both'].indexOf(val) !== -1
        }
      },
      type: {
        type: String,
        default: 'text_widget'
      },
      textcontent: {
        type: String,
        default: ''
      },
      grid: {
        type: Array,
        default: function () {
          return [1, 1]
        }
      },
      parent: {
        type: Boolean, default: false
      },
      elements: {},
      parentElements: {}
    },
    created: function () {
      this.parentX = 0
      this.parentW = 9999
      this.parentY = 0
      this.parentH = 9999
      this.mouseX = 0
      this.mouseY = 0
      this.lastMouseX = 0
      this.lastMouseY = 0
      this.mouseOffX = 0
      this.mouseOffY = 0
      this.elmX = 0
      this.elmY = 0
      this.elmW = 0
      this.elmH = 0
    },
    mounted: function () {
      if (this.resizable || this.draggable || this.rotatable) {
        if (this.minw > this.w) this.width = this.minw
        if (this.minh > this.h) this.height = this.minh
        if (this.parent) {
          const style = window.getComputedStyle(this.$el.parentNode, null)
          const parentW = parseInt(style.getPropertyValue('width'), 10)
          const parentH = parseInt(style.getPropertyValue('height'), 10)
          this.parentW = parentW
          this.parentH = parentH
          if (this.w > this.parentW) this.width = parentW
          if (this.h > this.parentH) this.height = parentH
          if ((this.x + this.w) > this.parentW) this.width = parentW - this.x
          if ((this.y + this.h) > this.parentH) this.height = parentH - this.y
        }
        this.$emit('resizing', this.xPoint, this.yPoint, this.width, this.height);
      }
      this.$nextTick(function () {
        if (this.show_controls) {
          document.documentElement.addEventListener('mousemove', this.handleMove, true)
          document.documentElement.addEventListener('mousedown', this.deselect, true)
          document.documentElement.addEventListener('mouseup', this.handleUp, true)
          window.addEventListener('keydown', this.handleKeyPress, true)
          window.addEventListener('keyup', this.handleKeyUp, true)
          var t_el = this.$slots.default[0].elm;
          t_el.addEventListener("mousedown", this.elmDown, false);
        }
        this.setScaleValue();
        this.getRotateValue();
      });
    },
    beforeDestroy: function () {
      if (this.show_controls) {
        document.documentElement.removeEventListener('mousemove', this.handleMove, true)
        document.documentElement.removeEventListener('mousedown', this.deselect, true)
        document.documentElement.removeEventListener('mouseup', this.handleUp, true)
        window.removeEventListener('keydown', this.handleKeyPress, true)
        window.removeEventListener('keyup', this.handleKeyUp, true)
      }
      let transform = this.elements.styles['transform'];
      if (transform && transform.includes("scale(")) {
        this.elements.styles['transform'] = removeScaleValue(transform);
      }
    },
    updated: function () {
      if (!this.resizing && !this.dragging) {
        if (this.type == "text_widget" || this.type == "button_widget") {
          if (Array.isArray(this.$slots.default) || this.$slots.default.length > 0) {
            var t_el = this.$slots.default[0].elm;
            if (t_el) {
              this.slotHeight = t_el.offsetHeight;
            }
          }
        }
      }
    },
    data: function () {
      return {
        yPoint: this.y,
        xPoint: this.x,
        width: this.w,
        height: this.h,
        hdirection: this.hdirect,
        vdirection: this.vdirect,
        transform: 0,
        slotHeight: 0,
        resizing: false,
        rotating: false,
        dragging: false,
        active: false,
        autoScale: false,
        opacity: 1,
        handle: null,
        zIndex: -1,
        position: this.pos,
        prevStyle: {},
        prevRotate: 0,
        prevData: {},
        prevElement: ""
      }
    },
    watch: {
      'active': function () {
        if (!this.active) {
          this.$store.commit("setSettingInfo", null);
        }
      },
      'w': function () {
        this.width = this.w;
      },
      'h': function () {
        this.height = this.h;
      },
      'x': function () {
        this.xPoint = this.x;
      },
      'y': function () {
        this.yPoint = this.y;
      },
      'hdirect': function () {
        this.hdirection = this.hdirect;
      },
      'vdirect': function () {
        this.vdirection = this.vdirect;
      },
      'width': function () {
        if (!this.screenValueInWidth()) {
          this.elements.styles['width'] = this.width + 'px';
        }
      },
      'height': function () {
        if (!this.screenValueInHeight()) {
          this.elements.styles['height'] = this.height + 'px';
        }
      },
      'pos': function () {
        this.position = this.pos;
      },
      'xPoint': function () {
        if (this.hdirection == "left") {
          if (!this.screenValueInPosition("left")) {
            this.elements.styles['left'] = this.xPoint + 'px';
          }
        } else {
          if (!this.screenValueInPosition("right")) {
            this.elements.styles['right'] = this.xPoint + 'px';
          }
        }
      },
      'yPoint': function () {
        if (this.vdirection == "top") {
          if (!this.screenValueInPosition("top")) {
            this.elements.styles['top'] = this.yPoint + 'px';
          }
        } else {
          if (!this.screenValueInPosition("bottom")) {
            this.elements.styles['bottom'] = this.yPoint + 'px';
          }
        }
      },
      'transform': function () {
        let transform = this.elements.styles['transform'];
        if (transform) {
          if (transform.includes("rotate")) {
            let rotate_string = getRotateString(transform);
            this.elements.styles['transform'] = transform.replace(rotate_string, 'rotate(' + this.transform + 'deg)');
          } else {
            this.elements.styles['transform'] += ' rotate(' + this.transform + 'deg)';
          }
        } else {
          this.elements.styles['transform'] = "rotate(0deg)";
        }
      },
      'slotHeight': function () {
        if (this.getChangableTextHeight() != -1) {
          this.height = this.getChangableTextHeight();
          this.$emit('resizing', this.xPoint, this.yPoint, this.width, this.height);
        }
      },
      'elements': function () {

      },
      'parentElements': function () {

      }
    },
    methods: {
      getTransForm() {
        var style = {};
        var transform = this.elements.styles['transform'];
        if (transform.includes("rotate")) {
          let rotate_string = getRotateString(transform);
          style["transform"] = transform.replace(rotate_string, 'rotate(' + this.transform + 'deg)');
        } else {
          style["transform"] = "rotate(" + this.transform + "deg)";
        }
        if (transform.includes("scale(")) {
          style["transform-origin"] = this.currentCornerPosition;
        }
        return style;
      },
      getRotateValue() {
        let transform = this.elements.styles['transform'];
        if (transform) {
          if (transform.includes("rotate")) {
            this.transform = getRotateValue(transform);
          }
        }
      },
      //This is for elements that contains text
      getChangableTextHeight() {
        var elmH = -1;
        var padding_top = parseInt(this.$el.style.paddingTop);
        var padding_bottom = parseInt(this.$el.style.paddingBottom);
        if (!padding_top) {
          padding_top = 0;
        }
        if (!padding_bottom) {
          padding_bottom = 0;
        }
        var t_el = this.$slots.default[0].elm;

        if (t_el) {
          elmH = t_el.offsetHeight + padding_top + padding_bottom;
        }
        return elmH;
      },
      changeWidth: function (width) {
        this.w = width;
      },
      changeHeight: function (height) {
        this.h = height;
      },
      setCustomizePopup: function () {
        let popupInfo = {};
        popupInfo.el = this;
        popupInfo.type = this.type;
        popupInfo.element = this.elements;
        popupInfo.parentElements = this.parentElements;
        var t_el = this.$slots.default[0].elm;
        popupInfo.childEl = t_el;
        if (this.type == "wrapper_widget") {
          this.$store.commit("setLayerInfo", this.elements);
        } else {
          this.$store.commit("setLayerInfo", this.parentElements);
        }
        this.$store.commit("setSettingInfo", popupInfo);
      },
      setPreviousUndoData(type) {
        if (this.type != "wrapper_widget") {
          this.prevData = {};
          this.prevData["parent_id"] = this.parentElements.id;
          this.prevData["data"] = JSON.parse(this.prevElement);
          this.prevData["type"] = type;
          this.prevData["el"] = this;
          this.$store.commit('saveUndoData', this.prevData);
        }
      },
      setElmPosition() {
        if (this.hdirection == "left") {
          this.elmX = parseInt(this.style.left)
        } else {
          this.elmX = parseInt(this.style.right)
        }
        if (this.vdirection == "top") {
          this.elmY = parseInt(this.style.top)
        } else {
          this.elmY = parseInt(this.style.bottom)
        }
        this.elmW = this.$el.offsetWidth || this.$el.clientWidth
        this.elmH = this.$el.offsetHeight || this.$el.clientHeight
      },
      setScaleValue() {
        if (this.client_mode && this.isMobileDevice) {
          var scale = 1;
          let transform = this.elements.styles['transform'];
          scale = getScaleForMobile(this.scaleForMobile);
          if (scale != 1) {
            let scalestr = "scale" + "(" + scale + ")";
            if (this.type == "wrapper_widget") {
              if (transform) {
                if (transform.includes("scale(")) {

                } else {
                  this.elements.styles['transform'] = this.elements.styles['transform'] + " " + scalestr;
                }
              } else {
                this.elements.styles['transform'] = "rotate(0deg) " + scalestr;
              }
              this.elements.styles["transform-origin"] = this.currentCornerPosition;
            }
          }
        }
      },
      setChangeValueForScreenWidth: function (value) {
        if (this.screenValueInWidth()) {
          this.elements.styles['width'] = describeChangedScreenValue(this.elements.styles['width'], value);
        }
      },
      setChangeValueForScreenHeight: function (value) {
        if (this.screenValueInHeight()) {
          this.elements.styles['height'] = describeChangedScreenValue(this.elements.styles['height'], value);
        }
      },
      setChangeValueForScreenPosition: function (direct, value) {
        if (this.screenValueInPosition(direct)) {
          this.elements.styles[direct] = describeChangedScreenValue(this.elements.styles[direct], value);
          console.log(this.elements.styles[direct]);
        }
      },
      screenValueInWidth: function () {
        if (this.elements.styles["width"].includes("screen")) {
          return true;
        }
        return false;
      },
      screenValueInHeight: function () {
        if (this.elements.styles["height"].includes("screen")) {
          return true;
        }
        return false;
      },
      screenValueInPosition: function (direct) {
        if (this.elements.styles[direct].includes("screen")) {
          return true;
        }
        return false;
      },
      getPathArray: function (e) {
        var path = [];
        var node = e.target;
        while (node != document.body) {
          if (!node) {
            return;
          }
          path.push(node);
          node = node.parentNode;
        }
        return path;
      },
      elmDown: function (e) {
        if (e.stopPropagation) e.stopPropagation()
        if (!this.client_mode) {
          if (this.type == "text_widget" || this.type == "button_widget") {
            this.$emit("textClicked");
          }
          this.setCustomizePopup();
          if (this.resizable || this.draggable || this.rotatable) {
            if (!this.active) {
              //this.zIndex += 1
              this.active = true
              this.$emit('activated')
            }
            if (this.draggable) {
              //this.opacity = 0.6
              this.dragging = true
            }

            this.setElmPosition();
          }
          if (this.active) {
            this.prevStyle = Object.assign({}, this.style);
            this.prevElement = JSON.stringify(this.elements);
          }
        }
      },
      deselect: function (e) {
        if (!this.client_mode) {
          var pathArray = e.path;
          if (typeof pathArray == "undefined") {
            pathArray = this.getPathArray(e);
          }
          let target = e.target || e.srcElement
          let regex = new RegExp('handle-([trmbl]{2})', '')

          var t_el = this.$slots.default[0].elm;
          if ((target !== t_el) && (!(regex.test(target.className)) && !(target.className == 'transform_rotate'))) {
            if (pathArray) {
              for (var i = 0; i < pathArray.length; i++) {
                if (pathArray[i].className) {
                  var className = pathArray[i].className;
                  if (className == "setting_panel" || className == "add-element") {
                    return;
                  }
                }
              }
            }
            this.active = false
            this.$emit('deactivated', this.style);
          }
        }
      },
      handleDown: function (handle, e) {
        this.handle = handle
        if (e.stopPropagation) e.stopPropagation()
        if (e.preventDefault) e.preventDefault()
        this.resizing = true
        this.setElmPosition();
        if (this.active) {
          this.prevStyle = Object.assign({}, this.style);
        }
      },
      rotateDown: function (e) {
        if (e.stopPropagation) e.stopPropagation()
        if (e.preventDefault) e.preventDefault()
        this.rotating = true
        if (this.active) {
          this.prevRotate = this.transform;
        }
      },
      maximize: function (e) {
        if (!this.parent || !this.resizable) return
        let done = false
        const animate = () => {
          if (!done) {
            window.requestAnimationFrame(animate)
          }
          if (
            this.width === this.parentW &&
            this.height === this.parentH &&
            this.yPoint === this.parentY &&
            this.xPoint === this.parentX
          ) done = true
          if (this.width < this.parentW) {
            this.width++
            this.elmW++
          }
          if (this.height < this.parentH) {
            this.height++
            this.elmH++
          }
          if (this.xPoint > this.parentX) {
            this.xPoint--
            this.elmX--
          }
          if (this.yPoint > this.parentY) {
            this.yPoint--
            this.elmY--
          }
          this.$emit('resizing', this.xPoint, this.yPoint, this.width, this.height)
        }
        window.requestAnimationFrame(animate)
      },
      handleMove: function (e) {
        //if (e.preventDefault) e.preventDefault()
        if (!this.client_mode) {

          this.mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft
          this.mouseY = e.pageY || e.clientY + document.documentElement.scrollTop
          let diffX = this.mouseX - this.lastMouseX + this.mouseOffX
          let diffY = this.mouseY - this.lastMouseY + this.mouseOffY
          this.mouseOffX = this.mouseOffY = 0
          this.lastMouseX = this.mouseX
          this.lastMouseY = this.mouseY
          let dX = diffX
          let dY = diffY
          if (this.resizing) {
            if (this.autoScale) {
              let ratio = this.elmW / this.elmH;
              if (this.handle.indexOf('t') >= 0) {
                if(this.transform > 150 || this.transform < -150){
                  if (this.elmH + dY < this.minh) {
                    this.mouseOffY = (dY - (diffY = this.minh - this.elmH))
                  }
                  else if (this.elmY + this.elmH + dY > this.parentH) {
                    this.mouseOffY = (dY - (diffY = this.parentH - this.elmY - this.elmH))
                  }
                  if(this.handle.indexOf('tm') >= 0){
                    if(this.vdirection == "top"){
                      this.elmH += diffY

                    }else{
                      this.elmH += diffY
                      this.elmY += diffY
                    }
                  }else{
                    if (this.vdirection == "top" && this.handle.indexOf('tl') >= 0) {
                      if (ratio > 1) {
                        this.elmH += diffY
                        this.elmW += diffY * ratio
                      }
                      if (ratio < 1) {
                        this.elmH += diffY * ratio
                        this.elmW += diffY
                      }
                      if (ratio == 1) {
                        this.elmW = this.elmH -= diffY
                      }
                    }
                    else {
                      if (ratio > 1) {
                        this.elmH += diffY
                        this.elmW += diffY * ratio
                        this.elmX -= diffY * ratio
                      }
                      if (ratio < 1) {
                        this.elmH += diffY * ratio
                        this.elmW += diffY
                        this.elmX -= diffY
                      }
                      if (ratio == 1) {
                        this.elmW = this.elmH += diffY
                      }
                    }
                  }
                  this.setChangeValueForScreenHeight(diffY);
                }
                else{
                  if (this.elmH - dY < this.minh) {
                    this.mouseOffY = (dY - (diffY = this.elmH - this.minh))
                  }
                  else if (this.elmY + dY < this.parentY) { this.mouseOffY = (dY - (diffY = this.parentY - this.elmY)) }
                  if(this.handle.indexOf('tm') >= 0){
                    if(this.vdirection == "top"){
                      this.elmH -= diffY
                      this.elmY += diffY
                    }else{
                      this.elmH -= diffY
                    }
                  }
                  else{
                    if (this.vdirection == "top" && this.handle.indexOf('tl') >= 0) {
                      if (ratio > 1) {
                        this.elmH -= diffY
                        this.elmW -= diffY * ratio
                        this.elmY += diffY
                        this.elmX += diffY * ratio
                      }
                      if (ratio < 1) {
                        this.elmH -= diffY * ratio
                        this.elmW -= diffY
                        this.elmY += diffY * ratio
                        this.elmX += diffY
                      }
                      if (ratio == 1) {
                        this.elmW = this.elmH -= diffY
                        this.elmY += diffY
                        this.elmX += diffY
                      }
                      this.setChangeValueForScreenPosition("top", diffY);
                    } else {
                      if (ratio > 1) {
                        this.elmH -= diffY
                        this.elmW -= diffY * ratio
                      }
                      if (ratio < 1) {
                        this.elmH -= diffY * ratio
                        this.elmW -= diffY
                      }
                      if (ratio == 1) {
                        this.elmW = this.elmH -= diffY
                        this.elmY -= diffY
                      }
                      this.elmY += diffY
                      this.setChangeValueForScreenPosition("top", diffY);
                    }
                  }
                  this.setChangeValueForScreenHeight(-1 * diffY);
                }
              }
              if (this.handle.indexOf('b') >= 0) {
                if(this.transform > 150 || this.transform < -150){
                  if (this.elmH - dY < this.minh) {
                    this.mouseOffY = (dY - (diffY = this.elmH - this.minh))
                  }
                  else if (this.elmY + dY < this.parentY) { this.mouseOffY = (dY - (diffY = this.parentY - this.elmY)) }
                  if(this.handle.indexOf('bm') >= 0){
                    if(this.vdirection == "top"){
                      this.elmH -= diffY
                      this.elmY += diffY
                    }else{
                      this.elmH -= diffY
                    }
                  }
                  else{
                    if (this.vdirection == "top" && this.handle.indexOf('br') >= 0) {
                      if (ratio > 1) {
                        this.elmH -= diffY
                        this.elmW -= diffY * ratio
                        this.elmY += diffY
                        this.elmX += diffY * ratio
                      }
                      if (ratio < 1) {
                        this.elmH -= diffY * ratio
                        this.elmW -= diffY
                        this.elmY += diffY * ratio
                        this.elmX += diffY
                      }
                      if (ratio == 1) {
                        this.elmW = this.elmH -= diffY
                        this.elmY += diffY
                        this.elmX += diffY
                      }
                      this.setChangeValueForScreenPosition("top", diffY);
                    } else {
                      if (ratio > 1) {
                        this.elmH -= diffY
                        this.elmW -= diffY * ratio
                      }
                      if (ratio < 1) {
                        this.elmH -= diffY * ratio
                        this.elmW -= diffY
                      }
                      if (ratio == 1) {
                        this.elmW = this.elmH -= diffY
                        this.elmY -= diffY
                      }
                      this.elmY += diffY
                      this.setChangeValueForScreenPosition("top", diffY);
                    }
                  }
                  this.setChangeValueForScreenHeight(-1 * diffY);
                }
                else{
                  if (this.elmH + dY < this.minh) {
                    this.mouseOffY = (dY - (diffY = this.minh - this.elmH))
                  }
                  else if (this.elmY + this.elmH + dY > this.parentH) {
                    this.mouseOffY = (dY - (diffY = this.parentH - this.elmY - this.elmH))
                  }
                  if(this.handle.indexOf('bm') >= 0){
                    if(this.vdirection == "top"){
                      this.elmH += diffY

                    }else{
                      this.elmH += diffY
                      this.elmY += diffY
                    }
                  }else{
                    if (this.vdirection == "top" && this.handle.indexOf('br') >= 0) {
                      if (ratio > 1) {
                        this.elmH += diffY
                        this.elmW += diffY * ratio
                      }
                      if (ratio < 1) {
                        this.elmH += diffY * ratio
                        this.elmW += diffY
                      }
                      if (ratio == 1) {
                        this.elmW = this.elmH -= diffY
                      }
                    }
                    else {
                      if (ratio > 1) {
                        this.elmH += diffY
                        this.elmW += diffY * ratio
                        this.elmX -= diffY * ratio
                      }
                      if (ratio < 1) {
                        this.elmH += diffY * ratio
                        this.elmW += diffY
                        this.elmX -= diffY
                      }
                      if (ratio == 1) {
                        this.elmW = this.elmH += diffY
                      }

                    }
                  }
                  this.setChangeValueForScreenHeight(diffY);
                }
              }
              if (this.handle.indexOf('ml') >= 0)   {
                if(this.transform > 150 || this.transform < -150){
                  if (this.elmW + dX < this.minw)  {  this.mouseOffX = (dX - (diffX = this.minw - this.elmW)) }
                  else if (this.elmX + this.elmW + dX > this.parentW) { this.mouseOffX = (dX - (diffX = this.parentW - this.elmX - this.elmW)) }
                  if(this.hdirection=="left") {
                    this.elmW += diffX
                  }else {
                    this.elmW -= diffX
                    this.elmX -= diffX
                    this.setChangeValueForScreenPosition("right",-1 * diffX);
                  }
                  if (this.handle.indexOf('t') < 0  && this.handle.indexOf('b')<0 ) {
                    if(this.type=="text_widget" || this.type=="button_widget") {
                      if(this.getChangableTextHeight()!=-1) {
                        this.elmH = this.getChangableTextHeight();
                      }
                    }
                  }
                  this.setChangeValueForScreenWidth(diffX);
                }
                else{
                  if (this.elmW - dX < this.minw) {  this.mouseOffX = (dX - (diffX = this.elmW - this.minw)) }
                  else if (this.elmX + dX < this.parentX) { this.mouseOffX = (dX - (diffX = this.parentX - this.elmX)) }
                  if(this.hdirection=="left") {
                    this.elmW -= diffX
                    this.elmX += diffX
                    this.setChangeValueForScreenPosition("left",diffX);
                  }else {
                    this.elmW += diffX
                  }
                  if (this.handle.indexOf('t') < 0  && this.handle.indexOf('b')<0 ) {
                    if(this.type=="text_widget" || this.type=="button_widget") {
                      if(this.getChangableTextHeight()!=-1) {
                        this.elmH = this.getChangableTextHeight();
                      }
                    }
                  }
                  this.setChangeValueForScreenWidth(-1*diffX);
                }
            }
              if (this.handle.indexOf('mr') >= 0) {
                if(this.transform > 150 || this.transform < -150){
                  if (this.elmW - dX < this.minw) {  this.mouseOffX = (dX - (diffX = this.elmW - this.minw)) }
                  else if (this.elmX + dX < this.parentX) { this.mouseOffX = (dX - (diffX = this.parentX - this.elmX)) }
                  if(this.hdirection=="left") {
                    this.elmW -= diffX
                    this.elmX += diffX
                    this.setChangeValueForScreenPosition("left",diffX);
                  }else {
                    this.elmW += diffX
                  }
                  if (this.handle.indexOf('t') < 0  && this.handle.indexOf('b')<0 ) {
                    if(this.type=="text_widget" || this.type=="button_widget") {
                      if(this.getChangableTextHeight()!=-1) {
                        this.elmH = this.getChangableTextHeight();
                      }
                    }
                  }
                  this.setChangeValueForScreenWidth(-1*diffX);
                }
                else{
                  if (this.elmW + dX < this.minw)  {  this.mouseOffX = (dX - (diffX = this.minw - this.elmW)) }
                  else if (this.elmX + this.elmW + dX > this.parentW) { this.mouseOffX = (dX - (diffX = this.parentW - this.elmX - this.elmW)) }
                  if(this.hdirection=="left") {
                    this.elmW += diffX
                  }else {
                    this.elmW -= diffX
                    this.elmX -= diffX
                    this.setChangeValueForScreenPosition("right",-1 * diffX);
                  }
                  if (this.handle.indexOf('t') < 0  && this.handle.indexOf('b')<0 ) {
                    if(this.type=="text_widget" || this.type=="button_widget") {
                      if(this.getChangableTextHeight()!=-1) {
                        this.elmH = this.getChangableTextHeight();
                      }
                    }
                  }
                  this.setChangeValueForScreenWidth(diffX);
                }
              }
              this.xPoint = (Math.round(this.elmX / this.grid[0]) * this.grid[0])
              this.yPoint = (Math.round(this.elmY / this.grid[1]) * this.grid[1])
              this.width = (Math.round(this.elmW / this.grid[0]) * this.grid[0])
              this.height = (Math.round(this.elmH / this.grid[1]) * this.grid[1])
              this.$emit('resizing', this.xPoint, this.yPoint, this.width, this.height)
            }
            else {
              if (this.handle.indexOf('t') >= 0) {
                if(this.transform > 150 || this.transform < -150){
                  if (this.elmH + dY < this.minh) {
                    this.mouseOffY = (dY - (diffY = this.minh - this.elmH))
                  }
                  else if (this.elmY + this.elmH + dY > this.parentH) {
                    this.mouseOffY = (dY - (diffY = this.parentH - this.elmY - this.elmH))
                  }
                  if (this.vdirection == "top") {
                    this.elmH += diffY
                  } else {
                    this.elmH += diffY
                    this.elmY -= diffY
                    this.setChangeValueForScreenPosition("bottom", -1 * diffY);
                  }
                  this.setChangeValueForScreenHeight(diffY);
                }
                else{
                  if (this.elmH - dY < this.minh) {
                    this.mouseOffY = (dY - (diffY = this.elmH - this.minh))
                  }
                  else if (this.elmY + dY < this.parentY) { this.mouseOffY = (dY - (diffY = this.parentY - this.elmY)) }
                  if (this.vdirection == "top") {
                    this.elmH -= diffY
                    this.elmY += diffY
                    this.setChangeValueForScreenPosition("top", diffY);
                  } else {
                    this.elmH -= diffY
                  }
                  this.setChangeValueForScreenHeight(-1 * diffY);
                }
              }
              if (this.handle.indexOf('b') >= 0) {
                if(this.transform > 150 || this.transform < -150){
                  if (this.elmH - dY < this.minh) {
                    this.mouseOffY = (dY - (diffY = this.elmH - this.minh))
                  }
                  else if (this.elmY + dY < this.parentY) { this.mouseOffY = (dY - (diffY = this.parentY - this.elmY)) }
                  if (this.vdirection == "top") {
                    this.elmH -= diffY
                    this.elmY += diffY
                    this.setChangeValueForScreenPosition("top", diffY);
                  } else {
                    this.elmH -= diffY
                  }
                  this.setChangeValueForScreenHeight(-1 * diffY);
                }
                else{
                  if (this.elmH + dY < this.minh) {
                    this.mouseOffY = (dY - (diffY = this.minh - this.elmH))
                  }
                  else if (this.elmY + this.elmH + dY > this.parentH) {
                    this.mouseOffY = (dY - (diffY = this.parentH - this.elmY - this.elmH))
                  }
                  if (this.vdirection == "top") {
                    this.elmH += diffY
                  } else {
                    this.elmH += diffY
                    this.elmY -= diffY
                    this.setChangeValueForScreenPosition("bottom", -1 * diffY);
                  }
                  this.setChangeValueForScreenHeight(diffY);
                }
              }
              if (this.handle.indexOf('l') >= 0) {
                if(this.transform > 150 || this.transform < -150){
                  if (this.elmW + dX < this.minw) {
                    this.mouseOffX = (dX - (diffX = this.minw - this.elmW))
                  }
                  else if (this.elmX + this.elmW + dX > this.parentW) {
                    this.mouseOffX = (dX - (diffX = this.parentW - this.elmX - this.elmW))
                  }
                  if (this.hdirection == "left") {
                    this.elmW += diffX
                  } else {
                    this.elmW += diffX
                    this.elmX -= diffX
                    this.setChangeValueForScreenPosition("right", -1 * diffX);
                  }
                  if (this.handle.indexOf('t') < 0 && this.handle.indexOf('b') < 0) {
                    if (this.type == "text_widget" || this.type == "button_widget") {
                      if (this.getChangableTextHeight() != -1) {
                        this.elmH = this.getChangableTextHeight();
                      }
                    }
                  }
                  this.setChangeValueForScreenWidth(diffX);
                }
                else{
                  if(this.hdirection=="left") {
                    this.elmX += diffX
                    this.elmW -= diffX
                    this.setChangeValueForScreenPosition("left",diffX);
                  }else {
                    this.elmW -= diffX
                  }
                  if (this.handle.indexOf('t') < 0  && this.handle.indexOf('b')<0 ) {
                    if(this.type=="text_widget" || this.type=="button_widget") {
                      if(this.getChangableTextHeight()!=-1) {
                        this.elmH = this.getChangableTextHeight();
                      }
                    }
                  }
                  this.setChangeValueForScreenWidth(-1*diffX);
                }
              }
              if (this.handle.indexOf('r') >= 0) {
                if(this.transform > 150 || this.transform < -150){
                  if(this.hdirection=="left") {
                    this.elmX += diffX
                    this.elmW -= diffX
                    this.setChangeValueForScreenPosition("left",diffX);
                  }else {
                    this.elmW -= diffX
                  }
                  if (this.handle.indexOf('t') < 0  && this.handle.indexOf('b')<0 ) {
                    if(this.type=="text_widget" || this.type=="button_widget") {
                      if(this.getChangableTextHeight()!=-1) {
                        this.elmH = this.getChangableTextHeight();
                      }
                    }
                  }
                  this.setChangeValueForScreenWidth(-1*diffX);
                }
                else{
                  if (this.elmW + dX < this.minw) {
                    this.mouseOffX = (dX - (diffX = this.minw - this.elmW))
                  }
                  else if (this.elmX + this.elmW + dX > this.parentW) {
                    this.mouseOffX = (dX - (diffX = this.parentW - this.elmX - this.elmW))
                  }
                  if (this.hdirection == "left") {
                    this.elmW += diffX
                  } else {
                    this.elmW += diffX
                    this.elmX -= diffX
                    this.setChangeValueForScreenPosition("right", -1 * diffX);
                  }
                  if (this.handle.indexOf('t') < 0 && this.handle.indexOf('b') < 0) {
                    if (this.type == "text_widget" || this.type == "button_widget") {
                      if (this.getChangableTextHeight() != -1) {
                        this.elmH = this.getChangableTextHeight();
                      }
                    }
                  }
                  this.setChangeValueForScreenWidth(diffX);
                }
              }
              this.xPoint = (Math.round(this.elmX / this.grid[0]) * this.grid[0])
              this.yPoint = (Math.round(this.elmY / this.grid[1]) * this.grid[1])
              this.width = (Math.round(this.elmW / this.grid[0]) * this.grid[0])
              this.height = (Math.round(this.elmH / this.grid[1]) * this.grid[1])
              this.$emit('resizing', this.xPoint, this.yPoint, this.width, this.height)
            }

          }
          else if (this.dragging) {
            // if (this.elmX + dX < this.parentX) {  this.mouseOffX = (dX - (diffX = this.parentX - this.elmX)) }
            // else
            if (this.elmX + this.elmW + dX > this.parentW) {
              this.mouseOffX = (dX - (diffX = this.parentW - this.elmX - this.elmW))
            }
            // if (this.elmY + dY < this.parentY) this.mouseOffY = (dY - (diffY = this.parentY - this.elmY))
            // else
            if (this.elmY + this.elmH + dY > this.parentH) this.mouseOffY = (dY - (diffY = this.parentH - this.elmY - this.elmH))
            if (this.hdirection == "left") {
              this.elmX += diffX
              this.setChangeValueForScreenPosition("left", diffX);
            } else {
              this.elmX -= diffX
              this.setChangeValueForScreenPosition("right", -1 * diffX);
            }
            if (this.vdirection == "top") {
              this.elmY += diffY
              this.setChangeValueForScreenPosition("top", diffY);
            } else {
              this.elmY -= diffY
              this.setChangeValueForScreenPosition("bottom", -1 * diffY);
            }
            if (this.axis === 'x' || this.axis === 'both') {
              this.xPoint = (Math.round(this.elmX / this.grid[0]) * this.grid[0])
            }
            if (this.axis === 'y' || this.axis === 'both') {
              this.yPoint = (Math.round(this.elmY / this.grid[1]) * this.grid[1])
            }
            this.$emit('dragging', this.xPoint, this.yPoint)
          } else if (this.rotating) {
            let pageX = e.pageX;
            let pageY = e.pageY;
            let coords = this.$el.getBoundingClientRect();
            let offsetLeft = coords.left;
            let offsetTop = coords.top;
            let offsetWidth = coords.width;
            let offsetHeight = coords.height;
            let boxCenter = [offsetLeft + offsetWidth / 2, offsetTop + offsetHeight / 2];
            this.transform = Math.atan2(pageX - boxCenter[0], -(pageY - boxCenter[1])) * (180 / Math.PI);
          }
        }
      },
      handleUp: function (e) {
        this.handle = null
        if (!this.client_mode) {
          //for undo feature;
          if (this.resizing) {
            if (JSON.stringify(this.style) !== JSON.stringify(this.prevStyle)) {
              this.setPreviousUndoData("sizeUpdated");
            }
          }
          if (this.dragging) {
            if (JSON.stringify(this.style) !== JSON.stringify(this.prevStyle)) {
              this.setPreviousUndoData("positionUpdated");
            }
          }
          if (this.rotating) {
            if (this.transform != this.prevRotate) {
              this.setPreviousUndoData("transformUpdated");
            }
          }

          //change state
          if (this.resizing) {
            this.resizing = false
            this.$emit('resizestop', this.xPoint, this.yPoint, this.width, this.height)
          }
          if (this.dragging) {
            this.dragging = false
            this.$emit('dragstop', this.xPoint, this.yPoint)
          }
          if (this.rotating) {
            this.rotating = false;
            this.$emit('rotatestop');
          }
          this.opacity = 1
          this.elmX = this.xPoint
          this.elmY = this.yPoint
        }
      },
      handleKeyUp: function (e) {
        if (!this.client_mode) {
          var target = e.target;
          if (target.tagName == "DIV") {
            if (target.getAttribute("contentEditable")) {
              return false;
            }
          } else {
            if (target.tagName != "BODY") {
              return false;
            }
          }
          if (this.active) {
            switch (e.keyCode) {
              case 16:
                this.autoScale = false;
                break;
              case 37:
                this.setPreviousUndoData("positionUpdated");
                break;
              case 38:
                this.setPreviousUndoData("positionUpdated");
                break;
              case 39:
                this.setPreviousUndoData("positionUpdated");
                break;
              case 40:
                this.setPreviousUndoData("positionUpdated");
                break;
            }
          }
        }
        return false;
      },
      handleKeyPress: function (e) {
        if (!this.client_mode) {
          var target = e.target;
          if (target.tagName == "DIV") {
            if (target.getAttribute("contentEditable")) {
              return false;
            }
          } else {
            if (target.tagName != "BODY") {
              return false;
            }
          }
          if (this.active) {
            switch (e.keyCode) {
              case 16:
                this.autoScale = true;
                break;
              case 37:
                e.preventDefault();
                if (this.hdirection == "left") {
                  this.elmX--;
                  this.xPoint--;
                } else {
                  this.elmX++;
                  this.xPoint++;
                }
                break;
              case 38:
                e.preventDefault();
                if (this.vdirection == "top") {
                  this.elmY--;
                  this.yPoint--;
                } else {
                  this.elmY++;
                  this.yPoint++;
                }
                break;
              case 39:
                e.preventDefault();
                if (this.hdirection == "left") {
                  this.elmX++;
                  this.xPoint++;
                } else {
                  this.elmX--;
                  this.xPoint--;
                }
                break;
              case 40:
                e.preventDefault();
                if (this.vdirection == "top") {
                  this.elmY++;
                  this.yPoint++;
                } else {
                  this.elmY--;
                  this.yPoint--;
                }
                break;
              case 46:
              case 8:
                if (this.type != "wrapper_widget") {
                  e.preventDefault();
                  // this.prevData = {};
                  // this.prevData["parent_id"] = this.parentElements.id;
                  // this.prevData["data"] = this.elements;
                  // this.prevData["type"] = "deleted";
                  // this.$store.commit('saveUndoData',this.prevData);

                  var p_elements = this.parentElements.elements;
                  var index = p_elements.indexOf(this.elements);
                  p_elements.splice(index, 1);
                }
                break;
            }
          }
        }
        return false;
      }
    },
    computed: {
      style: function () {
        if (this.hdirection == "left" && this.vdirection == "bottom") {
          return {
            bottom: this.yPoint + 'px',
            left: this.xPoint + 'px',
            width: this.width + 'px',
            height: this.height + 'px',
            position: this.position,
            opacity: this.opacity
            //transform:"translateZ(0px) rotate(" + this.transform + "deg)"
          }
        } else if (this.hdirection == "right" && this.vdirection == "top") {
          return {
            top: this.yPoint + 'px',
            right: this.xPoint + 'px',
            width: this.width + 'px',
            height: this.height + 'px',
            position: this.position,
            opacity: this.opacity
            //transform:"translateZ(0px) rotate(" + this.transform + "deg)"
          }
        } else if (this.hdirection == "right" && this.vdirection == "bottom") {
          return {
            bottom: this.yPoint + 'px',
            right: this.xPoint + 'px',
            width: this.width + 'px',
            height: this.height + 'px',
            position: this.position,
            opacity: this.opacity
            //transform:"translateZ(0px) rotate(" + this.transform + "deg)"
          }
        }
        return {
          top: this.yPoint + 'px',
          left: this.xPoint + 'px',
          width: this.width + 'px',
          height: this.height + 'px',
          position: this.position,
          opacity: this.opacity
          //transform:"translateZ(0px) rotate(" + this.transform + "deg)"
        }
      },
      ...mapState(['config', 'client_mode', 'widgets', 'show_controls', 'isMobileDevice', 'desktopMode', 'scaleForMobile', 'currentCornerPosition']),
      ...mapGetters(['getUndoData'])
    }
  }
</script>

<style scoped>
  .vdr {
    box-sizing: border-box;
  }

  .vdr_outer {
    position: absolute;
    top: -5px;
    left: -5px;
    width: calc(100% + 10px);
    height: calc(100% + 10px);
    outline: 1px dashed rgba(0, 0, 0, .8);
    border-spacing: 3px;
    border-radius: 5px;
  }

  .draggable:hover {
    cursor: move;
  }

  .transform_rotate {
    pointer-events: auto;
    bottom: 100%;
    cursor: pointer;
    height: 25px;
    left: 50%;
    margin: 0 0 15px -15px;
    position: absolute;
    width: 30px;
  }

  .transform_rotate:before {
    background-color: hsla(0, 0%, 100%, .5);
    border-left: 1px dashed rgba(0, 0, 0, .8);
    bottom: -10px;
    content: "";
    height: 20px;
    left: 50%;
    position: absolute;
    width: 0;
  }

  .transform_rotate:after {
    background-color: hsla(0, 0%, 100%, .9);
    border: 1px solid rgba(0, 0, 0, .8);
    border-radius: 50%;
    bottom: 5px;
    height: 9px;
    left: 10px;
    width: 9px;
    content: "";
    position: absolute;
    transition: background-color .2s ease-out, border-color .2s ease-out;
  }

  .transform_rotate:after:focus {
    background-color: black;
  }

  .handle {
    box-sizing: border-box;
    display: none;
    position: absolute;
    width: 10px;
    height: 10px;
    font-size: 1px;
    background: #EEE;
    border: 1px solid #333;
    pointer-events: auto;
  }

  .handle-tl {
    top: -10px;
    left: -10px;
    cursor: nw-resize;
  }

  .handle-tm {
    top: -10px;
    left: 50%;
    margin-left: -5px;
    cursor: n-resize;
  }

  .handle-tr {
    top: -10px;
    right: -10px;
    cursor: ne-resize;
  }

  .handle-ml {
    top: 50%;
    margin-top: -5px;
    left: -10px;
    cursor: w-resize;
  }

  .handle-mr {
    top: 50%;
    margin-top: -5px;
    right: -10px;
    cursor: e-resize;
  }

  .handle-bl {
    bottom: -10px;
    left: -10px;
    cursor: sw-resize;
  }

  .handle-bm {
    bottom: -10px;
    left: 50%;
    margin-left: -5px;
    cursor: s-resize;
  }

  .handle-br {
    bottom: -10px;
    right: -10px;
    cursor: se-resize;
  }

  .control-border {
    width: inherit;
    height: inherit;
    position: absolute;
    z-index: 99999;
    pointer-events: none;
    max-width: inherit !important;
    min-width: inherit !important;
    max-height: inherit !important;
    min-height: inherit !important;
  }

  .slot {
    color: red;
  }
</style>
