<template>
    <div class="pointer_cursor">
        <div class="layout-class" @click="setLayer(elements.id)" v-bind:class="selectedLayerClass(elements.id)">
            <div class="layer-image">
                <svg viewBox="0 0 20 18">
                    <path d="M0,9L2,8l8,4,8-4,2,1L10,14ZM0,5L10,0,20,5,10,10ZM10,2L4,5l6,3,6-3Zm0,14,8-4,2,1L10,18,0,13l2-1Zm0,0"></path>
                </svg>
            </div>
            {{elements.id}}
        </div>
        <draggable v-model="childElements" @end="onEnd">
            <transition-group name="list-complete" ref="childlayers">
                <div v-for="(childEl, index) in childElements" @mousedown="setLayer(childEl.id)" v-bind:class="selectedLayerClass(childEl.id)"
                    :key="childEl.id" class="list-complete-item">
                    <div v-bind:style="getLayerImageStyle(childEl)"></div>
                    {{childEl.id}}
                </div>
            </transition-group>
        </draggable>
    </div>
</template>
<script>
import Vue from 'vue'
import { mapGetters , mapState } from 'vuex';
import draggable from 'vuedraggable'
import * as properties from '../../properties';

export default ({
  name: 'layer',
  props:['elements'],
  computed: mapState({
      settingInfo: state=> state.settingInfo
  }),
  components: {
      draggable
  },
  methods: {
      onEnd:function() {
        var startIndex = 1000;
        var increase = 0;
        for(var i=this.childElements.length;i>0;i--) {
            var zIndex = startIndex + increase;
            increase++;
            this.childElements[i-1].styles["z-index"] = zIndex;
        }
        if(this.settingInfo!=null) {
            var element = this.settingInfo.element;
            this.setLayer(element.id);
        }
      },
      selectedLayerClass:function(key) {
        if(this.settingInfo!=null) {
            var element = this.settingInfo.element;
            if(element && element.id && element.id == key) {
                return "selected_layer"; 
            }
        }
        return "";
      },
      setLayer:function(id) {
        var targetNode = document.getElementById(id);
        if(targetNode) {
            this.triggerMouseEvent(targetNode, "mousedown");
            this.triggerMouseEvent(targetNode, "mouseup");
        }
      },
      triggerMouseEvent:function(node, eventType) {
            var clickEvent = document.createEvent ('MouseEvents');
            clickEvent.initEvent (eventType, true, true);
            node.dispatchEvent(clickEvent);
     },
     getLayerImageStyle:function(el) {
         let type = el.type;
         let elStyles = el.styles;
         let style = {};
         style["margin-right"] = "15px";
         style["background-size"] = "cover";
         style["display"] = "inline-block";
         switch(type) {
             case "image":
                style["width"] = "15px";
                style["height"] = "15px";
                style["background-image"] = "url" + "(" + properties.layerImageSrc + ")";  
                break;
            case "text":
                style["width"] = "20px";
                style["height"] = "20px";
                style["margin-left"] = "-4px";
                style["background-image"] = "url" + "(" + properties.layerTextViewSrc + ")";  
                break;
            case "bg":
                style["width"] = "15px";
                style["height"] = "10px";
                style["background-color"] = "rgb(58, 69, 81)";
                break;
            case "button":
                style["width"] = "12px";
                style["height"] = "12px";
                style["background-image"] = "url" + "(" + properties.layerButtonSrc + ")";
         }
         return style;
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
  mounted(){
      this.$nextTick(function() {
          if(this.elements.hasOwnProperty("elements")) {
            this.childElements = this.elements.elements;
            this.childElements.sort(this.compare);
        }
      });
  },
  updated() {
  },
  watch:{
    elements:function() {
        if(this.elements.hasOwnProperty("elements")) {
            this.childElements = this.elements.elements;
            console.log(this.childElements);
            this.childElements.sort(this.compare);
        }
    },
    childElements:function() {
    },
    settingInfo:function() {
        this.childElements = this.elements.elements;
        this.childElements.sort(this.compare);
    }
  },
  data: function () {
    return {
        childElements:[]
    }
  }
})

</script>

<style scoped>
    .list-complete-item {
        padding: 6px 4px 6px 40px;
        margin-top: 1px;
        border-bottom: 1px solid #dfe0e6;
        transition: all 0.5s;
    }
    
    .list-complete-enter,
    .list-complete-leave-active {
        opacity: 0;
    }
    
    .layout-class {
        font-size: 18px;
        font-weight: 500;
        padding: 6px 4px 6px 30px;
        border-bottom: 1px solid #dfe0e6;
    }
    
    .selected_layer {
        background-color: #dfe0e6;
    }
    
    .layer-image {
        display: inline-block;
        fill: rgb(58, 69, 81);
        margin-right: 15px;
        width: 18px;
        height: 18px;
    }
</style>