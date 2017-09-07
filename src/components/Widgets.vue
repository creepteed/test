<template>
  <div id="wiev">
    <div class="header-tool" v-if="show_controls">
      <div>Builder v 0.1</div>
      <div v-bind:style="getDesktopImageStyle()"  @click="setDisplayPreview('desktop')"></div>
      <div v-bind:style="getMobileImageStyle()"  @click="setDisplayPreview('mobile')"></div>
    </div>
    <widget v-for="widgetName in widgets" :key="widgetName" v-if="isAvailableOnRealSite()" v-bind:elements="getElement(widgetName)"></widget>
    <popup v-if="isSettingAvailable && !client_mode && show_controls"></popup>
    <img class="analytics_img" v-bind:src="analythicsUrl" v-if="client_mode" />

    <div v-bind:style="layerstyle" v-if="!client_mode && show_controls" class="layer_panel">
      <div class="headerLayout pointer_cursor">
        <div @click="setExpandMode(false)" :class="{'selected-extab':!expanded}">On Appear</div>
        <div @click="setExpandMode(true)" :class="{'selected-extab':expanded}">On Expand</div>
      </div>
      <Layer v-if="layerInfo!=null" v-bind:elements="layerInfo"></Layer>
    </div>
    <div v-if="show_controls" class="ClientModeOn">
      <span>Client Mode</span> </br>
      <label class="switch">
        <input type="checkbox" v-model="mode">
        <span class="slider round"></span>
      </label>
    </div>
    <div v-if="show_controls" class="client_option">
      <button v-if="show_controls" @click="alertJson()">Export Json</button>
      <button class="add-element" @click="addElement('text')">Add TextBox</button>
      <button class="add-element" @click="addElement('image')">Add Image</button>
      <button class="add-element" @click="addElement('button')">Add Button</button>
      <button class="add-element" @click="addElement('bg')">Add Background</button>
      <select class="position-ui" v-model="cornerPosition">
            <option v-for="item in positionlist" v-bind:value="item">{{item}}</option>
      </select>
    </div>
    <mobilepreview v-if="!desktopMode && show_controls"> </mobilepreview>
    <desktoppreview v-if="desktopMode && show_controls"></desktoppreview>
  </div>
</template>
<script>
import Vue from 'vue'
import draggable from 'vuedraggable'
import { mapGetters , mapState } from 'vuex';
import { deleteBubble,deleteDashLine,generateElement,expandWidget} from '../utility/editUtility.js'
import { isMobileDevice } from '../utility/mobileUtility.js'
import Widget from './Widget'
import Popup from './popup/Popup'
import Layers from './layer/Layers'
import Layer from  './layer/Layer'
import Mobilepreview from './MobilePreview'
import Desktoppreview from './DesktopPreview'

export default {
  name: 'widgets',
  components: {
    Widget,
    Popup,
    Layers,
    Layer,
    Mobilepreview,
    Desktoppreview
  },
  computed: mapState({
    widgets: state => state.widgets,
    info: state =>state.info,
    client:state =>state.client,
    config:  state => state.config,
    isSettingAvailable: state => state.isSettingAvailable,
    analythicsUrl: state=> state.analythicsUrl,
    client_mode: state => state.client_mode,
    show_controls: state => state.show_controls,
    authoring: state => state.authoring,
    settingInfo: state=> state.settingInfo,
    layerInfo: state=> state.layerInfo,
    firstWrapper: state=> state.firstWrapper,
    desktopMode: state=> state.desktopMode,
    currentCornerPosition: state=> state.currentCornerPosition
  }),
  data: function () {
    return {
        layerstyle:"",
        mode:false ,
        positionlist:["Top Right","Top Left","Bottom Right","Bottom Left"],
        cornerPosition:"Bottom Left",
        expanded:false
    };
  },
  created: function() {

  },
  mounted: function () {
     this.$nextTick(function(){
       this.cornerPosition = this.currentCornerPosition;
     });
  },
  beforeDestroy: function () {
  },
  watch:{
    widgets: function() {
      this.$forceUpdate();
       if(this.widgets.length>0) {
         var widgetElement = this.getElement(this.widgets[0]);
         this.$store.commit("setFirstWrapper",widgetElement["elements"][0]);
       }
    },
    config:function() {
       if(this.config.hasOwnProperty("behaviour")) {
          if(this.config.behaviour.hasOwnProperty("layers")) {
              this.layerstyle = this.config.behaviour.layers.styles;
          }
      }
     },
     analythicsUrl:function() {

     },
     isSettingAvailable:function() {
     },
     authoring:function() {
     },
     cornerPosition:function() {
        this.$store.commit('changeWrapperPosition',this.cornerPosition);
        this.expanded = false;
     },
     currentCornerPosition:function() {
       this.cornerPosition = this.currentCornerPosition;
     },
     mode:function() {
       this.$store.commit("switchClientMode",this.mode);
       this.expanded = false;
     },
     client_mode:function() {
       this.mode = this.client_mode;
     },
     expanded:function() {
       if(!this.client_mode) {
         this.$store.commit("setSettingInfo",null);
         this.$store.commit("setLayerInfo",null);
          if(!this.expanded) {
            expandWidget(false,this.$store);
          }else {
            expandWidget(true,this.$store);
          }
       }
     }
  },
  methods: {
    getElement:function(widgetName) {
      return this.authoring[widgetName];
    },
    getDesktopImageStyle: function() {
      let style = {};
      style["width"] = "90px";
      style["height"] = "90px";
      style["margin-left"] = "10px";
      style["transform"] = "scale(0.5)";
      if(!this.desktopMode) {
        style["background"] = "url('https://reachli.s3.amazonaws.com/44415widget-editor%402x.png') -20px -20px";
      }else {
        style["background"] = "url('https://reachli.s3.amazonaws.com/44415widget-editor%402x.png') -20px -148px";
      }
      return style;
    },
    getMobileImageStyle: function() {
      let style = {};
      style["width"] = "50px";
      style["height"] = "90px";
      style["transform"] = "scale(0.5)";
      if(this.desktopMode) {
        style["background"] = "url('https://reachli.s3.amazonaws.com/44415widget-editor%402x.png') -170px -22px";
      }else {
        style["background"] = "url('https://reachli.s3.amazonaws.com/44415widget-editor%402x.png') -170px -150px";
      }
      return style;
    },
    addElement:function(element_type) {
      debugger;
      if(this.client_mode==true && this.show_controls) {
        this.mode = false;
      }

      if(this.firstWrapper) {
        if(this.firstWrapper.type == "wrapper") {
          let element = generateElement(element_type,this.firstWrapper["elements"]);
          this.firstWrapper["elements"].push(element);
          this.$nextTick(function() {
            var targetNode = document.getElementById(element.id);
            if(targetNode) {
                this.triggerMouseEvent(targetNode, "mousedown");
                this.triggerMouseEvent(targetNode, "mouseup");
            }
          });
        }
      }
    },
    triggerMouseEvent:function(node, eventType) {
      var clickEvent = document.createEvent ('MouseEvents');
      clickEvent.initEvent (eventType, true, true);
      node.dispatchEvent(clickEvent);
    },
    alertJson:function() {
      var json={};
      json.info = this.info;
      json.client  = this.client;
      json.config = this.config;
      json.authoring = this.authoring;
      console.log(JSON.stringify(json));
    },
    isAvailableOnRealSite:function() {
      if(this.client_mode && !this.show_controls) {
        if(isMobileDevice()) {
          if(this.info.show_mobile) {
            return true;
          }
          return false;
        }else {
          if(this.info.show_desktop) {
            return true;
          }
          return false;
        }
      }
      return false;
    },
    setExpandMode:function(flag) {
      this.expanded = flag;
    },
    setDisplayPreview: function(mode) {
      if(mode=='desktop') {
        this.$store.commit('changeDesktopMode',true);
        this.expanded = false;
      } else {
        this.$store.commit('changeDesktopMode',false);
        this.expanded = false;
      }
    }
  }
}

</script>

<style>
  .position-ui {
    width: 120px;
    height: 30px;
    border: none;
    background: rgba(223, 224, 230, .6);
    padding-left: 10px;
  }

  .client_option {
    margin-top: 10px;
  }

  .client_option> * {
    display: block;
    margin-bottom: 20px;
  }

  .headerLayout {
    background: #fafafa;
  }

  .headerLayout>div {
    display: inline-block;
    width: 45%;
    text-align: center;
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .layer_panel {
    background-color: #f0f1f5;
    box-shadow: 0 14px 43px 0 rgba(0, 0, 0, .13);
  }

  .analytics_img {
    width: 1px;
    height: 1px;
  }

  .animation-heartbeat {
    animation: heartbeat 1.5s ease-in-out 0s 3 normal both;
  }

  .selected-extab {
    color: blue;
  }

  @-webkit-keyframes heartbeat {
    from {
      -webkit-transform: scale(1);
      transform: scale(1);
      -webkit-transform-origin: center center;
      transform-origin: center center;
      -webkit-animation-timing-function: ease-out;
      animation-timing-function: ease-out
    }
    10% {
      -webkit-transform: scale(.91);
      transform: scale(.91);
      -webkit-animation-timing-function: ease-in;
      animation-timing-function: ease-in
    }
    17% {
      -webkit-transform: scale(.98);
      transform: scale(.98);
      -webkit-animation-timing-function: ease-out;
      animation-timing-function: ease-out
    }
    33% {
      -webkit-transform: scale(.87);
      transform: scale(.87);
      -webkit-animation-timing-function: ease-in;
      animation-timing-function: ease-in
    }
    45% {
      -webkit-transform: scale(1);
      transform: scale(1);
      -webkit-animation-timing-function: ease-out;
      animation-timing-function: ease-out
    }
  }

  @keyframes heartbeat {
    from {
      -webkit-transform: scale(1);
      transform: scale(1);
      -webkit-transform-origin: center center;
      transform-origin: center center;
      -webkit-animation-timing-function: ease-out;
      animation-timing-function: ease-out
    }
    10% {
      -webkit-transform: scale(.91);
      transform: scale(.91);
      -webkit-animation-timing-function: ease-in;
      animation-timing-function: ease-in
    }
    17% {
      -webkit-transform: scale(.98);
      transform: scale(.98);
      -webkit-animation-timing-function: ease-out;
      animation-timing-function: ease-out
    }
    33% {
      -webkit-transform: scale(.87);
      transform: scale(.87);
      -webkit-animation-timing-function: ease-in;
      animation-timing-function: ease-in
    }
    45% {
      -webkit-transform: scale(1);
      transform: scale(1);
      -webkit-animation-timing-function: ease-out;
      animation-timing-function: ease-out
    }
  }

  .slide-top {
    -webkit-animation: chatSlideInBottom 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    -moz-animation: chatSlideInBottom 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    animation: chatSlideInBottom 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    visibility: visible;
    opacity: 1;
  }

  .slide-bottom {
    -webkit-animation: chatSlideInTop 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    -moz-animation: chatSlideInTop 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    animation: chatSlideInTop 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    visibility: visible;
    opacity: 1;
  }

  .slide-left {
    -webkit-animation: chatSlideInLeft 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    -moz-animation: chatSlideInLeft 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    animation: chatSlideInLeft 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    visibility: visible;
    opacity: 1;
  }

  .slide-right {
    -webkit-animation: chatSlideInRight 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    -moz-animation: chatSlideInRight 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    animation: chatSlideInRight 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    visibility: visible;
    opacity: 1;
  }

  .fade-in {
    -webkit-animation: fadeIn 1.2s cubic-bezier(0.39, 0.575, 0.565, 1) 0s 1 normal both;
    -moz-animation: fadeIn 1.2s cubic-bezier(0.39, 0.575, 0.565, 1) 0s 1 normal both;
    animation: fadeIn 1.2s cubic-bezier(0.39, 0.575, 0.565, 1) 0s 1 normal both;
    visibility: visible;
    opacity: 1;
  }

  @-webkit-keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @-webkit-keyframes chatSlideInRight {
    0% {
      -webkit-transform: translateX(100px);
      transform: translateX(100px);
      /*box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);*/
    }
    100% {
      -webkit-transform: translateX(0px);
      transform: translateX(0px);
      /*box-shadow: 0 0 20px 0px rgba(0, 0, 0, 0.35);*/
    }
  }

  @keyframes chatSlideInRight {
    0% {
      -webkit-transform: translateX(100px);
      transform: translateX(100px);
      /*box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);*/
    }
    100% {
      -webkit-transform: translateX(0px);
      transform: translateX(0px);
      /*box-shadow: 0 0 20px 0px rgba(0, 0, 0, 0.35);*/
    }
  }

  @-webkit-keyframes chatSlideInLeft {
    0% {
      -webkit-transform: translateX(-100px);
      transform: translateX(-100px);
      /*box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);*/
    }
    100% {
      -webkit-transform: translateX(0px);
      transform: translateX(0px);
      /*box-shadow: 0 0 20px 0px rgba(0, 0, 0, 0.35);*/
    }
  }

  @keyframes chatSlideInLeft {
    0% {
      -webkit-transform: translateX(-100px);
      transform: translateX(-100px);
      /*box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);*/
    }
    100% {
      -webkit-transform: translateX(0px);
      transform: translateX(0px);
      /*box-shadow: 0 0 20px 0px rgba(0, 0, 0, 0.35);*/
    }
  }

  @-webkit-keyframes chatSlideInTop {
    0% {
      -webkit-transform: translateY(-100px);
      transform: translateY(-100px);
      /*box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);*/
    }
    100% {
      -webkit-transform: translateY(0px);
      transform: translateY(0px);
      /*box-shadow: 0 0 20px 0px rgba(0, 0, 0, 0.35);*/
    }
  }

  @keyframes chatSlideInTop {
    0% {
      -webkit-transform: translateY(-100px);
      transform: translateY(-100px);
      /*box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);*/
    }
    100% {
      -webkit-transform: translateY(0px);
      transform: translateY(0px);
      /*box-shadow: 0 0 20px 0px rgba(0, 0, 0, 0.35);*/
    }
  }

  @-webkit-keyframes chatSlideInBottom {
    0% {
      -webkit-transform: translateY(100px);
      transform: translateY(100px) scale(.93);
      /*box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);*/
    }
    100% {
      -webkit-transform: translateY(0px);
      transform: translateY(0px) scale(1);
      /*box-shadow: 0 0 20px 0px rgba(0, 0, 0, 0.35);*/
    }
  }

  @keyframes chatSlideInBottom {
    0% {
      -webkit-transform: translateY(100px);
      transform: translateY(100px) scale(.93);
      /*box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);*/
    }
    100% {
      -webkit-transform: translateY(0px);
      transform: translateY(0px) scale(1);
      /*box-shadow: 0 0 20px 0px rgba(0, 0, 0, 0.35);*/
    }
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 56px;
    height: 30px;
    margin-top: 5px;
  }

  .switch input {
    display: none;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
  }

  input:checked + .slider {
    background-color: #2196F3;
  }

  input:focus + .slider {
    box-shadow: 0 0 1px #2196F3;
  }

  input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }
  /* Rounded sliders */

  .slider.round {
    border-radius: 30px;
  }

  .slider.round:before {
    border-radius: 50%;
  }

  .ClientModeOn {
    margin-top: 10px;
  }

  .header-tool {
    font-size: 32px;
    font-weight: bold;
    display: table;
  }

  .header-tool> div {
    display: table-cell;
    vertical-align: middle;
    cursor: pointer;
  }
</style>
