<template>
    <div>
        <span>Transition Type:</span> </br>
        <select class="transition-input" v-model="elementClass" @change="changeTransition()">
            <option v-for="item in classlist" :value="item">{{item}}</option>
        </select>
        </br>
        <span>Iteration Count:</span> </br>
        <input type="number" class="transition-input" v-model="iterationCount"></input>
    </div>
</template>
<script>
import { mapGetters , mapState } from 'vuex';
import {hasConfigVariable,getConfigVariable,InitStyleWithConfigVariable } from '../../utility/editUtility.js'
import * as properties from '../../properties';

export default ({
  name: 'transitionSetting',
  props:['info'],
  computed: {
     ...mapState(['config'])
  },
  components: {
  },
  watch: {
     "elementClass": function() {
         if(this.elementClass!="") {
             if(this.iterationCount==0) {
                 this.iterationCount = 1;
                 this.info.element.styles["animation-iteration-count"] = this.iterationCount;
             }
             this.info.element["body"].class = this.elementClass;
         }
     },
     "iterationCount": function() {
         this.info.element.styles["animation-iteration-count"] = this.iterationCount;
     }
  },
  methods: {
    changeTransition: function() {

    }
  },
  mounted() {
      this.$nextTick(function(){
          this.classlist = this.config.classList;
          let body = this.info.element.body;
          let styles = this.info.element.styles;
          if(body.hasOwnProperty("class")) {
              this.elementClass = body["class"];
          }
          if(styles.hasOwnProperty("animation-iteration-count")) {
              this.iterationCount = parseInt(styles["animation-iteration-count"]);
          }
          else{
              if(this.elementClass!="") {
                  this.iterationCount = 1;
                  styles["animation-iteration-count"] = 1;
              }else {
                  this.iterationCount = 0;
                  styles["animation-iteration-count"] = 0;
              }
          }
      });
  },
  data: function () {
    return {
       elementClass:"",
       classlist:[],
       iterationCount:0
    }
  }
})

</script>

<style scoped>
.transition-input {
        width: 200px;
        margin-top: 10px;
        margin-bottom: 10px;
        height: 30px;
        background: rgba(223, 224, 230, .6);
        border: none;
        padding-left: 10px;
}
</style>