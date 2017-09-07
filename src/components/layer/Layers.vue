<template>
    <div class="pointer_cursor" >
        <div class="widget-layout-class">{{elements.properties.name}}</div>
        <layer v-for="(element, key, index) in childElements" v-bind:elements="element" :key="index"></layer>
    </div>
</template>
<script>
import { mapGetters , mapState } from 'vuex';
import layer from './Layer';

export default ({
  name: 'layers',
  props:['elements'],
   computed: {
     ...mapState(['config','client_mode'])
  },
  components: {
    layer
  },
  methods: {

    },
    created() {
       
    },
  mounted(){
      if(this.elements.hasOwnProperty("elements")) {
            this.childElements = this.elements.elements;
        }
  },
  watch:{
    'elements':function() {
        if(this.elements.hasOwnProperty("elements")) {
            this.childElements = this.elements.elements;
        }
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
    .widget-layout-class {
        font-size: 20px;
        font-weight: 500;
        padding: 6px 4px 6px 20px;
        margin-top: 1px;
        border-bottom: 1px solid #dfe0e6;
    }
</style>