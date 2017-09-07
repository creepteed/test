<template>
  <vue-draggable-resizable v-bind:style="getResizeStyles()" v-bind:w="width" v-bind:h="height" v-bind:x="x" v-bind:y="y" v-bind:hdirect="hdirect"
    v-bind:vdirect="vdirect" v-bind:type="type" v-bind:resizable="!client_mode" v-bind:draggable="!client_mode" v-bind:elements="elements"
    v-bind:class="getWrapperClass()" :handles="getEnabledHandle()">
    <div :id="elements.id" ref="twrap" v-bind:style="getStyles()" v-bind:class="getOverflowClass()" class="fill-parent" v-on:mouseleave="leaveWrapper()"
      v-on:mouseover="enterWrapper()">
      <div v-for="component in childComponents" v-bind:is="preventDefaultCrash(component.type)" v-bind:widgetProps="widgetProps"
        v-bind:elements="component" v-bind:parentElements="elements" :key="component.id"></div>
    </div>
  </vue-draggable-resizable>
</template>
<script>
import Vue from 'vue'
import { mapGetters , mapState } from 'vuex';
import {hasConfigVariable,getConfigVariable,InitStyle,generateUniqueId,InitStyleWithConfigVariable, processEvents,removePositionInfo,getDisplayInfo,getAnimationClass,getEnabledHandles } from '../utility/editUtility.js'
import { getResizeWidth,getResizeHeight,getResizeLeft,getResizeTop,getResizeRight,getResizeBottom,getRotateValue } from '../utility/parseUtility.js'

import CustomTextEdit from './TextView'
import CustomImageView from './Image'
import Wrapper from './Wrapper'
import CustomButton from './Button'
import CustomBg from './Bg'
import CustomLink from './Link'
import FaceBookSendMessenger from './FaceBookSendMessenger'
import FaceBookCheckBoxPlugin from './FaceBookCheckBoxPlugin'
import VueDraggableResizable from './ResizableDragDrop'

Vue.component('custombutton', CustomButton);
Vue.component('customimage', CustomImageView);
Vue.component('customtext', CustomTextEdit);
Vue.component('customlink', CustomLink);
Vue.component('custombg', CustomBg);
Vue.component('fb-send-messenger',FaceBookSendMessenger);
Vue.component('fb-checkbox-plugin',FaceBookCheckBoxPlugin);
Vue.component('vue-draggable-resizable', VueDraggableResizable)

export default ({
  name: 'wrapper',
  props:['elements','widgetProps'],
  mounted: function () {
    this.initElements();
    if(!this.client_mode) {
      window.addEventListener('keydown',this.handleKeyPress,true);
    }
  },
  beforeDestroy: function () {
    if(!this.client_mode) {
      window.removeEventListener('keydown',this.handleKeyPress,true)
    }
  },
  components: {
    CustomTextEdit,
    CustomImageView,
    Wrapper,
    CustomButton,
    CustomBg,
    CustomLink,
    FaceBookSendMessenger,
    FaceBookCheckBoxPlugin,
    VueDraggableResizable
  },
  computed: {
    ...mapState(['isSettingAvailable','config','settingInfo','layerInfo','widgets','client_mode','show_controls','onceOvered','isMobileDevice','currentCornerPosition']),
    ...mapGetters(['getUndoData'])
  },
  watch:{
    elements: function() {
      this.initElements();
    },
    currentCornerPosition: function() {
      this.initElements();
    },
    client_mode:function() {

    },
    widgets: function() {
    }
  },
  methods: {
    getStyles: function() {
      let styles = InitStyleWithConfigVariable(this.elements.styles,this.config);
      let resize_styles = removePositionInfo(styles);
      return resize_styles;
    },
    getResizeStyles:function() {
        return getDisplayInfo(this.elements.styles);
    },
    getEnabledHandle() {
      return getEnabledHandles("wrapper",this.client_mode,this.elements);
    },
    getWrapperClass:function() {
      if(this.show_controls && !this.client_mode) {
        if(this.layerInfo) {
            var layoutInfo = this.layerInfo;
            if(layoutInfo.id == this.elements.id) {
              return "outline_wrapper " + this.wrapperClass;
            }
            return "overflow_hidden " + this.wrapperClass;
        }else {
          return "overflow_hidden " + this.wrapperClass;
        }
      }
      return this.wrapperClass;
    },
    getOverflowClass:function() {
      if(this.client_mode) {
        return "overflow_hidden";
      }
      return "";
    },
    handleKeyPress:function(e) {
      if(e.keyCode == 90 && e.ctrlKey) {
        if(this.getUndoData) {
          if(this.elements.id == this.getUndoData["parent_id"]) {
            if(this.getUndoData["type"]=="positionUpdated") {
                if(this.getUndoData["el"].hdirection == "left") {
                  this.getUndoData["el"].xPoint = getResizeLeft(this,this.getUndoData["data"].styles,this.config);
                } else {
                  this.getUndoData["el"].xPoint = getResizeRight(this,this.getUndoData["data"].styles,this.config);
                }
                if(this.getUndoData["el"].vdirection=="top") {
                  this.getUndoData["el"].yPoint = getResizeTop(this,this.getUndoData["data"].styles,this.config);
                }else {
                  this.getUndoData["el"].yPoint = getResizeBottom(this,this.getUndoData["data"].styles,this.config);
                }
            } else if(this.getUndoData["type"]=="sizeUpdated") {
                this.getUndoData["el"].width = getResizeWidth(this,this.getUndoData["data"].styles,this.config,this.show_controls);
                this.getUndoData["el"].height = getResizeHeight(this,this.getUndoData["data"].styles,this.config,this.show_controls);
            } else if(this.getUndoData["type"]=="transformUpdated") {
              let transform = this.getUndoData["data"].styles['transform'];
              this.getUndoData["el"].transform = getRotateValue(transform);
            }
            else if(this.getUndoData["type"] == "deleted") {
              // if(this.elements.hasOwnProperty("elements")) {
              //   if(!this.childComponents.includes(this.getUndoData["data"])) {
              //     this.childComponents.push(this.getUndoData["data"]);
              //   }
              // }
            }
            this.$store.commit('undoFinished');
          }
        }
      }
      if(e.keyCode == 67 && e.ctrlKey){
          console.log(this.elements.elements[2].type)
      }
    },
    initElements: function(){
      var element = this.elements;
      var me = this;

      if(this.elements.hasOwnProperty("elements")) {
        this.childComponents = element.elements;
      }
      if(!this.elements.hasOwnProperty("id") || !this.elements["id"]) {
        this.elements["id"] = "layout_" + generateUniqueId();
      }
      if(this.client_mode) {
        this.wrapperClass = getAnimationClass(this.elements);
      }

      if(this.elements.hasOwnProperty("actions")) {
        var actions = this.elements.actions;
        Object.keys(actions).forEach(function(key) {
          let mKey = key;
          if(me.isMobileDevice) {

            if(key=="mouseenter") {
              mKey = "touchstart";
            }else if(key== "mouseleave"){
              mKey = "touchend";
            }
            me.$refs.twrap.addEventListener(mKey,me.processEvent);
          }else {
            if(key=="mouseenter") {
              mKey = "mouseover";
            }
            me.$refs.twrap.addEventListener(key,me.processEvent);
          }

      });
      }
      this.$nextTick(function() {
        this.width = getResizeWidth(this.$parent,this.elements.styles,this.config,this.show_controls);
        this.height = getResizeHeight(this.$parent,this.elements.styles,this.config,this.show_controls);
        if(this.elements.styles.hasOwnProperty("left")) {
          this.x = getResizeLeft(this.$parent,this.elements.styles,this.config ,this.show_controls);
          this.hdirect = "left";
        } else {
          this.x = getResizeRight(this.$parent,this.elements.styles,this.config ,this.show_controls);
          this.hdirect = "right";
        }
        if(this.elements.styles.hasOwnProperty("top")) {
          this.y = getResizeTop(this.$parent,this.elements.styles,this.config ,this.show_controls);
          this.vdirect = "top";
        } else {
          this.y = getResizeBottom(this.$parent,this.elements.styles,this.config ,this.show_controls);
          this.vdirect = "bottom";
        }

      });
    },
    preventDefaultCrash: function(type) {
      if(type=="wrapper" || type=="fb-send-messenger" || type=="fb-checkbox-plugin") {
        return type;
      }
      return "custom"+type;
    },
    leaveWrapper() {
      this.stillEntered = false;
    },
    enterWrapper() {
      this.stillEntered = true;
    },
    processActions:function(eventType) {
      let actions = this.elements.actions[eventType];
      var me = this;
      if(typeof actions !=="undefined") {
        for(var i=0;i<actions.length;i++) {
        var action = actions[i];
        if(typeof action == "object") {
          var action_type = Object.keys(action);
          if(Array.isArray(action_type)) {
            var type = action_type[0];
            var action_parameters = action[type];
            switch(type) {
              case "playSound":
                  if(this.onceOvered) {
                    processEvents(eventType,type,action_parameters,this.$store);
                    this.$store.commit('soundPlayed');
                  }

                break;
              case "viewToggle":

                var seconds = action_parameters[2]*1000;
                    if(eventType=="mouseleave" || eventType=="touchend") {
                      if(this.client_mode) {
                        if(seconds!=0) {
                          setTimeout(function(parameters){

                            if(!me.stillEntered && !me.isSettingAvailable && me.client_mode) {
                              processEvents(eventType,type,parameters,me.$store);
                            }
                          }, seconds,action_parameters);
                        }
                        else{
                          if(me.client_mode && me.isSettingAvailable) {
                            processEvents(eventType,type,action_parameters,me.$store);
                          }
                        }
                      }
                  }else if (eventType=="mouseenter" || eventType=="touchstart"){
                    if(this.client_mode) {
                      if(seconds!=0) {
                          setTimeout(function(parameters){
                            if(me.stillEntered && me.client_mode) {
                              processEvents(eventType,type,parameters,me.$store);
                            }
                          }, seconds,action_parameters);
                      }
                      else{
                        processEvents(eventType,type,action_parameters,me.$store);
                      }
                    }
                  }else{
                    processEvents(eventType,type,action_parameters,this.$store);
                  }
                break;
              default:
                processEvents(eventType,type,action_parameters,this.$store);
                break;
            }
           }
        }
      }
      }
    },
    processEvent:function(event) {
      let eventType = event.type;
      this.processActions(eventType);
    },
     compare:function(a, b) {
            var styleA = parseInt(a.styles["z-index"]);
            var styleB = parseInt(b.styles["z-index"]);
            if (styleA < styleB)
            return 1;
            if (styleA > styleB)
            return -1;
            return 0;
        }
  },
  data: function () {
    return {
      newtext:"",
      stillEntered:false,
      childComponents:[],
      wrapperClass:"",
      parent:null,
      type:"wrapper_widget",
      width:50,
      height:50,
      x:0,
      y:0,
      hdirect:"left",
      vdirect:"top"
    }
  }
})

</script>

<style>
  #textedit {
    position: absolute;
    top: 0px;
  }

  .vue-color__sketch__field {
    display: none!important;
  }

  .overflow_hidden {
    overflow: hidden;
  }

  div.outline_wrapper {
    overflow: visible;
  }

  div.outline_wrapper:after {
    outline: 10000px solid rgba(240, 241, 245, .5);
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    content: "";
  }
</style>
