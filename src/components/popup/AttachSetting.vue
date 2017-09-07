<template>
    <div class="attach">
        <div class="link-tabs">
            <span @click="setTab('messenger')" v-bind:class="{ 'selected-tab':current_tab=='messenger'}">Messenger</span>
            <span @click="setTab('link')" v-bind:class="{ 'selected-tab':current_tab=='link'}">Link</span>
            <span @click="setTab('view')" v-bind:class="{ 'selected-tab':current_tab=='view'}">View</span>
        </div>
        <div class="tab-body">
            <div ref="messenger_tab" v-if="current_tab=='messenger'">
                <div>
                    <div class="lux-flower-box"></div>
                    <span class="lux-flower-span">LuxFlowerBox </span>
                </div>
                <div class="lux-flower-detail">
                    users will be sent over to messenger and automatically opted-in
                </div>
            </div>
            <div ref="link_tab" v-if="current_tab=='link'">
                <input type="text" class="attach-url-text" v-model="link_url" @input="changeLinkUrl()" /> </br>
                <div class="link-description">enter the link to direct users to on click</div>
                <select class="attach-select" v-model="open_window_mode" @change="changeOpenMode()">
                    <option v-for="item in openMode" :value="item">{{item}}</option>
                </select>
                <div class="link-description">how would you like it to open?</div>
            </div>
            <div ref="view_tab" v-if="current_tab=='view'">
                <select class="attach-select" v-model="toggle_widget" @change="changeToggle()">
                    <option v-for="toggle in getWidgetArray" :value="toggle">{{toggle}}</option>
                </select>
                <div class="link-description">On click transition to this view</div>
            </div>
        </div>
    </div>
</template>
<script>
import { mapGetters , mapState } from 'vuex';
import {hasConfigVariable,getConfigVariable,InitStyleWithConfigVariable } from '../../utility/editUtility.js'
import * as properties from '../../properties';

export default ({
  name: 'attachSetting',
  props:['info'],
  computed: {
     ...mapGetters(['getWidgetArray'])
  },
  components: {
  },
  watch: {
      current_tab:function() {
          this.deleteAndInitAttachedInfo();
      }
  },
  methods: {
    setTab:function(tab) {
        this.current_tab = tab;
    },
    addDefaultAction:function() {
        var ditems = [];
        var item = {};
        switch(this.current_tab) {
            case "link":
                ditems[0] = "http://";
                ditems[1] = "_blank";
                ditems[2] = "width=500,height=800";
                item["openUrl"] = ditems;
                this.link_url = ditems[0];
                this.open_window_mode = ditems[1];
                this.clickAction.push(item);
                break;
            case "messenger":
                ditems[0] = "_blank";
                ditems[1] = "width=500,height=800";
                item["openChat"] = ditems;
                this.clickAction.push(item);
                break;
            case "view":
                for(var i=0;i<this.getWidgetArray.length;i++) {
                    var vitem = {};
                    var varray = [];
                    varray[0] =  this.getWidgetArray[i];
                    if(i==0) {
                        varray[1] = true;
                        this.toggle_widget = varray[0];
                    } 
                    varray[2] = 0;
                    vitem["viewToggle"] = varray;
                    this.clickAction.push(vitem);
                }
                break;
        }
        
    },
    changeLinkUrl:function() {
        for(var i=0;i<this.clickAction.length;i++) {
            if(this.clickAction[i].hasOwnProperty("openUrl")) {
                var openUrl = this.clickAction[i]["openUrl"];
                openUrl[0] = this.link_url;
            }
        }
    },
    changeOpenMode:function() {
        for(var i=0;i<this.clickAction.length;i++) {
            if(this.clickAction[i].hasOwnProperty("openUrl")) {
                var openUrl = this.clickAction[i]["openUrl"];
                openUrl[1] = this.open_window_mode;
            }
        }
    },
    changeToggle:function() {
        for(var i=0;i<this.clickAction.length;i++) {
            if(this.clickAction[i].hasOwnProperty("viewToggle")) {
                var openUrl = this.clickAction[i]["viewToggle"];
                if(openUrl[0] == this.toggle_widget) {
                    openUrl[1] = true;
                }else {
                    openUrl[1] = false;
                }
            }
        }
    },
    deleteAndInitAttachedInfo:function() {
        var isTabExist = false;
        if(Array.isArray(this.clickAction)) {
            for(var i=this.clickAction.length-1;i>=0;i--) {
                var item = this.clickAction[i];
                switch(this.current_tab) {
                    case "link":
                        if(item.hasOwnProperty("openChat") || item.hasOwnProperty("viewToggle")) {
                            this.clickAction.splice(i,1);
                        }
                        if(item.hasOwnProperty("openUrl")) {
                            isTabExist = true;
                        }
                        break;
                    case "messenger":
                        if(item.hasOwnProperty("openUrl") ||  item.hasOwnProperty("viewToggle")) {
                            this.clickAction.splice(i,1);
                        }
                        if(item.hasOwnProperty("openChat")) {
                            isTabExist = true;
                        }
                        break;
                    case "view":
                        if(item.hasOwnProperty("openUrl") || item.hasOwnProperty("openChat")) {
                            this.clickAction.splice(i,1);
                        }
                        if(item.hasOwnProperty("viewToggle")) {
                            isTabExist = true;
                        }
                        break;
                    case "none":
                        if(item.hasOwnProperty("openUrl") || item.hasOwnProperty("openChat") || item.hasOwnProperty("viewToggle")) {
                            this.clickAction.splice(i,1);
                        }
                        break;
                }
                
            }
        }
        if(!isTabExist) {
            this.addDefaultAction();
        }
    }
  },
  mounted() {
    if(this.info.element.hasOwnProperty("actions")) {
        this.actions = this.info.element["actions"];
        if(this.actions.hasOwnProperty("click")) {
            this.clickAction = this.actions["click"];
            if(this.clickAction.length>0) {
                for(var i=0;i<this.clickAction.length;i++) {
                    var item = this.clickAction[i];
                    if(item.hasOwnProperty("openUrl")) {
                        this.current_tab = "link";
                        var linkItem = item["openUrl"];
                        this.link_url = linkItem[0];
                        this.open_window_mode = linkItem[1];
                        
                        break;
                    } else if(item.hasOwnProperty("openChat")) {
                        this.current_tab = "messenger";
                        break;
                    } else if(item.hasOwnProperty("viewToggle")) {
                        this.current_tab = "view";
                        var viewItem = item["viewToggle"];
                        if(viewItem[1]==true) {
                            this.toggle_widget = viewItem[0];
                            break;
                        }
                    }
                }
            }else {
                this.current_tab = "none";
            }
        } else {
            this.actions["click"] = [];
            this.clickAction = this.actions["click"];
        }
    } else {
        this.info.element["actions"] = {};
        this.actions = this.info.element["actions"];
        this.actions["click"] = [];
        this.clickAction = this.actions["click"];
    }
  },
  data: function () {
    return {
        current_tab:"none",
        openMode:["_blank","_self","_parent","_top"],
        actions:{},
        clickAction:[],
        link_url:"",
        open_window_mode:"_blank",
        toggle_widget:""
    }
  }
})

</script>

<style scoped>
    .attach-select {
        width: 100%;
        margin-top: 20px;
        height: 30px;
        background: rgba(223, 224, 230, .6);
        border: none;
        padding-left: 10px;
    }
    
    .link-tabs {
        display: inline-block;
        margin-left: auto;
        margin-right: auto;
    }
    
    .link-tabs>span {
        margin-right: 25px;
        cursor: pointer;
    }
    
    .link-description {
        margin-top: 5px;
        font-size: 11px;
        color: #9a9a9a;
    }
    
    .selected-tab {
        color: #6678ff;
    }
    
    .tab-body {
        margin-top: 20px;
    }
    
    .lux-flower-box {
        float: left;
        width: 20px;
        height: 20px;
        background-size: 20px 20px;
        -webkit-box-shadow: 0 1px 1px 0 rgba(111, 111, 111, .2);
        -moz-box-shadow: 0 1px 1px 0 rgba(111, 111, 111, .2);
        box-shadow: 0 1px 1px 0 rgba(111, 111, 111, .2);
        line-height: 20px;
        color: #fff;
        font-size: 12px;
        -webkit-border-radius: 12px 12px 12px 12px;
        -moz-border-radius: 12px 12px 12px 12px;
        border-radius: 12px 12px 12px 12px;
        opacity: 1;
        background-image: url('https://assets.modernapp.co/assets/images/fb-messenger-icon.png')
    }
    
    .lux-flower-span {
        color: #9a9a9a;
        margin-left: 10px;
    }
    
    .lux-flower-detail {
        width: 180px;
        margin-left: 5px;
        margin-top: 15px;
        color: #9a9a9a;
        font-size: 11px;
    }
</style>