<template>
  <div id="builder">
    <widgets>
    </widgets>
  </div>
</template>

<script>
import Vue from 'vue'
import VueResource from 'vue-resource'

import { mapGetters , mapState } from 'vuex';

import Widgets from './components/Widgets'
import { directive as onClickOutside } from 'vue-on-click-outside' 
import { getCodeNumber , onDocumentExit } from './utility/editUtility.js'
import { getFbOptin,facebookInit } from './utility/facebookUtility.js'
import { isMobileDevice } from './utility/mobileUtility.js'
import { uniqid } from './utility/widgetUtility.js'

Vue.directive('on-click-outside', onClickOutside)
Vue.use(VueResource)

let default_param = {
  api: 'http://localhost:8000/get_widget.php'
}
let param = default_param
let resp = {}

export default {
  name: 'builder',
  components: {
    Widgets
    //Text
  },
  computed: mapState({
    config: state => state.config,
    info: state => state.info,
    isMobileDevice: state => state.isMobileDevice
  }),
  created: function() {
    var hash = new hashHandler();
    var me = this;

    function hashHandler() {
        var oldURL = "";

        var detect = function checkURLchange(currentURL) {
            if (currentURL != oldURL) {
                oldURL = currentURL;
                me.getJsonData(currentURL);
            }
        };

        oldURL = window.location.href;

        setInterval(function () {
            detect(window.location.href);
        }, 500);
    }

    // document.addEventListener('mouseleave',function() {
    //   onDocumentExit(me.$store);
    // });
    me.getJsonData(param.api);
  },
  mounted: function() {
    facebookInit(this.$store);
    if(isMobileDevice()) {
      this.$store.commit("setMobileDevice",true);
    }else {
      this.$store.commit("setMobileDevice",false);
    }

    let id = uniqid();
    if (id){
        this.$store.commit("setId", id);
    }

  },
  methods:{
    getJsonData: function (url) {
      this.$http.get(url,{},{
        headers: {
              "X-App-Token": "token"
           }
        }).then(  function (data) { 
            let response = data.data;
            this.$store.commit("setJsonData",response);
            this.ManageFormoptin();
        }).catch( (error) => console.log('Got a problem', error))
    },
    insertCheckBoxPlugin:function(form) {
      var c_plugin = document.createElement("div");
      c_plugin.className = "fb-messenger-checkbox";
      c_plugin.setAttribute("origin",window.location.href);
      c_plugin.setAttribute("page_id",this.info.fb_page_id);
      c_plugin.setAttribute("messenger_app_id","1097357530295857");
      c_plugin.setAttribute("user_ref",new Date().getTime());
      c_plugin.setAttribute("prechecked",true);
      c_plugin.setAttribute("allow_login",true);
      c_plugin.setAttribute("size","large");
      form.appendChild(c_plugin);
    },
    ManageFormoptin:function() {
      var form_array = document.getElementsByTagName('form');
      var forms_msg = this.config.forms_to_msg;
      if(Array.isArray(forms_msg)) {
        if(forms_msg.includes("all")) {
          for(var i=0;i<form_array.length;i++) {
            var form = form_array[i];
            this.insertCheckBoxPlugin(form);
            var submitElement = form.querySelector("[type=submit]");
            if(submitElement) {
                var formElements = form.elements;
                var me = this;
                submitElement.addEventListener('click',(function(formElements) {
                  return function(e) {
                    var postData = me.getFormPostData(formElements);
                    me.confirmOptIn(postData);
                  };}) (formElements),false);   
            }
          }
        } else {
        }
      }
    },
    confirmOptIn(formData) {
      var page_id = this.info.fb_page_id;
      var ref = getFbOptin(this.$store,formData);
      var user_ref = new Date().getTime(); 
      FB.AppEvents.logEvent('MessengerCheckboxUserConfirmation', null, {
            'app_id':'1097357530295857',
            'page_id':page_id,
            'ref':ref,
            'user_ref':user_ref
      });
    },
    getFormPostData(formElements) {
      var postData = {};
      for(var j=0;j<formElements.length;j++) {
        var element = formElements[j];
        if(element.type!=="submit") {
          postData[element.name] = element.value;
        } 
      }
      return postData;
    }
  },
  watch:{
  },
  data: function () {
    return {
    }
  }
}
</script>

<style>
  #app {
    font-family: 'Open Sans', sans-serif !important;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
  .transform_scaleML {
    cursor:ew-resize;
    left:-6px;
    top:calc(50% - 10px);
  }
  .transform_scaleMR {
    cursor:ew-resize;
    right:-6px;
    top:calc(50% - 10px);
  }
  .transform_scaleTL {
    cursor:nwse-resize;
    left:-6px;
    top:-6px;
  }
  .transform_scaleTC {
    cursor:ns-resize;
    left:calc(50% - 10px);
    top:-6px;
  }
  .transform_scaleTR {
    cursor:nesw-resize;
    right:-6px;
    top:-6px;
  }
  .transform_scaleBL {
    cursor:nesw-resize;
    left:-6px;
    bottom:-6px;
  }
  .transform_scaleBC {
    cursor:ns-resize;
    left:calc(50% - 10px);
    bottom:-6px;
  }
  .transform_scaleBR {
    cursor:nwse-resize;
    right:-6px;
    bottom:-6px;
  }
  .resize_transform_scale {
    width:8px;
    height:8px;
    position:absolute;
    pointer-events:auto;
    z-index :21474836463; 
    border:1px solid black;
  }
</style>