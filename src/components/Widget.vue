<template>
  <div class="fb-messenger-widget">
    <div v-for="component in componentsArray" v-bind:class="widgetClass" v-bind:is="preventDefaultCrash(component.type)" v-bind:widgetProps="properties"
      v-bind:elements="component" :key="component.id"></div>
  </div>
</template>
<script>
import Vue from 'vue'
import { mapGetters , mapState } from 'vuex';

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

export default {
  name: 'widget',
  data: function () {
    return {
      componentsArray:[],
      properties:{},
      widgetClass:""
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
  computed: mapState({
    client_mode: state => state.client_mode
  }),
  created: function() {
  },
  mounted: function () {
     var me = this;
     this.setComponentArray();
  },  
  watch:{
    elements: function() {
     this.setComponentArray();
    },
    client_mode: function() {
      this.setComponentArray();
    }
  },
  props: ['elements'],
  methods: {
    setComponentArray: function() {
       var me = this;
       var appear_seconds = 0;
       var disappear_seconds = 0;
       var name = "";
       if(this.elements.hasOwnProperty("properties")) {
         this.properties = this.elements.properties;
         name = this.properties.name;
         appear_seconds = this.properties.appear_after *1000;
         disappear_seconds = me.properties.disappear_after * 1000;
       }
       if(this.elements.hasOwnProperty("elements")) {
         if(appear_seconds!=0 && this.client_mode) {
            setTimeout(function(){
              me.componentsArray = me.elements.elements;
            },appear_seconds);
          } else {
            this.componentsArray = this.elements.elements;   
          }
        }
      if(disappear_seconds!=0 && this.client_mode) {
        setTimeout(function(){
            var params = [];
            params[0] = name;
            params[1] = false;
            me.$store.commit("processViewToggle",params);
          }, disappear_seconds);
      }
    },
    preventDefaultCrash: function(type) {
      if(type=="wrapper" || type=="fb-send-messenger" || type=="fb-checkbox-plugin") {
        return type;
      }
      return "custom"+type;
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .fb-messenger-widget {
    font-size-adjust: none;
    font-size: 100%;
    font-style: normal;
    letter-spacing: normal;
    font-stretch: normal;
    font-variant: normal;
    font-weight: 400;
    font: normal normal 100% Helvetica Neue, Helvetica, Arial, sans-serif;
    text-align: left;
  }
  #fb-messenger-widget {
    position: fixed;
    font-size-adjust: none;
    font-size: 100%;
    font-style: normal;
    letter-spacing: normal;
    font-stretch: normal;
    font-variant: normal;
    font-weight: 400;
    font: normal normal 100% Helvetica Neue, Helvetica, Arial, sans-serif;
    text-align: left;
    -moz-text-align-last: initial;
    text-align-last: initial;
    text-decoration: none;
    -webkit-text-emphasis: none;
    text-emphasis: none;
    text-height: auto;
    text-indent: 0;
    text-justify: auto;
    text-outline: none;
    text-shadow: none;
    text-transform: none;
    text-wrap: normal;
    alignment-adjust: auto;
    alignment-baseline: baseline;
    -webkit-animation: none 0 ease 0 1 normal;
    animation: none 0 ease 0 1 normal;
    -webkit-animation-play-state: running;
    animation-play-state: running;
    -webkit-appearance: normal;
    -moz-appearance: normal;
    appearance: normal;
    azimuth: center;
    -webkit-backface-visibility: visible;
    backface-visibility: visible;
    background: none 0 0 auto repeat scroll padding-box transparent;
    background-color: transparent;
    background-image: none;
    baseline-shift: baseline;
    binding: none;
    bleed: 6pt;
    bookmark-label: content();
    bookmark-level: none;
    bookmark-state: open;
    bookmark-target: none;
    border: 0 none transparent;
    border-radius: 0;
    bottom: auto;
    box-align: stretch;
    -webkit-box-decoration-break: slice;
    box-decoration-break: slice;
    box-direction: normal;
    box-flex: 0.0;
    box-flex-group: 1;
    box-lines: single;
    box-ordinal-group: 1;
    box-orient: inline-axis;
    box-pack: start;
    box-shadow: none;
    box-sizing: content-box;
    -webkit-column-break-after: auto;
    break-after: auto;
    -webkit-column-break-before: auto;
    break-before: auto;
    -webkit-column-break-inside: auto;
    break-inside: auto;
    caption-side: top;
    clear: none;
    clip: auto;
    color: inherit;
    color-profile: auto;
    -webkit-column-count: auto;
    -moz-column-count: auto;
    column-count: auto;
    -webkit-column-fill: balance;
    -moz-column-fill: balance;
    column-fill: balance;
    -webkit-column-gap: normal;
    -moz-column-gap: normal;
    column-gap: normal;
    -webkit-column-rule: medium medium #1f1f1f;
    -moz-column-rule: medium medium #1f1f1f;
    column-rule: medium medium #1f1f1f;
    -webkit-column-span: 1;
    -moz-column-span: 1;
    column-span: 1;
    -webkit-column-width: auto;
    -moz-column-width: auto;
    column-width: auto;
    -webkit-columns: auto auto;
    -moz-columns: auto auto;
    columns: auto auto;
    content: normal;
    counter-increment: none;
    counter-reset: none;
    crop: auto;
    cursor: auto;
    direction: ltr;
    display: inline;
    dominant-baseline: auto;
    drop-initial-after-adjust: text-after-edge;
    drop-initial-after-align: baseline;
    drop-initial-before-adjust: text-before-edge;
    drop-initial-before-align: caps-height;
    drop-initial-size: auto;
    drop-initial-value: initial;
    elevation: level;
    empty-cells: show;
    fit: fill;
    fit-position: 0 0;
    float: none;
    float-offset: 0 0;
    grid-columns: none;
    grid-rows: none;
    hanging-punctuation: none;
    height: auto;
    hyphenate-after: auto;
    hyphenate-before: auto;
    hyphenate-character: auto;
    hyphenate-lines: no-limit;
    hyphenate-resource: none;
    -webkit-hyphens: manual;
    -ms-hyphens: manual;
    hyphens: manual;
    icon: auto;
    image-orientation: auto;
    image-rendering: auto;
    image-resolution: normal;
    inline-box-align: last;
    left: auto;
    line-height: inherit;
    line-stacking: inline-line-height exclude-ruby consider-shifts;
    list-style: disc outside none;
    margin: 0;
    marks: none;
    marquee-direction: forward;
    marquee-loop: 1;
    marquee-play-count: 1;
    marquee-speed: normal;
    marquee-style: scroll;
    max-height: none;
    max-width: none;
    min-height: 0;
    min-width: 0;
    move-to: normal;
    nav-down: auto;
    nav-index: auto;
    nav-left: auto;
    nav-right: auto;
    nav-up: auto;
    opacity: 1;
    orphans: 2;
    outline: medium none invert;
    outline-offset: 0;
    overflow: visible;
    overflow-style: auto;
    padding: 0;
    page: auto;
    page-break-after: auto;
    page-break-before: auto;
    page-break-inside: auto;
    page-policy: start;
    -webkit-perspective: none;
    perspective: none;
    -webkit-perspective-origin: 50% 50%;
    perspective-origin: 50% 50%;
    presentation-level: 0;
    punctuation-trim: none;
    quotes: none;
    rendering-intent: auto;
    resize: none;
    right: auto;
    rotation: 0;
    rotation-point: 50% 50%;
    ruby-align: auto;
    ruby-overhang: none;
    ruby-position: before;
    ruby-span: none;
    size: auto;
    string-set: none;
    table-layout: auto;
    top: auto;
    -webkit-transform: none;
    transform: none;
    -webkit-transform-origin: 50% 50% 0;
    transform-origin: 50% 50% 0;
    -webkit-transform-style: flat;
    transform-style: flat;
    transition: all 0 ease 0;
    unicode-bidi: normal;
    vertical-align: baseline;
    white-space: normal;
    white-space-collapse: collapse;
    widows: 2;
    word-break: normal;
    word-spacing: normal;
    word-wrap: normal;
    text-align: start;
    filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-family: 'Open Sans', sans-serif !important;
    width: 300px!important;
    height: auto;
    padding: 5px;
    margin: 0;
    overflow: visible;
    background: transparent;
    border: 0 solid #cccccc;
    z-index: 2147483646;
    display: block;
    visibility: visible;
    bottom: 10px;
    min-width: 70px;
    position: fixed;
  }

  h1,
  h2 {
    font-weight: normal;
  }
  
  ul {
    list-style-type: none;
    padding: 0;
  }
  
  li {
    display: inline-block;
    margin: 0 10px;
  }
  
  a {
    color: #42b983;
  }
</style>