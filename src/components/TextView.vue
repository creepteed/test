<template>
  <vue-draggable-resizable ref="resize_text" v-bind:style="getResizeStyles()" v-bind:w="width" v-bind:h="height" v-bind:x="x"
    v-bind:y="y" v-bind:hdirect="hdirect" v-bind:vdirect="vdirect" v-bind:type="type" v-bind:elements="elements" v-bind:parentElements="parentElements"
    v-bind:textcontent="text" @dragging="onDragging" @dragstop="onDragStop" @textClicked="onTextClicked()" v-bind:resizable="getDisabledControlStatus('resize')"
    v-bind:draggable="getDisabledControlStatus('drag')" v-bind:rotatable="getDisabledControlStatus('rotate')" v-bind:pos="position"
    :handles="getEnabledHandle()">
    <div :id="elements.id" v-bind:style="getStyles()" ref="content_resizable" v-bind:class="getTextClass()" @input="updateContent"
      v-bind:contenteditable="contentEditable" v-on:keydown="keyPressed" @dblclick="textDbClicked()" v-on:blur="saveTextArea()"></div>
  </vue-draggable-resizable>
</template>
<script>
import Vue from 'vue';
import {hasConfigVariable,getConfigVariable,generateUniqueId,InitStyle,InitStyleWithConfigVariable, processEvents ,elementMouseDown,elementMouseUp,removePositionInfo,getDisplayInfo,getAnimationClass,getEnabledHandles} from '../utility/editUtility.js'
import { getResizeWidth,getResizeHeight,getResizeLeft,getResizeTop,getResizeRight,getResizeBottom } from '../utility/parseUtility.js'
import { mapGetters , mapState } from 'vuex';

export default ({
  props:['elements','widgetProps','parentElements','settingInfo'],
  components:{
  },
  computed: {
    ...mapState(['config','client_mode','show_controls'])
  },
  methods: {
    initActions: function() {
      var me=this;
      if(me.elements.hasOwnProperty("actions")) {
        var actions = me.elements.actions;
        Object.keys(actions).forEach(function(key) {
        me.$el.addEventListener(key,me.processEvent);      
      });
      }
    },
    processEvent:function(event) {
      let eventType = event.type;
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
    },
    getResizeStyles:function() {
        return getDisplayInfo(this.elements.styles);
    },
    getStyles:function() {
      //InitStyle(this.elements.styles);
      let styles = InitStyleWithConfigVariable(this.elements.styles,this.config);
      let resize_styles = removePositionInfo(styles);
      return resize_styles;
    },
    getTextClass:function() {
      if(this.client_mode) {
        return "relative-position cursor_normal none_outline " + getAnimationClass(this.elements);
      }
      return "relative-position none_outline";
    },
    getEnabledHandle() {
      return getEnabledHandles("text",this.client_mode,this.elements);
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
    onDragging:function(x,y) {
    },
    onDragStop:function(x,y) {
    },
    setCustomizePopup:function(event) {
    },
    setConfigVariable:function(key,value) {
      let param = {};
      param.key = key;
      param.value = value;
      this.$store.commit("setConfigVariable",param);
    },
    setEditableIcon:function() {
      if(!this.client_mode) {
        if(this.hasConfigVariableInText) {
          addEditableHint(this.$el);
        }
      }
    },
    onTextClicked:function() {
      if(!this.client_mode) {
        this.contentEditable = true;
      }
    },
    textDbClicked: function() {
      if(!this.client_mode) {
        this.contentEditable = false;
      }
    },
    hideEditableIcon:function() {
      if(!this.client_mode) {
        if(this.hasConfigVariableInText) {
          deleteEditableHint(this.$el);
        }
      }
    },
    keyPressed:function(event) {
      event.stopPropagation();
      return false;
      // if(event.keyCode == 13) {
      //   event.preventDefault();
      //   this.saveTextArea();
      // }
      // return false;
    },
    saveTextArea:function() {
      if(this.hasConfigVariableInText) {
        let key = this.elements.text;
        this.setConfigVariable(key,this.text);
      }else {
        this.elements.text = this.text;
      }
      
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
    updateContent:function(event) {
      this.text = event.target.innerText;
    }
  }, 
  mounted: function () {
    var value = this.elements.text;
    if(hasConfigVariable(value)) {
      this.hasConfigVariableInText = true;
      this.text = getConfigVariable(value,this.config);
    }else {
      this.text = value;
    }
    if(!this.elements.hasOwnProperty("id") || !this.elements["id"]) {
        this.elements["id"] = "text_" + generateUniqueId();
    }
    if(this.elements.hasOwnProperty("body")) {
        var body = this.elements.body;
        if(body.hasOwnProperty("class")) {
          if(this.client_mode) {
            this.txtClass = this.elements.body.class;
          }
        }
    }
    this.$nextTick(function() {
      this.$refs.content_resizable.innerText = this.text;
      this.setPositionInfo(this.elements.styles);
      this.position = this.elements.styles["position"];
    });
    if(!this.client_mode) {
      this.contentEditable = true;
    }
    this.initActions();
  },
  updated: function() {
  },
  created: function() {
  },
  watch:{
    'config': function(config) {
    },
    'settingInfo':function() {
    }
  },
  data: function () {
    return {
      type:"text_widget",
      text:"",
      txtClass:"",
      contentEditable: false,
      dashedStyles:"",
      hasConfigVariableInText:false,
      editable:false,
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

<style>
  .widgettext {
    cursor: default;
    line-height: 1em;
  }
  
  .relative-position {
    position: relative;
  }
  
  .editabletext {
    height: 100%;
    position: absolute;
    white-space: normal;
    color: inherit;
    font-size: inherit;
    background: transparent;
    border-style: none;
    resize: none;
    padding: 0px;
    line-height: inherit;
    white-space: pre-wrap;
    padding: inherit;
  }
  
  .cursor_normal {
    cursor: default!important;
  }
  
  .cursor_input {
    cursor: text!important;
  }
  
  .readonlytext {
    background: transparent;
    border-style: none;
  }
  
  .editabletext:focus {
    outline: none;
  }
  
  .none_outline:focus {
    outline: none;
  }
  
  .editable_icon {
    width: 25px;
    height: 25px;
    margin-left: -1.8em;
    margin-top: -1.5em;
    position: absolute;
  }
  
  .textarea-container {
    position: relative;
    width: 100%;
    min-height: 24px!important;
    min-width: 20px!important;
  }
  
  .editabletext,
  .textarea-size {
    font-family: sans-serif!important;
    font-size: inherit!important;
    font-weight: inherit!important;
    box-sizing: border-box;
    overflow: hidden;
    width: 100%;
  }
  
  .textarea-size {
    visibility: hidden;
    white-space: pre-wrap;
    word-wrap: break-word!important;
    overflow-wrap: break-word!important;
  }
  
  .span_noneditable {
    cursor: default;
    word-wrap: break-word!important;
    overflow-wrap: break-word!important;
    font-family: sans-serif!important;
    font-size: inherit!important;
    font-weight: inherit!important;
    line-height: inherit!important;
  }
  
  .modern_dashed_line {
    border: 1px dashed #b3b3b3;
    outline: 1px dashed #333;
    border-radius: 5px;
  }
  
  .textview_resize {
    width: 100%;
    height: 100%;
  }
</style>