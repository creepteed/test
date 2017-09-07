import Vue from 'vue'
import Vuex from 'vuex'
import {deleteSpecificSymbol, hasConfigVariable, getCodeNumber } from '../utility/editUtility.js';
import {getCurrentCornerPosition} from '../utility/parseUtility.js';

Vue.use(Vuex)

const state = {
    config: {},
    info: {},
    client: {},
    authoring: {},
    widgets: [],
    settingInfo: null,
    deletedImageList: [],
    isSettingAvailable: false,
    client_mode: false,
    show_controls: false,
    onceOvered: true,
    undoData: [],
    analythicsUrl: "",
    firstWrapper: null,
    layerInfo:null,
    isMobileDevice: false,
    desktopMode: true,
    currentCornerPosition: "Bottom Left",
    scaleForMobile: 540,
    id: null
};

const getters = {
    getDisappearedTime: (state, type) => {
        let widget = state.authoring[type];
        if (widget.hasOwnProperty("properties")) {
            let properties = widget.properties;
            if (properties.hasOwnProperty("disappear_after")) {
                return properties.disappear_after * 1000;
            }
        }
        return 0;
    },
    getWidgetArray: (state) => {
        var wArray = [];
        Object.keys(state.authoring).forEach(function (key) {
            wArray.push(key);
        });
        return wArray;
    },
    getUndoData: (state) => {
        if (state.undoData.length < 1) {
            return null;
        }
        var length = state.undoData.length;
        return state.undoData[length - 1];
    },
    getId: (state) => {
        return state.id;
    }
};

const mutations = {
    addDeleteImageFile: (state, params) => {
        if (state.deletedImageList.indexOf(params) == -1) {
            state.deletedImageList.push(params);
        } else {
            return;
        }
    },
    changeWrapperPosition: (state, params) => {
        state.currentCornerPosition = params;
        var hposition = "left";
        var vposition = "top";
        if (state.currentCornerPosition.includes("Bottom")) {
            vposition = "bottom";
        }
        if (state.currentCornerPosition.includes("Right")) {
            hposition = "right";
        }

        for (var layoutName in state.authoring) {
            var layout = state.authoring[layoutName];
            var wrapper = layout["elements"][0];
            var style = wrapper["styles"];

            if (!style.hasOwnProperty(hposition)) {
                if (hposition == "left") {
                    style["left"] = style["right"];
                    delete style["right"];
                } else {
                    style["right"] = style["left"];
                    delete style["left"];
                }
            }
            if (!style.hasOwnProperty(vposition)) {
                if (vposition == "top") {
                    style["top"] = style["bottom"];
                    delete style["bottom"];
                } else {
                    style["bottom"] = style["top"];
                    delete style["top"];
                }
            }
        }

        state.widgets = [];
        let behaviour = state.config["behaviour"];
        let start_name = behaviour["start"];
        if (typeof start_name != 'undefined') {
            state.widgets.push(start_name);
        }
    },
    changeColor: (state, params) => {
        state.config[params.name] = params.value;
    },
    processViewToggle: (state, params) => {
        let name = params[0];
        let value = params[1];
        if (value) {
            if (!state.widgets.includes(name)) {
                state.widgets.push(name);
            }
        } else {
            if (state.widgets.includes(name)) {
                var index = state.widgets.indexOf(name);
                state.widgets.splice(index, 1);
            }
        }
    },
    setConfigVariable: (state, params) => {
        let keyName = deleteSpecificSymbol(params.key);
        state.config[keyName] = params.value;
    },
    setAnalythicsUrl: (state, params) => {
        let event = params[0];
        let abs_path = state.info.abs_path;
        let id = state.info.id;
        let code = getCodeNumber();
        let domain = window.location.hostname;
        let url = window.location.href;
        let src = abs_path + "evchat" + "?m_id=" + id + "&code=" + code + "&ev=" + event + '&p=12345';
        state.analythicsUrl = src;
    },
    setFirstWrapper: (state, params) => {
        state.firstWrapper = params;
    },
    setJsonData: (state, data) => {
        state.config = data.config;
        state.info = data.info;
        state.client = data.client;
        state.authoring = data.authoring;
        state.client_mode = state.info.client_mode;
        state.show_controls = state.info.show_controls;
        state.scaleForMobile = parseInt(state.config.media["break-point"]);
        let behaviour = state.config["behaviour"];
        let start_name = behaviour["start"];
        state.currentCornerPosition = getCurrentCornerPosition(state.authoring[start_name]);
        if (typeof start_name != 'undefined') {

            state.widgets.push(start_name);
        }
    },
    setLayerInfo: (state,params) => {
        state.layerInfo = params;
    },
    setSettingInfo: (state, params) => {
        if (params) {
            state.settingInfo = null;
            state.settingInfo = params;
            state.isSettingAvailable = true;
        } else {
            state.settingInfo = null;
            state.isSettingAvailable = false;
        }
    },
    setMobileDevice: (state,params) => {
        state.isMobileDevice = params;
    },
    setId: (state, params) => {
        state.id = params;
    },
    saveUndoData: (state, params) => {
        state.undoData.push(params);
    },
    soundPlayed: (state) => {
        state.onceOvered = false;
    },
    switchClientMode: (state, params) => {
        state.info.client_mode = params;
        state.client_mode = params;
        state.onceOvered = true;
        state.settingInfo = null;
        state.layerInfo = null;
        state.widgets = [];
        let behaviour = state.config["behaviour"];
        let start_name = behaviour["start"];
        if (typeof start_name != 'undefined') {
            state.widgets.push(start_name);
        }
    },
    changeDesktopMode: (state,params) => {
        state.desktopMode = params;
        state.onceOvered = true;
        state.settingInfo = null;
        state.layerInfo = null;
        state.widgets = [];
        let behaviour = state.config["behaviour"];
        let start_name = behaviour["start"];
        if (typeof start_name != 'undefined') {
            state.widgets.push(start_name);
        }
    },
    undoFinished: (state) => {
        if (state.undoData.length > 0) {
            var n = state.undoData.length;
            state.undoData.splice(n - 1, 1);
        }
    }
};

const actions = {
    processViewToggle: ({commit}, params) => {
        commit('processViewToggle', params);
    }
};

let store = new Vuex.Store({
    state,
    getters,
    mutations,
    actions
});

export default store;