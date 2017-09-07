<template>
  <vue-draggable-resizable v-if="delete_mandatory" v-bind:style="getResizeStyles()" v-bind:w="width" v-bind:h="height" v-bind:x="x"
    v-bind:y="y" v-bind:minw="minw" v-bind:minh="minh" v-bind:hdirect="hdirect" v-bind:vdirect="vdirect" v-bind:resizable="getDisabledControlStatus('resize')"
    v-bind:draggable="getDisabledControlStatus('drag')" v-bind:rotatable="getDisabledControlStatus('rotate')" v-bind:type="type"
    v-bind:pos="position" :parent="false" v-bind:elements="elements" v-bind:parentElements="parentElements" :handles=getEnabledHandle()>
    <div :id="elements.id" ref="image_widget" v-bind:class="getImageClass()" v-bind:style="getImageStyle()" v-on:mouseleave="leaveImage()"
      v-on:mouseover="enterImage()"></div>
  </vue-draggable-resizable>
</template>
<script>
import { mapGetters , mapState } from 'vuex';
import {hasConfigVariable,getConfigVariable,generateUniqueId,showResizeMode,InitStyleWithConfigVariable,removePositionInfo,getDisplayInfo,getAnimationClass,processEvents,getEnabledHandles} from '../utility/editUtility.js'
import { getResizeWidth,getResizeHeight,getResizeLeft,getResizeTop,getResizeRight,getResizeBottom } from '../utility/parseUtility.js'

import * as properties from '../properties';

export default ({
  props:['elements','widgetProps','parentElements'],
  computed: {
    ...mapState(['config','client_mode','isMobileDevice','isSettingAvailable','onceOvered','show_controls'])
  },
  beforeMount() {
   
  },
  mounted() {
      var me = this;
      this.src = this.elements.body.src;
      
      if(hasConfigVariable(this.src)) {
        this.hasConfig = true;
      }
      if(this.$el) {
        this.setPositionInfo(this.elements.styles);
        this.position = this.elements.styles["position"];
      }
      if(this.elements.hasOwnProperty("actions")) {
        var actions = this.elements.actions;
          Object.keys(actions).forEach(function(key) {
          if(me.isMobileDevice) {
            let mKey = key;
            if(key=="mouseenter") {
              mKey = "touchstart";
            }else if(key== "mouseleave"){
              mKey = "touchend";
            }
            me.$refs.image_widget.addEventListener(mKey,me.processEvent);
          }else {
            me.$refs.image_widget.addEventListener(key,me.processEvent);
          }
                
        });
      }
      if(!this.elements.hasOwnProperty("id") || !this.elements["id"]) {
        this.elements["id"] = "image_" + generateUniqueId();
      }
    },
    beforeDestroy: function () {
    },
    updated(){
      
    },
    watch:{
    'config': function(config) {
    },
    'elements':function() {
    },
    'src':function() {
    }
  },
  methods: {
    getImageSrc:function() {
      if (this.hasConfig) {
        return getConfigVariable(this.src,this.config);
      }
      return this.src;
    },
    getImageStyle:function() {
      var style = this.getStyles();
      style["background-image"] = "url" + "(" + this.getImageSrc() + ")";
      style["background-size"] = "cover";
      return style;
    },
    getImageClass:function() {
      if(this.client_mode) {
        return ("relative-position fill-parent  modern-widget-img " + getAnimationClass(this.elements));
      }else {
        return "relative-position fill-parent move_cursor modern-widget-img";
      }
    },
    getStyles:function() {
      let styles = InitStyleWithConfigVariable(this.elements.styles,this.config);
      let resize_styles = removePositionInfo(styles);
      return resize_styles;
    },
    getX:function() {
      return 0;
    },
    getY:function() {
      return 0;
    },
    getDisabledControlStatus(param) {
      if(this.client_mode) {
        return false;
      }
      if(this.elements.hasOwnProperty('disableControl')) {
        var disableControl = this.elements['disableControl'];
        if(disableControl.includes(param)) {
          return false;
        }
      }
      return true;
    },
    getEnabledHandle() {
      return getEnabledHandles("image",this.client_mode,this.elements);
    },
    setPositionInfo:function(styles) {
        this.width = getResizeWidth(this.$parent,styles,this.config,this.show_controls);
        this.height = getResizeHeight(this.$parent,styles,this.config,this.show_controls);
        if(styles.hasOwnProperty("left")) {
          this.x = getResizeLeft(this.$parent,styles,this.config ,this.show_controls);
          this.hdirect = "left";
        } else {
          this.x = getResizeRight(this.$parent,styles,this.config ,this.show_controls);
          this.hdirect = "right";
        }
        if(styles.hasOwnProperty("top")) {
          this.y = getResizeTop(this.$parent,styles,this.config ,this.show_controls);
          this.vdirect = "top";
        } else {
          this.y = getResizeBottom(this.$parent,styles,this.config ,this.show_controls);
          this.vdirect = "bottom";
        }
    },
    imageClicked:function(e) {
      if (e.stopPropagation) e.stopPropagation()
      if (e.preventDefault) e.preventDefault()
    },
    getResizeStyles:function() {
        return getDisplayInfo(this.elements.styles);
    },
    leaveImage() {
      this.stillEntered = false;
    },
    enterImage() {
      this.stillEntered = true;
    },
    processEvent:function(event) {
      let eventType = event.type;
      this.processActions(eventType);
    },
    processActions:function(eventType) {
      if(this.client_mode) {
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
                          if(seconds!=0) {
                            setTimeout(function(parameters){
                              if(!me.stillEntered && !me.isSettingAvailable && me.client_mode) {
                                processEvents(eventType,type,parameters,me.$store);
                              }
                            }, seconds,action_parameters); 
                          } 
                          else{
                            if(me.isSettingAvailable) {
                              processEvents(eventType,type,action_parameters,me.$store);
                            }
                          }
                    }else if (eventType=="mouseenter" || eventType=="touchstart"){
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
                    }else {
                      processEvents(eventType,type,action_parameters,me.$store);
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
      }
    }
  },
    data: function () {
    return {
      type:"image_widget",
      styles:"",
      src:"",
      close_img_src:"", 
      filedialog:"",
      id:"",
      hasConfig:false,
      showIcon:false,
      deleted_state:false,
      delete_mandatory:true,
      resize_mode:false,
      width:50,
      height:50,
      x:0,
      y:0,
      minw:10,
      minh:10,
      hdirect:"left",
      vdirect:"top",
      position:'absolute'
    }
  }
})

</script>

<style>
  .modern-widget-img {
    background-repeat: no-repeat;
  }
  
  .fill-parent {
    float: left;
    box-sizing: border-box!important;
    width: inherit!important;
    height: inherit!important;
    max-width: inherit!important;
    min-width: inherit!important;
    max-height: inherit!important;
    min-height: inherit!important;
  }
  
  .close_btn {
    position: absolute;
    width: 20px!important;
    height: 20px!important;
    right: -10px!important;
    top: -10px!important;
    z-index: 99999;
  }
  
  .bubble_widget {
    background-color: #394044;
    color: #fdfdfe;
    border-radius: 5px;
    box-shadow: 0 0 6px #B2B2B2;
    display: inline-block;
    padding: 8px 12px 8px 18px;
    position: relative;
    vertical-align: top;
    font-size: 14px;
  }
  
  .bubble_widget::before {
    background-color: #394044;
    content: "\00a0";
    display: block;
    height: 10px;
    position: absolute;
    top: 10px;
    transform: rotate( 29deg) skew( -35deg);
    -moz-transform: rotate( 29deg) skew( -35deg);
    -ms-transform: rotate( 29deg) skew( -35deg);
    -o-transform: rotate( 29deg) skew( -35deg);
    -webkit-transform: rotate( 29deg) skew( -35deg);
    width: 12px;
  }
  
  .f-left {
    float: left;
  }
  
  .f-left::before {
    box-shadow: -1px 1px 1px 0 rgba( 178, 178, 178, .4);
    left: -6px;
    top: 12px;
  }
  
  .f-right {
    float: right;
  }
  
  .f-right::before {
    box-shadow: 1px -1px 1px 0 rgba( 178, 178, 178, .4);
    right: -6px;
    top: 12px;
  }
  
  .pointer_cursor {
    cursor: pointer;
  }
  
  .move_cursor {
    cursor: move;
  }
</style>