<template>
    <div v-bind:style="getStyles()">
        <div class="fb-messenger-checkbox" v-bind:origin="page_url" v-bind:page_id="getPageId()" messenger_app_id="1097357530295857"
            v-bind:user_ref="getUniqueUserRef()" prechecked="true" allow_login="true" size="large">
        </div>
    </div>
</template>
<script>
import {InitStyleWithConfigVariable} from '../utility/editUtility.js'
import {facebookInit} from '../utility/facebookUtility.js'
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
    getUniqueUserRef() {
        var ref = new Date().getTime();
        return ref;
    },
    getStyles:function() {
        let styles = InitStyleWithConfigVariable(this.elements.styles,this.config);
        return styles;
    }
  },
  created(){
      this.page_url = window.location.href;
  },
  beforeMount() {
  },
  mounted(){
      facebookInit(this.$store);
  },
  data: function () {
    return {
        page_url:" "
  }
  }
})

</script>

<style scoped>

</style>