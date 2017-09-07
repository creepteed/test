<template>
  <vue-draggable-resizable v-bind:style="getResizeStyles()" v-bind:w="width" v-bind:h="height" v-bind:x="x" v-bind:y="y" v-bind:hdirect="hdirect" v-bind:vdirect="vdirect"
    v-bind:type="type" v-bind:minw="minw" v-bind:minh="minh" v-bind:elements="elements" v-bind:parentElements="parentElements" :parent="false" v-bind:pos="position"
    v-bind:resizable="getDisabledControlStatus('resize')" v-bind:draggable="getDisabledControlStatus('drag')" v-bind:rotatable="getDisabledControlStatus('rotate')" :handles=getEnabledHandle()>
    <div :id="elements.id" v-bind:style="getStyles()" v-bind:class="getAnimationClass()" class="relative-position fill-parent"></div>
  </vue-draggable-resizable>
</template>
<script>
import { mapGetters , mapState } from 'vuex';
import { InitStyleWithConfigVariable,generateUniqueId,removePositionInfo,getDisplayInfo,getAnimationClass,getEnabledHandles} from '../utility/editUtility.js';
import { getResizeWidth,getResizeHeight,getResizeLeft,getResizeTop} from '../utility/parseUtility.js'

export default ({
  props:['elements','widgetProps','parentElements'],
  computed: mapState({
    isSettingAvailable: state => state.isSettingAvailable,
    config: state => state.config,
    client_mode: state => state.client_mode,
    show_controls: state => state.show_controls
  }),
  methods: {
    setCustomizePopup: function(event) {
    },
    setPositionInfo:function(styles) {
      this.width = getResizeWidth(this.$parent,styles,this.config, this.show_controls);
      this.height = getResizeHeight(this.$parent,styles,this.config, this.show_controls);
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
    getAnimationClass:function() {
      return getAnimationClass(this.elements);
    },
    getEnabledHandle() {
      return getEnabledHandles("background",this.client_mode,this.elements);
    },
    getResizeStyles:function() {
      return getDisplayInfo(this.elements.styles);
    },
    getStyles: function() {
      let styles = InitStyleWithConfigVariable(this.elements.styles,this.config);
      let resize_styles = removePositionInfo(styles);
      return resize_styles;
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
    }
  },
  mounted(){
    this.$nextTick(function() {
      this.setPositionInfo(this.elements.styles);
      this.position = this.elements.styles["position"];
      if(!this.elements.hasOwnProperty("id") || !this.elements["id"]) {
        this.elements["id"] = "bg_" + generateUniqueId();
      }
    });
  },
  watch:{
    elements:function() {

    }
  },
  data: function () {
    return {
      type:"bg_widget",
      width:50,
      height:50,
      x:0,
      y:0,
      minw:5,
      minh:5,
      hdirect:"left",
      vdirect:"top",
      position:'absolute'
    }
  }
})

</script>

<style scoped>

</style>