<template>
    <div id="setting_panel" class="setting_panel" v-bind:style="popupstyle">
        <!--<div class="cedit_header">
            <span @click="closePopUp($event)" class="rightClose pointer_cursor">x</span>
        </div>-->
        <!--<div class="cedit_body">
            <customcolorpicker></customcolorpicker>
        </div>-->
        <div class="toolbar">
            <div v-if="settingInfo.type=='text_widget' || settingInfo.type=='button_widget'" class="toolbar_item pointer_cursor" @click="openSetting('text')"
                v-bind:class="{ 'toolbar_active':currentTab=='text'}">
                <div class="toolbar_item_icon">
                    <svg viewBox="0 0 18 18">
                        <polygon points="18 0 10 0 8 0 0 0 0 2 8 2 8 18 10 18 10 2 18 2 18 0"></polygon>
                    </svg>
                </div>
            </div>
            <div class="toolbar_item pointer_cursor" @click="openSetting('color')" v-bind:class="{ 'toolbar_active':currentTab=='color'}">
                <div class="toolbar_item_icon">
                    <svg viewBox="0 0 18 18">
                        <path d="M9,0A9,9,0,0,0,9,18a1.53,1.53,0,0,0,1.5-1.5,1.28,1.28,0,0,0-.4-1C9.9,15.2,9.7,15.4,9.7,15c0-.8.7-1,1.5-1H13c2.8,0,5-2.7,5-5.5C18,4.1,14,0,9,0ZM3.5,9a1.5,1.5,0,0,1,0-3A1.5,1.5,0,1,1,3.5,9Zm3-4A1.54,1.54,0,0,1,5,3.5,1.54,1.54,0,0,1,6.5,2,1.53,1.53,0,0,1,8,3.5,1.54,1.54,0,0,1,6.5,5Zm5,0A1.54,1.54,0,0,1,10,3.5a1.5,1.5,0,0,1,3,0A1.54,1.54,0,0,1,11.5,5Zm3,4A1.54,1.54,0,0,1,13,7.5a1.5,1.5,0,0,1,3,0A1.54,1.54,0,0,1,14.5,9Z"></path>
                    </svg>
                </div>
            </div>
            <div v-if="settingInfo.type=='image_widget'" class="toolbar_item pointer_cursor" @click="openSetting('image')" v-bind:class="{ 'toolbar_active':currentTab=='image'}">
                <div class="toolbar_item_icon">
                    <svg viewBox="0 0 18 18">
                        <path d="M18,7.51l-2.29-.43a7.63,7.63,0,0,0-.82-1.51L16,3.66h0L14.31,2h0L12.39,3.11a9.15,9.15,0,0,0-1.74-.72L10,0.05V0H7.51L7.08,2.29a7.63,7.63,0,0,0-1.51.82L3.66,2h0L2,3.69H2L3.11,5.61A7.28,7.28,0,0,0,2.4,7.08l-2.34.43H0v2.93H0l2.28,0.43a7.68,7.68,0,0,0,.83,1.52L2,14.31H2L3.86,16H3.76l1.86-1.12a7,7,0,0,0,1.48.73L7.52,18v0h2.93l0.43-2.28a7.68,7.68,0,0,0,1.52-.83L14.31,16h0L16,14.14v0.1l-1.12-1.86a7,7,0,0,0,.74-1.53L18,10.43h0V7.51h0ZM9,13a4,4,0,1,1,4-4A4,4,0,0,1,9,13Z"></path>
                    </svg>
                </div>
            </div>
            <div class="toolbar_item pointer_cursor" @click="openSetting('effect')" v-bind:class="{ 'toolbar_active':currentTab=='effect'}">
                <div class="toolbar_item_icon">
                    <svg viewBox="0 0 20 18">
                        <path d="M0,9L2,8l8,4,8-4,2,1L10,14ZM0,5L10,0,20,5,10,10ZM10,2L4,5l6,3,6-3Zm0,14,8-4,2,1L10,18,0,13l2-1Zm0,0"></path>
                    </svg>
                </div>
            </div>
            <div class="toolbar_item pointer_cursor" @click="openSetting('attach')" v-bind:class="{ 'toolbar_active':currentTab=='attach'}">
                <div class="toolbar_item_icon">
                    <svg viewBox="0 0 18 18">
                        <path d="M7.94,12.18L6.53,10.77,7.94,9.35l1.41,1.41a1,1,0,0,0,1.41,0l4.95-4.95a1,1,0,0,0,0-1.41L13.6,2.28a1,1,0,0,0-1.41,0L10.06,4.4,8.65,3l2.12-2.12A3,3,0,0,1,15,.87L17.13,3a3,3,0,0,1,0,4.24l-4.95,4.95A3,3,0,0,1,7.94,12.18Z"></path>
                        <path d="M3,17.13L0.87,15a3,3,0,0,1,0-4.24L5.82,5.82a3,3,0,0,1,4.24,0l1.41,1.41L10.06,8.65,8.65,7.23a1,1,0,0,0-1.41,0L2.28,12.18a1,1,0,0,0,0,1.41L4.4,15.72a1,1,0,0,0,1.41,0L7.94,13.6,9.35,15,7.23,17.13A3,3,0,0,1,3,17.13Z"></path>
                    </svg>
                </div>
            </div>
            <div class="toolbar_item pointer_cursor" @click="openSetting('transition')" v-bind:class="{ 'toolbar_active':currentTab=='transition'}">
                <div class="toolbar_item_icon">
                    <svg viewBox="0 0 20 18">
                        <path d="M20,0H0V18H20V0ZM14,2h4V4H14V2ZM8,2h4V4H8V2ZM6,16H2V14H6v2ZM6,4H2V2H6V4Zm6,12H8V14h4v2ZM8,12.09V5.92L13.34,9ZM14,16V14h4v2H14Zm-0.28.11"></path>
                    </svg>
                </div>
            </div>
            <div class="toolbar_item pointer_cursor" @click="openSetting('delete')" v-bind:class="{ 'toolbar_active':currentTab=='delete'}">
                <div class="toolbar_item_icon">
                    <svg viewBox="0 0 18 18">
                        <path d="M15,1H11V0H6V1H2V3H3V18H14V3h1V1ZM5,16V7H6v9H5Zm3,0V7H9v9H8Zm4,0H11V7h1v9ZM5,5V4h7V5H5Z"></path>
                    </svg>
                </div>
            </div>
        </div>
        <div v-show="currentTab!='' && currentTab!='delete'" class="main_body">
            <div class="cedit_header">
                <span> {{currentTab}}</span>
            </div>
            <div class="cedit_body">
                <div v-bind:is="getCustomSetting()" v-bind:info="settingInfo"></div>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue'
import { mapGetters , mapState } from 'vuex';
import colorSetting from './ColorSetting';
import imageSetting from './ImageSetting';
import textSetting from './TextSetting';
import transitionSetting from './TransitionSetting';
import attachSetting from './AttachSetting';

export default {
  name: 'popup',
  computed: {
     ...mapState(['config','isSettingAvailable','settingInfo'])
  },
  components: {
      colorSetting,imageSetting,textSetting,transitionSetting,attachSetting
  },
  data: function () {
    return {
        popupstyle:"",
        currentTab:""
    }
  },
  created: function() {
  },
  mounted: function () {
      if(this.config.behaviour.hasOwnProperty("edit_popup")) {
          this.popupstyle = this.config.behaviour.edit_popup.styles;
      }
  },
  watch:{
      config:function() {
          if(this.config.hasOwnProperty("edit_popup")) {
                this.popupstyle = this.config.behaviour.edit_popup.styles;
            }
      },
      settingInfo:function() {
      },
      isSettingAvailable:function() {

      }
  },
  methods: {
      openSetting:function(tab) {
          this.currentTab = tab;
          if(tab=="delete") {
              this.removeElement();
          }
      },
      getCustomSetting:function() {
          if(this.currentTab!="" && this.currentTab!="delete") {
              return this.currentTab + "Setting";
          }
      },
      removeElement:function() {
          if(this.settingInfo.parentElements) {
              var p_elements = this.settingInfo.parentElements.elements;
              var index =p_elements.indexOf(this.settingInfo.element);
              p_elements.splice(index,1);
              this.currentTab="";
          }
      }
  },
  watch: {
      currentTab:function() {

      }
  }
}
</script>

<style>
    #setting_panel {
        font-family: "Roboto,Helvetica,Arial,sans-serif";
    }
    
    .toolbar {
        box-shadow: 0px 1px 1px 1px rgba(0, 0, 0, .13);
        background: #fff;
        height: 40px;
    }
    
    .toolbar_item_icon {
        width: 18px;
        height: 18px;
        left: 50%;
        margin: 0 -50% 0 0;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
    }
    
    .toolbar_item {
        fill: rgb(58, 69, 81);
        position: relative;
        float: left;
        display: inline-block;
        width: 40px;
        height: 40px;
        border-radius: 2px 2px 0px 0px;
    }
    
    .toolbar_active {
        background-color: rgb(58, 69, 81);
        fill: white;
    }
    /*.toolbar_item:hover {
        background-color: rgba(223, 224, 230, .6);
    }*/
    
    .main_body {
        width: 100%;
        background: #fff;
        margin-top: 15px;
        box-shadow: 0px 1px 1px 1px rgba(0, 0, 0, .13);
    }
    
    .cedit_header {
        background-color: rgba(223, 224, 230, .6);
        padding-top: 8px;
        padding-bottom: 8px;
        padding-left: 15px;
    }
    
    .cedit_header span {
        color: rgb(58, 69, 81);
        font-size: 15px;
        text-transform: uppercase;
    }
    
    .rightClose {
        float: right;
    }
    
    .cedit_body {
        padding: 20px;
    }
    
    .cedit_body span {
        color: rgb(58, 69, 81);
        font-size: 15px!important;
    }
    
    .span_size {
        float: left;
    }
    
    .span_value {
        float: right;
    }
    
    .attach-url-text {
        width: 100%;
        height: 20px;
        border: none;
        border-bottom: 1px solid;
        border-color: #919191;
        color: #9a9a9a;
    }
    
    .attach-url-text:focus {
        outline: none;
    }
</style>