export default {
    results: {
        current: 0,
        max: 0,
        geo_data: null,
        timezone: null,
        plugins: null,
        screen: null,
        browser: null,
        browser_version: null,
        browser_language: null
    },
    props: {
        container: window
    },
    getResults: function () {
        return this.results;
    },
    getScreenData: function () {
        this.results.screen = screen;
        return this.results.screen;
    },
    getBrowserLanguage: function () {
        if (!this.results.browser_language) {
            this.results.browser_language = navigator.language;
        }

        return this.results.browser_language;
    },
    getTimeZone: function () {
        if (!this.results.timezone) {
            this.results.timezone = new Date().getTimezoneOffset();
        }
        return this.results.timezone
    },
    getClientGeo: function () {

        if (this.results.geo_data) {
            return Promise.resolve(this.results.geo_data);
        }

        return new Promise(function (resolve, reject) {
            $.getJSON('http://www.geoplugin.net/json.gp?jsoncallback=?', function (data) {
                this.results.geo_data = JSON.stringify(data, null, 2)
                resolve(this.results.geo_data);
            }.bind(this));
        }.bind(this));
    },
    getAvailablePlugins: function () {

        if (this.results.plugins) {
            return this.results.plugins;
        }

        var plugins = {
            total: 0,
            list: []
        };

        var x = navigator.plugins.length;
        plugins.total = x;
        for (var i = 0; i < x; i++) {
            plugins.list.push(navigator.plugins[i].name);
        }

        this.results.plugins = plugins;

        return this.results.plugins;
    },
    getBrowserVersion: function () {
        this.results.browser_version = navigator.appVersion;
        return this.results.browser_version;
    },
    getBrowserData: function () {

        if (this.results.browser) {
            return this.results.browser;
        }

        var ua = navigator.userAgent, tem,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);

        this.results.browser = M.join(' ');
        return this.results.browser;
    },
    setContainer: function (container) {
        this.props.container = container;
    },
    scrollListener: function () {

        var body = document.body;
        var doc = this.props.container;

        var scrollHeight = (body.scrollHeight) ? body.scrollHeight : 0;
        var offsetHeight = (body.offsetHeight) ? body.offsetHeight : 0;
        var docClientHeight = (doc.clientHeight) ? doc.clientHeight : 0;
        var docScrollHeight = (doc.scrollHeight) ? doc.scrollHeight : 0;
        var docOffsetHeight = (doc.offsetHeight) ? doc.offsetHeight : 0;

        var docHeight = Math.max(scrollHeight, offsetHeight, docClientHeight, docScrollHeight, docOffsetHeight);

        var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
        var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

        if (!top) {
            top = 0;
        }

        var intFrameHeight = window.innerHeight;

        this.results.current = (((intFrameHeight + top) * 100) / docHeight).toFixed(0);
        if (this.results.current * 1 > this.results.max * 1) {
            this.results.max = this.results.current;
        }

    },
    attachScrollListener: function () {
        this.props.container.addEventListener('scroll', this.scrollListener.bind(this));
        this.props.container.addEventListener('resize', this.scrollListener.bind(this));
    },
    detachScrollListerner: function () {
        this.props.container.removeEventListener('scroll', this.scrollListener.bind(this));
        this.props.container.removeEventListener('resize', this.scrollListener.bind(this));
    }
};