<template>
    <div id="fbsend" v-bind:style="getStyles()">
        <div class="fbwidget_div">
            <div class="fb-send-to-messenger" messenger_app_id="1097357530295857" v-bind:page_id="getPageId()" v-bind:data-ref="getDataRef()"
                color="blue" size="large">
            </div>
        </div>
        <div class="identify_button" @click="openIdentifyButton">Send to Messenger</div>
    </div>

</template>
<script>
import {InitStyleWithConfigVariable,processEvents} from '../utility/editUtility.js'
import {facebookInit,getFbOptin} from '../utility/facebookUtility.js'
import { mapGetters , mapState } from 'vuex';

export default ({
  props:['elements'],
  computed: {
    ...mapState(['config','info','client_mode'])
  },
  methods: {
    getPageId() {
        return this.info.fb_page_id;
    },
    getDataRef() {
        return getFbOptin(this.$store,null);
    },
    getStyles:function() {
        let styles = InitStyleWithConfigVariable(this.elements.styles,this.config);
        return styles;
    },
    openIdentifyButton:function(event) {
        event.stopPropagation();
        var screenParams = "width=500,height=800";
        var parameters = [];
        parameters.push("_blank");
        parameters.push(screenParams);
        processEvents(event.type,'openChat',parameters,this.$store);
    }
  },
  created(){
  },
  mounted(){
      facebookInit(this.$store);
  },
  data: function () {
    return {
    }
  }
})

</script>

<style scoped>
    .fbwidget_div {
        position: absolute!important;
        z-index: 10000000!important;
    }
    
    .identify_button {
        background: url(data:image/png;base64,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);
        background-color: #0084ff;
        background-position: 6px 5px;
        background-repeat: no-repeat;
        background-size: 15px 15px;
        color: white;
        border: 1px solid transparent;
        border-radius: 4px;
        display: inline-block;
        overflow: hidden;
        font-size: 13px;
        cursor: pointer;
        height: 26px;
        line-height: 25px;
        width: auto;
        padding: 0 8px 0 26px;
        z-index: 1000;
    }
    
</style>