<template>
  <a v-bind:style="styles" 
      v-bind:href="path"> {{text}}     
    <div v-for="bg in bgArray" v-bind:is="preventDefalutCrash(bg.type)" v-bind:elements="bg"></div>
</a>
</template>
<script>
import CustomBg from './Bg'

export default ({
  props:['elements','widgetProps'],
  components: {
    CustomBg
  },
  methods: {
     preventDefalutCrash:function(type) {
      if(type!="wrapper") {
        return "custom"+type;
      }
      return type;
    }
    },
    mounted() {
       this.text = this.elements.text;
      this.styles = this.elements.styles;
      this.path = this.elements.body.href;
      if(this.elements.hasOwnProperty("elements")) {
        this.bgArray = this.elements.elements;
      }
      
    },
  data: function () {
    return {
      "text":"",
      "styles":"",
      "path":"",
      "bgArray":[]
    }
  }
})

</script>

<style scoped>
  a {
    font-family: sans-serif!important;
  }
</style>
