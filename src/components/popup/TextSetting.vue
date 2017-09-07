<template>
  <div class="text_panel">
    <div class="at_panel">
      <div class="align_panel">
        <div class="font_at_panel pointer_cursor" @click="setAlign('left')" v-bind:class="{ 'font_at_active':currentAlign=='left'}">
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <defs></defs>
            <g id="Properties-bar---Left-align" stroke="none" stroke-width="1" fill-rule="evenodd">
              <path d="M15,15 L3,15 L3,17 L15,17 L15,15 Z M15,7 L3,7 L3,9 L15,9 L15,7 Z M3,13 L21,13 L21,11 L3,11 L3,13 Z M3,21 L21,21 L21,19 L3,19 L3,21 Z M3,3 L3,5 L21,5 L21,3 L3,3 Z"
                id="Shape"></path>
            </g>
          </svg>
        </div>
        <div class="font_at_panel pointer_cursor" @click="setAlign('center')" v-bind:class="{ 'font_at_active':currentAlign=='center'}">
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <defs></defs>
            <g id="Properties-bar---Center-align" stroke="none" stroke-width="1" fill-rule="evenodd">
              <path d="M7,15 L7,17 L17,17 L17,15 L7,15 Z M3,21 L21,21 L21,19 L3,19 L3,21 Z M3,13 L21,13 L21,11 L3,11 L3,13 Z M7,7 L7,9 L17,9 L17,7 L7,7 Z M3,3 L3,5 L21,5 L21,3 L3,3 Z"
                id="Shape"></path>
            </g>
          </svg>
        </div>
        <div class="font_at_panel pointer_cursor" @click="setAlign('right')" v-bind:class="{ 'font_at_active':currentAlign=='right'}">
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <defs></defs>
            <g id="Properties-bar---Right-align" stroke="none" stroke-width="1" fill-rule="evenodd">
              <path d="M3,21 L21,21 L21,19 L3,19 L3,21 Z M9,17 L21,17 L21,15 L9,15 L9,17 Z M3,13 L21,13 L21,11 L3,11 L3,13 Z M9,9 L21,9 L21,7 L9,7 L9,9 Z M3,3 L3,5 L21,5 L21,3 L3,3 Z"
                id="Shape"></path>
            </g>
          </svg>
        </div>
      </div>
      <div class="trans_panel">
        <div class="font_at_panel pointer_cursor" @click="setTrans('uppercase')" v-bind:class="{ 'font_at_active':currentTrans=='uppercase'}">
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <defs></defs>
            <g id="Properties-bar---Capital" stroke="none" stroke-width="1" fill-rule="evenodd">
              <polygon id="Shape" points="5 4 5 6 11 6 11 20 13 20 13 6 19 6 19 4"></polygon>
            </g>
          </svg>
        </div>
        <div class="font_at_panel pointer_cursor" @click="setTrans('lowercase')" v-bind:class="{ 'font_at_active':currentTrans=='lowercase'}">
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <defs></defs>
            <g id="Properties-bar---Small-Caps" stroke="none" stroke-width="1" fill-rule="evenodd">
              <path d="M11,7 L11,4 L13,4 L13,7 L16,7 L16,9 L13,9 L13,17 C12.9948261,17.504802 13.4430304,17.9627931 14,18 L16,18 L16,20 L14,20 C12.319212,19.9460447 10.9950837,18.5930034 11,17 L11,9 L9,9 L9,7 L11,7 Z"
                id="Combined-Shape"></path>
            </g>
          </svg>
        </div>
      </div>
      <div class="under_panel">
        <div class="font_at_panel pointer_cursor" @click="setUnderLine()" v-bind:class="{ 'font_at_active':isUnder==true}">
          <svg width="24px" height="24px" viewBox="0 0 24 24">
            <defs></defs>
            <g id="Properties-bar---Underline" stroke="none" stroke-width="1" fill-rule="evenodd">
              <path d="M5,21 L19,21 L19,19 L5,19 L5,21 Z M16,3 L16,10.9924559 C16,13.2039831 14.2052968,15 12,15 C9.78850042,15 8,13.2105736 8,10.9924559 L8,3 L6,3 L6,10.9924559 C6,14.3149115 8.68369912,17 12,17 C15.3101941,17 18,14.3082251 18,10.9924559 L18,3 L16,3 Z"
                id="Combined-Shape"></path>
            </g>
          </svg>
        </div>
      </div>
    </div>
    <div>
      <div>
        <span class="span_size">Size</span>
        <span class="span_value">{{fontSize}}</span>
      </div>
      <input type="range" min="6" max="120" step="1" v-model="fontSize">
    </div>
    <div>
      <div>
        <span class="span_size">Font Weight</span>
        <span class="span_value">{{fontWeight}}</span>
      </div>
      <input type="range" min="100" max="1000" step="50" v-model="fontWeight">
    </div>
    <div>
      <div>
        <span class="span_size">Line Height</span>
        <span class="span_value">{{lineHeight}}</span>
      </div>
      <input type="range" min="0.5" max="5" step="0.1" v-model="lineHeight">
    </div>
    <div>
      <div>
        <span class="span_size">Letter Spacing</span>
        <span class="span_value">{{letterSpacing}}</span>
      </div>
      <input type="range" min="-10" max="10" step="0.2" v-model="letterSpacing">
    </div>
  </div>

</template>
<script>
import {hasConfigVariable,getConfigVariable,InitStyleWithConfigVariable } from '../../utility/editUtility.js'
import * as properties from '../../properties';
import Vue from 'vue'
import { mapGetters , mapState } from 'vuex';

export default ({
  name: 'textSetting',
  computed: {
     ...mapState(['config','isSettingAvailable','settingInfo'])
  },
  props:['info'],
  components: {
  },
  methods: {
    showTextSize:function(e,s) {

    },
    setAlign:function(align_mode) {
      this.currentAlign = align_mode;
    },
    setTrans:function(trans_mode) {
      if(this.currentTrans == trans_mode) {
        this.currentTrans = "capitalize";
        return;
      }
      this.currentTrans = trans_mode;
    },
    setUnderLine:function() {
      this.isUnder = !this.isUnder;
    }
  },
    mounted() {
      if(this.settingInfo.element) {
        this.style = this.settingInfo.element.styles;
        if(this.style.hasOwnProperty("text-align")) {
          this.currentAlign = this.style["text-align"];
        }
        if(this.style.hasOwnProperty("text-transform")) {
          this.currentTrans = this.style["text-transform"];
        }
        if(this.style.hasOwnProperty("font-size")) {
          this.fontSize = parseInt(this.style["font-size"]);
        }
        if(this.style.hasOwnProperty("line-height")) {
          this.lineHeight = parseFloat(this.style["line-height"]);
        }
        if(this.style.hasOwnProperty("letter-spacing")) {
          this.letterSpacing = parseFloat(this.style["letter-spacing"]);
        }
        if(this.style.hasOwnProperty("font-weight")) {
          this.fontWeight = parseInt(this.style["font-weight"]);
        }
      }
    },
    watch: {
      "fontSize": function() {
        this.style["font-size"] = this.fontSize + "px";
      },
      "fontWeight": function() {
        this.style["font-weight"] = this.fontWeight.toString();
      },
      "lineHeight": function() {
        this.style["line-height"] = this.lineHeight + "em";
      },
      "letterSpacing": function() {
        this.style["letter-spacing"] = this.letterSpacing + "px";
      },
      "currentAlign": function() {
        this.style["text-align"] = this.currentAlign;
      },
      "currentTrans": function() {
          this.style["text-transform"] = this.currentTrans;
      },
      "isUnder": function() {
        if(this.isUnder) {
          this.style["text-decoration"] = "underline";
        }else {
          this.style["text-decoration"] = "none";
        }
      },
      "style":function() {

      }
    },
  data: function () {
    return {
      currentAlign:"",
      currentTrans:"",
      isUnder:false,
      fontSize:10,
      lineHeight:1,
      letterSpacing:0,
      fontWeight:300,
      style:{}
    }
  }
})

</script>

<style scoped>
  
  
  .text_panel>div {
    margin-bottom: 10px;
  }
  
  .at_panel {
    width: inherit;
    height: 30px;
  }
  
  .at_panel>div {
    height: 30px;
    margin-right: 10px;
    display: inline-block;
  }
  
  .font_at_panel {
    position: relative;
    float: left;
    display: inline-block;
    fill: rgb(58, 69, 81);
    padding: 2px;
    border-radius: 2px 2px 0px 0px;
  }
  
  .font_at_active {
    background-color: rgb(58, 69, 81);
    fill: white;
  }
  
  input[type=range] {
    /*removes default webkit styles*/
    -webkit-appearance: none;
    /*fix for FF unable to apply focus style bug */
    border: 1px solid white;
    /*required for proper track sizing in FF*/
    width: 100%;
  }
  
  input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 5px;
    background: #ddd;
    border: none;
    border-radius: 3px;
  }
  
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    border: none;
    height: 14px;
    width: 14px;
    border-radius: 50%;
    background: rgb(58, 69, 81);
    margin-top: -4px;
  }
  
  input[type=range]:focus {
    outline: none;
  }
  
  input[type=range]:focus::-webkit-slider-runnable-track {
    background: #ccc;
  }
  
  input[type=range]::-moz-range-track {
    width: 100%;
    height: 5px;
    background: #ddd;
    border: none;
    border-radius: 3px;
  }
  
  input[type=range]::-moz-range-thumb {
    border: none;
    height: 14px;
    width: 14px;
    border-radius: 50%;
    background: rgb(58, 69, 81);
  }
  /*hide the outline behind the border*/
  
  input[type=range]:-moz-focusring {
    outline: 1px solid white;
    outline-offset: -1px;
  }
  
  input[type=range]::-ms-track {
    width: 100%;
    height: 5px;
    /*remove bg colour from the track, we'll use ms-fill-lower and ms-fill-upper instead */
    background: transparent;
    /*leave room for the larger thumb to overflow with a transparent border */
    border-color: transparent;
    border-width: 6px 0;
    /*remove default tick marks*/
    color: transparent;
  }
  
  input[type=range]::-ms-fill-lower {
    background: #777;
    border-radius: 10px;
  }
  
  input[type=range]::-ms-fill-upper {
    background: #ddd;
    border-radius: 10px;
  }
  
  input[type=range]::-ms-thumb {
    border: none;
    height: 14px;
    width: 14px;
    border-radius: 50%;
    background: rgb(58, 69, 81);
  }
  
  input[type=range]:focus::-ms-fill-lower {
    background: #888;
  }
  
  input[type=range]:focus::-ms-fill-upper {
    background: #ccc;
  }
</style>