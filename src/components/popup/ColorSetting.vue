<template>
    <div class="colorsetting">
        <div class="colorpick">
            <div>
                <span class="colortitle">Color:</span>
                <div class="pointer_cursor colorpanel" ref="color_div" v-bind:style="getBackgroundStyle(color)" @click="sketchOpen('color', $event)"></div>
                <span class="pointer_cursor transparent" v-bind:class="{'transparent-value': is_color_transparent}" v-on:click="setTransparentMode('color')">Transparent</span>
            </div>
            </br>
            <div>
                <span class="colortitle">Background:</span>
                <div class="pointer_cursor colorpanel" ref="bcolor_div" v-bind:style="getBackgroundStyle(background)" @click="sketchOpen('background', $event)"></div>
                <span class="pointer_cursor transparent" v-bind:class="{'transparent-value': is_bgcolor_transparent}" v-on:click="setTransparentMode('bgcolor')">Transparent</span>
            </div>
        </div>
        <div class="range">
            <div>
                <span class="span_size">Opacity</span>
                <span class="span_value">{{opacity*100}}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.01" v-model="opacity">
        </div>
        <div>
            <div>
                <span class="span_size">Border</span>
                <span class="span_value">{{border_size}}px</span>
            </div>
            <div>
                <input class="border-range f-left" type="range" min="0" max="50" step="1" v-model="border_size">
                <div class="pointer_cursor colorpanel f-right" ref="bordercolor_div" v-bind:style="getBackgroundStyle(border_color)" @click="sketchOpen('bordercolor', $event)"></div>
            </div>
            <div>
                <div class="border-type" v-on:click="setBorderType('solid')" v-bind:class="{ 'selected-border':border_type=='solid'}">
                    <div class="solid-border"></div>
                </div>
                <div class="border-type" v-on:click="setBorderType('dashed')" v-bind:class="{ 'selected-border':border_type=='dashed'}">
                    <div class="dashed-border"></div>
                </div>
            </div>
        </div>
        <div class="range">
            <div>
                <span class="span_size">Border Radius</span>
                <span class="span_value">{{current_radius}}px</span>
            </div>
            <div>
                <div id="radius-selection" class="pointer_cursor">
                    <div class="radius-class">
                        <div class="tl-radius" @click="selectCurrentRadiusCorner('tl')" v-bind:class="{ 'selected-radius':current_radius_corner=='tl'}"></div>
                        <div class="tr-radius" @click="selectCurrentRadiusCorner('tr')" v-bind:class="{ 'selected-radius':current_radius_corner=='tr'}"></div>
                    </div>
                    <div class="radius-class">
                        <div class="bl-radius" @click="selectCurrentRadiusCorner('bl')" v-bind:class="{ 'selected-radius':current_radius_corner=='bl'}"></div>
                        <div class="br-radius" @click="selectCurrentRadiusCorner('br')" v-bind:class="{ 'selected-radius':current_radius_corner=='br'}"></div>
                    </div>
                </div>
                <input class="radius-range" type="range" min="0" max="200" step="1" v-model="current_radius">
            </div>
        </div>
        <div class="shadow-panel">
            <div>
                <span class="span_size">Shadow</span>
                <span class="span_value">{{shadow_size}}px</span>
            </div>
            <div>
                <input class="border-range f-left" type="range" min="-50" max="50" step="1" v-model="shadow_size">
                <div class="pointer_cursor colorpanel f-right" ref="shadowcolor_div" v-bind:style="getBackgroundStyle(shadow_color)" @click="sketchOpen('shadowcolor', $event)"></div>
            </div>
        </div>
        <sketch v-if="sketchOpend" v-bind:style="getSketchStyle()" v-model="sketchColors" v-on-click-outside="cancelColorSketch"></sketch>

    </div>
</template>

<script>
import Vue from 'vue';
import { Sketch } from 'vue-color';
import { mapGetters , mapState } from 'vuex';
import { hasConfigVariable,getConfigVariable,InitStyleWithConfigVariable } from '../../utility/editUtility.js'
import { parseRadiusCorner , parseBorderValues , parseShadowValues ,replaceShadow } from '../../utility/parseUtility.js';

export default {
  name: 'colorSetting',
  props:['info'],
  computed: {
     ...mapState(['config','isSettingAvailable'])
  },
  components: {
      Sketch
  },
  data: function () {
    return {
        is_bgcolor_transparent: false,
        is_color_transparent:false ,
        color:"#ffffff",
        background:"#ffffff",
        colorConfigName:"",
        backgroundConfigName:"",
        opacity:1,
        blur:0,
        current_radius:0,
        radius_tl:0,
        radius_tr:0,
        radius_bl:0,
        radius_br:0,
        current_radius_corner:"tl",
        sketch_title:"",
        sketchOpend:false,
        sketch_x:0,
        style_x:{},
        sketch_y:0,
        border_size:0,
        border_type:"solid",
        border_color:"#000000",
        shadow_size:0,
        shadow_color:"#000000",
        sketchColors:{
            hex:'#000000',
            rgba: {
                r: 255,
                g: 255,
                b: 255,
                a: 1
            }
        }
    }
  },
  created: function() {
    
  },
  mounted: function () {
    this.initColors();
    this.initFilters();
    this.initRadius();
    this.initBorders();
    this.initShadows();
    this.selectCurrentRadiusCorner("tl");
  },
  watch:{
      info:function() {
          this.sketchOpend = false;
          this.initColors();
      },
      config:function() {
      },
      sketchColors:function() {
          this.selectColorSketch();
      },
      opacity:function() {
          this.style["opacity"] = this.opacity;
      },
      border_color: function() {
          this.style["border"] = this.border_size + "px " + this.border_type + " " + this.border_color;
      },
      border_size: function() {
          this.style["border"] = this.border_size + "px " + this.border_type + " " + this.border_color;
      },
      border_type: function() {
          this.style["border"] = this.border_size + "px " + this.border_type + " " + this.border_color;
      },
      shadow_color: function() {
          this.style["box-shadow"] = replaceShadow(this.style["box-shadow"] , this.shadow_color , this.shadow_size);
      },
      shadow_size: function() {
          this.style["box-shadow"] = replaceShadow(this.style["box-shadow"] , this.shadow_color , this.shadow_size);
      },
      current_radius:function() {
          switch(this.current_radius_corner) {
            case "tl":
                this.radius_tl = this.current_radius;
                break;
            case "tr":
                this.radius_tr = this.current_radius;
                break;
            case "bl":
                this.radius_bl = this.current_radius;
                break;
            case "br":
                this.radius_br = this.current_radius;
                break;
          }
          this.style["border-radius"] = this.radius_tl + "px " + this.radius_tr + "px " + this.radius_br + "px " + this.radius_bl + "px";
      }
  },
  methods: {
      initColors: function() {
          this.style = this.info.element.styles;
          if(this.style.hasOwnProperty("color")) {
              this.colorConfigName = this.style["color"];
              if(hasConfigVariable(this.colorConfigName)) {
                 this.color = getConfigVariable(this.colorConfigName,this.config);
              } else {
                 this.color = this.colorConfigName;
              }
              if(this.color.includes("transparent")) {
                  this.is_color_transparent = true;
                  this.color = "#ffffff";
              }
          }else {
              this.style["color"] = this.color;
          }
          if(this.style.hasOwnProperty("background-color")) {
              this.backgroundConfigName = this.style["background-color"];
              if(hasConfigVariable(this.backgroundConfigName)) {
                  this.background = getConfigVariable(this.backgroundConfigName,this.config);
              } else {
                  this.background = this.backgroundConfigName;
              }
              if(this.background.includes("transparent")) {
                  this.is_bgcolor_transparent = true;
                  this.background = "#ffffff";
              }
          }else {
              this.style["background-color"] = this.background;
          }
      },
      initFilters:function() {
        if(this.style.hasOwnProperty("opacity")) {
          this.opacity = parseFloat(this.style["opacity"]).toFixed(2);
        }
      },
      initRadius: function() {
        this.radius_tl = parseRadiusCorner(this.style,"tl");
        this.radius_tr = parseRadiusCorner(this.style,"tr");
        this.radius_bl = parseRadiusCorner(this.style,"bl");
        this.radius_br = parseRadiusCorner(this.style,"br");
      },
      initBorders: function() {
        if(this.style.hasOwnProperty("border")) {
            let border = parseBorderValues(this.style["border"]);
            this.border_size = border["size"];
            this.border_type = border["type"];
            this.border_color = border["color"];
        }else {
            this.style["border"] = "0px soild #000000";
        }
      },
      initShadows: function() {
          if(this.style.hasOwnProperty("box-shadow")) {
              let shadow = parseShadowValues(this.style["box-shadow"]);
              this.shadow_size = shadow["size"];
              this.shadow_color = shadow["color"];
          }else {
              this.style["box-shadow"] = "0px 0px 0px 0px #000000"
          }
      },
      getBackgroundStyle: function(color) {
          let style={};
          style["background-color"] = color;
          return style;
      },
      getSketchStyle: function() {
          let style={};
          if(this.sketchOpend) {
              style["position"] = "absolute!important";
              style["left"] = this.sketch_x.toString() + "px" + "!important";
              style["top"] = (this.sketch_y + 30).toString() + "px" + "!important";
          }
          return style;
      },
      setBorderType: function(type) {
          this.border_type = type;
      },
      setTransparentMode: function(mode) {
          if(mode == 'color') {
              if(this.is_color_transparent) {
                this.is_color_transparent = false;
                this.setColor(this.color);
              }else {
                this.is_color_transparent = true;
                this.setColor('transparent');
              }
          }else if(mode == 'bgcolor') {
              if(this.is_bgcolor_transparent) {
                this.is_bgcolor_transparent = false;
                this.setBackgroundColor(this.background);
              }else {
                this.is_bgcolor_transparent = true;
                this.setBackgroundColor('transparent');
              }
          }
      },
      selectCurrentRadiusCorner: function(corner) {
          this.current_radius_corner = corner;
          switch(corner) {
            case "tl":
                this.current_radius = this.radius_tl;
                break;
            case "tr":
                this.current_radius = this.radius_tr;
                break;
            case "bl":
                this.current_radius = this.radius_bl;
                break;
            case "br":
                this.current_radius = this.radius_br;
                break;
          }
      },
      sketchOpen: function(colorType,event) {
          event.stopPropagation();
          switch(colorType) {
              case "color":
                this.is_color_transparent = false;
                this.sketch_title = "Color";
                this.sketch_x = this.$refs.color_div.offsetLeft;
                this.sketch_y = this.$refs.color_div.offsetTop;
                this.hexToRGB(this.color);
                break;
              case "background":
                this.is_bgcolor_transparent = false;
                this.sketch_title = "Background";
                this.sketch_x = this.$refs.bcolor_div.offsetLeft;
                this.sketch_y = this.$refs.bcolor_div.offsetTop;
                this.hexToRGB(this.background);
                break;
             case "bordercolor":
                this.sketch_title = "Border";
                this.sketch_x = this.$refs.bordercolor_div.offsetLeft;
                this.sketch_y = this.$refs.bordercolor_div.offsetTop;
                this.hexToRGB(this.border_color);
                break;
            case "shadowcolor":
                this.sketch_title = "Shadow";
                this.sketch_x = this.$refs.shadowcolor_div.offsetLeft;
                this.sketch_y = this.$refs.shadowcolor_div.offsetTop;
                this.hexToRGB(this.shadow_color);
                break;
          }
          this.sketchOpend = true;
      },
      cancelColorSketch: function() {
          this.sketchOpend = false;
      },
      setColor: function(value) {
        if(hasConfigVariable(this.colorConfigName)) {
            var param = {};
            param.key = this.colorConfigName;
            param.value = value;
            this.$store.commit('setConfigVariable',param);
        }else {
            this.style["color"] = value;
        }
      },
      setBackgroundColor: function(value) {
        if(hasConfigVariable(this.backgroundConfigName)) {
            var param = {};
            param.key = this.backgroundConfigName;
            param.value = value;
            this.$store.commit('setConfigVariable',param);
        }else {
            this.style["background-color"] = value;
        }
      },
      selectColorSketch: function() {
          //this.sketchOpend = false;
          switch(this.sketch_title) {
              case "Color":
                this.color = this.sketchColors.hex;
                this.setColor(this.color);
                break;
              case "Background":
                this.background = this.sketchColors.hex;
                this.setBackgroundColor(this.background);
                break;
              case "Border":
                this.border_color = this.sketchColors.hex;
                break;
              case "Shadow":
                this.shadow_color = this.sketchColors.hex;
                break;
              default:
                break;
          }
      },
      hexToRGB: function(value) {
        let hex = value.replace('#','');
        let r = parseInt(hex.substring(0,2), 16);
        let g = parseInt(hex.substring(2,4), 16);
        let b = parseInt(hex.substring(4,6), 16);
        this.sketchColors.hex = value;
        this.sketchColors.rgba.r = r;
        this.sketchColors.rgba.g = g;
        this.sketchColors.rgba.b = b;
      }
  }
}
</script>

<style scoped>
    .solid-border {
        border: 2px solid rgb(58, 69, 81);
    }
    
    .dashed-border {
        border: 2px dashed rgb(58, 69, 81);
    }
    
    .border-type {
        display: inline-block;
        width: 42px;
        height: 30px;
        text-align: center;
        margin-top: 12px;
        margin-bottom: 12px;
        cursor: pointer;
        border-radius: 2px 2px 2px 2px;
    }
    
    .border-type>div {
        display: inline-block;
        margin: 4px;
        width: 30px;
        height: 18px;
    }
    
    .transparent-value {
        color: #6678ff;
    }
    
    #radius-selection {
        display: inline-block;
    }
    
    .radius-class>div {
        display: inline-block;
        width: 16px;
        height: 16px;
        background-color: #f5f5f5;
    }
    
    .border-range,
    .shadow-range {
        margin-top: 6px;
        width: 160px!important;
    }
    
    .radius-range {
        margin-top: 13px;
        width: 160px!important;
        float: right!important;
    }
    
    .shadow-panel {
        width: inherit;
        height: 35px;
        margin-top: 12px;
        margin-bottom: 18px;
    }

    .selected-border {
        background-color: rgb(58, 69, 81)!important;
    }
    
    .selected-border>div {
        border-color: white!important;
    }
    
    .selected-radius {
        background-color: #6678ff!important;
    }
    
    .selected-transparent {
        color: #6678ff;
    }
    
    .tl-radius {
        border-radius: 10px 0px 0px 0px;
    }
    
    .tr-radius {
        border-radius: 0px 10px 0px 0px;
    }
    
    .bl-radius {
        border-radius: 0px 0px 0px 10px;
    }
    
    .br-radius {
        border-radius: 0px 0px 10px 0px;
    }
    
    .colorpick div {
        display: inline-block;
        margin-bottom: 10px;
    }
    
    .colorpick>div>span,
    input {
        float: left!important;
    }
    
    .colorsetting .range {
        width: inherit;
        height: 45px;
        margin-bottom: 10px;
    }
    
    .colorsetting .range>div {
        height: 22px;
        margin-bottom: 2px;
    }
    
    .colortitle {
        width: 90px!important;
        text-align: left;
        margin-right: 15px;
    }
    
    .colorpick>div>input {
        width: 70px!important;
        background: transparent;
        border-style: none;
        padding: 0px!important;
        outline: 0px!important;
    }
    
    .colorpick>div> div {
        float: left;
    }
    
    .button_group {
        display: inline-block;
        width: 100%;
        margin-top: 15px;
    }
    
    .colorpanel {
        display: inline-block;
        width: 20px;
        height: 20px;
        box-shadow: 2px 2px 2px #eeeaea;
    }
    
    .sketch_title {
        width: 100%;
        text-align: center;
        margin-top: 0px!important;
        margin-bottom: 10px!important;
    }
    
    span.transparent {
        margin-left: 15px;
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