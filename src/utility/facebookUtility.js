import io from 'socket.io-client';

export function getReferralInfo(client_info,is_facebook_widget,form_data) {
     var ref_url  = window.location.href;
     var os = navigator.platform;
     var ref = {};
     ref.ip = client_info.ip;
     ref.ref_url = ref_url;
     ref.prev_url = client_info.prev_url;
     ref.os = os;
     ref.device_type = client_info.device_type;
     ref.country = client_info.country;
     ref.city = client_info.city;
     ref.lang = client_info.language;
     ref.chat_code = client_info.code;
     if(!is_facebook_widget) {
         if(client_info.optin_data && client_info.optin_data.type=="ref-extra-data") {
             for(var prop in client_info.optin_data) {
                 ref[prop] = client_info.optin_data[prop];
             }
         }
     }
     if(form_data) {
         ref.form = form_data;
     }
     return btoa(JSON.stringify(ref));
}
export function facebookInit(store) {
    if (typeof window.fbAsyncInit == "undefined") {
        window.fbAsyncInit = function () {
            FB.init({
                appId: "1097357530295857",
                xfbml: true,
                version: 'v2.6'
            });
            FB.XFBML.parse();
            detectOptin(store);
        };
        var fbRoot = document.createElement('div');
        fbRoot.setAttribute("id","fb-root");
        document.body.appendChild(fbRoot);
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }
    else {
        FB.XFBML.parse();
        detectOptin(store);
    }
}
export function getFbOptin(store,formdata) {
    var info = store.state.info;
    var client = store.state.client;
    var ref  = getReferralInfo(client, true ,formdata);
    var optin_data = client.optin_data;
    var data = {optinId: info.optin_sid, pageId: info.fb_page_id, chatMsgId: info.id, data: optin_data, ctx: ref};
    return btoa(JSON.stringify(data));
}

function detectOptin(store) {
    var info = store.state.info;
    var client = store.state.client;
    var data = client.optin_data;
    if(data) {
        if(typeof data.type == 'undefined') {
            data.type = "send-to-messenger";
        }
        client.optin_data = data;
        var socket = io.connect("https://socket.modernapp.co:9090", {secure: true});
        socket.emit("optin_callback",info.optin_sid);
        socket.on("message",function(msg) {
        });
    }
}