<template>
    <div class="image_stting">
        <input type="text" class="attach-url-text" v-model="image_url" v-on:blur="changeImageUrl()" placeholder="input image url"/>
        <button @click="uploadImage" class="pointer_cursor select_button">CHANGE IMAGE</button>
    </div>
</template>
<script>
import {hasConfigVariable,getConfigVariable,InitStyleWithConfigVariable } from '../../utility/editUtility.js'
import { mapGetters , mapState } from 'vuex';
import * as properties from '../../properties';

export default ({
  name: 'imageSetting',
  props:['info'],
  components: {
  },
  computed: {
     ...mapState(['config'])
  },
  methods: {
    uploadImage:function(event) {
        event.stopPropagation();
        var dialog = this.$el.querySelector("#img_file_dialog");
        if(dialog!=null) {
            dialog.click();
        }
    },
    changeImageUrl: function() {
        this.setImageSrc(this.image_url);
    },
    sendImage:function(data) {
        var postdata = new FormData();
        postdata.append("image",data);
        this.$http.post(properties.imageUploadUrl,
                    postdata,
                    {
                        headers: {
                            "Authorization": properties.authorization,
            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    }
                    ).then(
                        function(response) {
            var status = response.status;
            if(status == 200) {
                var data = response.body.Data;
                var url = data.url;
                this.image_url = url;
                this.setImageSrc(url);
            }
                        },
                        function(response) {
                            
                        }
                    );
    },
    setImageSrc:function(url) {
        var element = this.info.element;
        if(hasConfigVariable(element.body.src)) {
            var params = {};
            params.key = element.body.src;
            params.value = url;
            this.$store.commit('setConfigVariable',params);
        }else {
            element.body.src = url;
            this.info.childEl.style["background-image"] = "url" + "(" + url + ")";
        }
    }
    },
    mounted() {
        this.filedialog = document.createElement("input");
        this.filedialog.type = "file";
        this.filedialog.setAttribute("id","img_file_dialog");
        this.filedialog.style.display = "none";
        this.filedialog.accept = "image/*";
        this.$el.appendChild(this.filedialog);

        var me = this;
        var handleImageChange = function(event) {
          me.sendImage(this.files[0]); 
        };
        this.$el.querySelector("#img_file_dialog").addEventListener('change',handleImageChange,false);
        this.$el.querySelector("#img_file_dialog").addEventListener('click',function(event){
                event.stopPropagation();
            },false);
        this.$nextTick(function() {
            var element = this.info.element;
            if(element.body.hasOwnProperty("src")) {
                if(hasConfigVariable(element.body["src"])) {
                    this.image_url = getConfigVariable(element.body["src"],this.config);
                }else {
                    this.image_url = element.body["src"];
                }
            }
            
        });
    },
  data: function () {
    return {
      "filedialog":"",
      "image_url":""
    }
  }
})

</script>

<style scoped>
    a {
        font-family: sans-serif!important;
    }
    
    .select_button {
        width: 100%;
        height: auto;
        font-size: 12px;
        line-height: 32px;
        border-radius: 2px;
        padding: 0 20px;
        background-color: #526ede;
        color: white;
        border: 0;
        font-weight: 500;
        margin-top:20px;
        min-height: 28px;
        min-width: 60px;
        text-align: center;
        transition: all .15s;
    }
    
    .cancel_button {
        height: auto;
        width: 40%;
        float: right;
        font-size: 12px;
        line-height: 32px;
        border-radius: 2px;
        padding: 0 8px;
        background-color: #e8e8e8;
        color: black;
        font-weight: 500;
        border: 0;
        min-height: 28px;
        min-width: 60px;
        text-align: center;
        transition: all .15s;
    }
    
    .cancel_button:hover {
        background-color: rgba(81, 88, 115, .2);
    }
    
    .select_button:hover {
        background-color: #627be0;
    }
    
    .image_stting {
        width: 220px;
    }
</style>