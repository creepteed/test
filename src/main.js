// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Builder from './Builder'
import store from './store'

Vue.config.productionTip = false
let main = document.createElement('div');
main.setAttribute("id","builder");
document.body.append(main);
/* eslint-disable no-new */
new Vue({
  el: '#builder',
  template: '<Builder/>',
  components: { Builder },
  created: function () {
    
  },
  data: {
  },
  methods: {
    
  },
  store
})
