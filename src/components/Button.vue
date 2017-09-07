<template>
  <vue-draggable-resizable class="pointer_cursor" v-bind:style="getResizeStyles()" v-bind:w="width" v-bind:h="height" v-bind:x="x"
    v-bind:y="y" v-bind:hdirect="hdirect" v-bind:vdirect="vdirect" v-bind:type="type" v-bind:elements="elements" v-bind:parentElements="parentElements"
    v-bind:textcontent="text" v-bind:resizable="getDisabledControlStatus('resize')" v-bind:draggable="getDisabledControlStatus('drag')"
    v-bind:rotatable="getDisabledControlStatus('rotate')" v-bind:pos="position" :parent="false" @dragging="onDragging" @textClicked="onTextClicked()"
    :handles=getEnabledHandle()>
    <div :id="elements.id" ref="content_resizable" v-bind:style="getStyles()" class="relative-position none_outline" v-bind:class="getAnimationClass()"
      v-bind:contenteditable="contentEditable" @input="updateContent" v-on:keydown="keyPressed" @dblclick="textDbClicked()"
      v-on:blur="saveTextArea()"></div>
  </vue-draggable-resizable>
</template>
<script>

import {hasConfigVariable,getConfigVariable,generateUniqueId,InitStyleWithConfigVariable, processEvents ,removePositionInfo,getDisplayInfo,getAnimationClass,getEnabledHandles} from '../utility/editUtility.js'
import { getResizeWidth,getResizeHeight,getResizeLeft,getResizeTop,getResizeRight,getResizeBottom } from '../utility/parseUtility.js'
import { mapGetters , mapState } from 'vuex';

export default ({
  props:['elements','widgetProps','parentElements'],
  computed: {
    ...mapState(['config','client_mode','show_controls'])
  },
  mounted() {
      this.value = this.elements.text;
      if(hasConfigVariable(this.value)) {
        this.text = getConfigVariable(this.value,this.config);
        this.hasConfigVariableInButton = true;
      }else {
        this.text = this.value;
      }
      if(!this.client_mode) {
        this.contentEditable = true;
      }
      if(!this.elements.hasOwnProperty("id") || !this.elements["id"]) {
        this.elements["id"] = "button_" + generateUniqueId();
      }
      this.initActions();
      this.editableImageStyles= InitStyleWithConfigVariable(this.elements.editImageStyles,this.config);
      this.$nextTick(function() {
        this.$refs.content_resizable.innerText = this.text;
        this.setPositionInfo(this.elements.styles);
        this.position = this.elements.styles["position"];
      });
  },
  methods: {
    initActions: function() {
      if(this.client_mode) {
        var me=this;
        if(me.elements.hasOwnProperty("actions")) {
            var actions = me.elements.actions;
            Object.keys(actions).forEach(function(key) {
            me.$el.addEventListener(key,me.processEvent);      
          });
        }
      }
    },
    getResizeStyles:function() {
      return getDisplayInfo(this.elements.styles);
    },
    getAnimationClass:function() {
      return getAnimationClass(this.elements);
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
      return getEnabledHandles("button",this.client_mode,this.elements);
    },
    setCustomizePopup:function() {
      if(!this.client_mode) {
        let popupInfo = {};
        popupInfo.type = "button";
        popupInfo.element = this.elements;
        popupInfo.parentElements = this.parentElements;
        popupInfo.el = this.$el;
        this.$store.commit("setSettingInfo",popupInfo);
      }
    },
    setEditMode:function() {
      if(this.hasConfigVariableInButton && !this.client_mode) {
        this.editMode = true;
      }
    },
    onDragging:function()
    {
    },
    updateContent:function(event) {
      this.text = event.target.innerText;
    },
    mousePressed:function() {
    },
    mouseUp:function(event) {
    },
    textDbClicked: function() {
      if(!this.client_mode) {
        this.contentEditable = false;
      }
    },
    onTextClicked:function() {
      if(!this.client_mode) {
        this.contentEditable = true;
      }
    },
    getStyles:function() {
      let styles = InitStyleWithConfigVariable(this.elements.styles,this.config);
      let resize_styles = removePositionInfo(styles);
      return resize_styles;
    },
    keyPressed:function(event) {
      if(event.key == "Enter") {
        event.preventDefault();
        this.saveTextArea();
      }
    },
    saveTextArea:function() {
        if(this.hasConfigVariableInText) {
          let key = this.elements.text;
          this.setConfigVariable(key,this.text);
        }else {
          this.elements.text = this.text;
        }
    },
    setConfigVariable:function(key,value) {
      let param = {};
      param.key = key;
      param.value = value;
      this.$store.commit("setConfigVariable",param);
    },
    setPositionInfo:function(styles) {
      this.width = getResizeWidth(this.$parent,styles,this.config,this.show_controls);
      this.height = getResizeHeight(this.$parent,styles,this.config,this.show_controls);
        if(styles.hasOwnProperty("left")) {
          this.x = getResizeLeft(this.$parent,styles,this.config, this.show_controls);
          this.hdirect = "left";
        } else {
          this.x = getResizeRight(this.$parent,styles,this.config, this.show_controls);
          this.hdirect = "right";
        }
        if(styles.hasOwnProperty("top")) {
          this.y = getResizeTop(this.$parent,styles,this.config, this.show_controls);
          this.vdirect = "top";
        } else {
          this.y = getResizeBottom(this.$parent,styles,this.config, this.show_controls);
          this.vdirect = "bottom";
        }
      },
      showHint:function() {
        if(!this.client_mode) {
          if(this.hasConfigVariableInButton) {
            addEditableHint(this.$el);
          }
          addDashLine(this.$el);
        }
      },
      hideHint:function() {
        if(!this.client_mode) {
          if(this.hasConfigVariableInButton) {
            deleteEditableHint(this.$el);
          }
        }
      },
      processEvent:function(event) {
      let eventType = event.type;
      if(eventType == "click") {
        event.stopPropagation();
      }
      let actions = this.elements.actions[eventType];
      if(typeof actions !=="undefined") {
          for(var i=0;i<actions.length;i++) {
        var action = actions[i];
        if(typeof action == "object") {
          var action_type = Object.keys(action);
          if(Array.isArray(action_type)) {
            var type = action_type[0];
            var action_parameters = action[type];
            processEvents(eventType,type,action_parameters,this.$store);
          }
        }
      }
      }
    }
  },
  data: function () {
    return {
      type:"button_widget",
      text:"",
      editMode:false,
      showEditableIcon:false,
      hasConfigVariableInButton:false,
      editableImageStyles:"",
      contentEditable: false,
      width:50,
      height:50,
      x:0,
      y:0,
      hdirect:"left",
      vdirect:"top",
      position:'absolute'
    }
  }
})

</script>

<style scoped>
  .editabletextInButton {
    height: 100%;
    position: absolute;
    background: transparent;
    border-style: none;
    white-space: pre-wrap;
    font-family: sans-serif!important;
    font-size: inherit!important;
    font-weight: inherit!important;
    color: inherit;
    cursor: move;
    padding: 0px;
  }
  
  .editabletextInButton:focus {
    outline: none;
  }
  
  .button_noneditable {
    word-wrap: break-word!important;
    overflow-wrap: break-word!important;
    font-family: sans-serif!important;
    font-size: inherit!important;
    font-weight: inherit!important;
    line-height: inherit!important;
  }
</style>