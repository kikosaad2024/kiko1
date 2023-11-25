/** ctm-core.js
    This script loads the core modules/features as below that are handled by CTM team.
    - OneTrust Script initiation
    TO-DO:
    - Initiate data layer object - utag_data / ctm_data
    - Define trackEventQueue API
    - 
*/
if (typeof ctm === "undefined") ctm = {};
//Function encapsulates all GDPR releated features and attributes
ctm.gdpr = (function() {
    //Event Queue for call backs if not defined
    var eventqueue = [];
    //Optanon Wrapper Function Counter
    var owCount = 0;
    //Log Message Queue
    var gdprLogQueue =[];
    //Utility to display log messages, that could help in debugging
    var consoleLog = function(msg){
        var msg = msg || "";
        if(msg !==""){gdprLogQueue.push(msg)}
        var qParams = document.location.search;
        var regGdprLog = /(\?|\&)gdprLog\=true/ig;
        // if log enabled through local storage setting or query param
        if((typeof localStorage ==="object" && typeof localStorage["gdprLog"] !=="undefined") || (regGdprLog.test(qParams))){
            console.log(msg);
        }
    };
    const OTConfig = [{
        "%.cisco.com": {
            "prod": "01303338-a875-43c5-b896-ad191297169b",
            "uat": "c1b166fc-3fc0-4735-8ae7-9ff92ed0d80e"
        }
    }, {
        "%.webex.com": {
            "prod": "90edb953-2d93-48ae-a39a-d917d0175155",
            "uat": "83eb6e18-08fa-4b3c-a83d-f4af4397498b"
        }
    }, {
        "%.ciscolive.com": {
            "prod": "a1132643-ac67-4a0f-b609-b47f6a127a02",
            "uat": "47b35bcc-12c5-4ac1-bd18-653a5695e660"
        }
    }, {
        "%.appdynamics.com": {
            "prod": "5a1d4de3-0218-4afb-b874-a4c844e6f858",
            "uat": "7268f734-0ea9-41dc-a8e1-1238f4b57c8c"
        }
    }, {
        "%.meraki-go.com": {
            "prod": "92a8ccec-7f50-4725-9390-16544602d821",
            "uat": "493c90d9-32b3-4574-b07f-34198d16cf2a"
        }
    }, {
        "%.meraki.com": {
            "prod": "d9a28b5b-d617-4378-8b68-854e88c974fb",
            "uat": "a036ec80-9b6c-48fe-a2d5-b977becc0b31"
        }
    }, {
        "%.opendns.com": {
            "prod": "b20cb202-48c5-42c6-beb4-2a58aa4bc424",
            "uat": "623f8d69-d0a0-4d0e-9b3d-350bb42f5bda"
        }
    }, {
        "%.umbrella.com": {
            "prod": "b5501784-8158-49ab-a4c4-095fcee63872",
            "uat": "e149524c-9278-4472-be9f-7ff25dc156f0"
        }
    }];
    const OTExcludeList = [
        "security.umbrella.com/cmd",
        "security.umbrella.com/lp=492",
        "security.umbrella.com/lp=495",
        "security.umbrella.com/lp=500"
    ];
    const OTIncludeList = [
        "www.cisco.com/", 
        "fdk-devint.cisco.com/", 
        "fdk-stage.cisco.com/",
        "engage2demand.cisco.com/",        
        "umbrella.cisco.com/",
        "meraki.cisco.com/",
        "www.meraki-go.com/",
        "community-staging.meraki.com/",
        "community.meraki.com/",
        "video.cisco.com/",
        "blogs-np.cisco.com/",
        "bcsroi.cisco.com/go/cisco/cxbcs", 
        "origin-webex-%.cisco.com/", //WebEx Configurations        
        "www-qa3-webex.cisco.com",
        "webex-cn-lt.cisco.com",
        "www.webex.com/",
        "www3.webex.com/",
        "cart-int.webex.com/",
        "cart.webex.com/",
        "help.webex.com/",
        "essentials.webex.com/",
        "purchase-int.webex.com",
        "purchase.webex.com",
        "origin-webex-stg.webex.com/",
        "blog-origin.webex.com/",
        "blog.webex.com/", //End of WebEx Configurations     
        "www.appdynamics.com/",
        "docs.appdynamics.com/",
        "brandstore.appdynamics.com/",
        "www.ciscolive.com/",
        "worldofsolutions.ciscolive.com/",
        "www.opendns.com/",
        "security.umbrella.com/",
        "blogs.cisco.com/",
        "supportforums-dev2.cisco.com/",
        "social-tools-uat.cisco.com/home",
        "newsroom.cisco.com/",
        "community.cisco.com/",
        "tools-dev.cisco.com/",
        "tools.cisco.com/",
        //"hardware.webex.com/",
        "partnersuccess.cisco.com/",
        "merakiresources.cisco.com/",
        "cdcsearch-stage.cisco.com",
        "search.cisco.com",
        "bst-stage.cloudapps.cisco.com/bugsearch/",
        "bst.cloudapps.cisco.com/",
        "bst.cisco.com/",
        "bst-stg.cisco.com/",
        "software-stage.cisco.com/",
        "software-stage2.cisco.com/",
        "software.cisco.com",
        "mycase1-stage.cloudapps.cisco.com/",
        "mycase.cloudapps.cisco.com",
        "cway.cisco.com",
        "quickview.cloudapps.cisco.com",
        "www-dev-cloud.cisco.com",
        "www-stage-cloud.cisco.com",
        "www-cloud.cisco.com",
        "cxappcenter.cisco.com",
        "bazaar-stage.cisco.com",
        "ccrc.cisco.com",
        "ccwr-stg1.cisco.com",
        "webinars.cisco.com",
        "tmgmatrix-stage.cisco.com",
        "tmgmatrix.cisco.com",
        "mce-stage.cisco.com"
        //"learningnetwork.cisco.com"
    ];

    const OTCSSIncludeList = [
        "essentials.webex.com",
        "social-tools-uat.cisco.com",
        "newsroom.cisco.com",
        "tools-dev.cisco.com",
        "tools.cisco.com",
        "hardware.webex.com",
        "blog.webex.com"
    ];
    var getOTDataDomainConfig = function(url) {
        let dataDomainConfig = "";
        let loc = (typeof url == "undefined") ? window.location.href : url; // "http://www.cisco.com";
        loc = loc.toLowerCase();
        for (let i = 0; i < OTConfig.length; i++) {
            let f = Object.keys(OTConfig[i])[0];
            // check for data domain config before checking url
            if (OTConfig[i][f] !== "") {
                let pattern = f;
                pattern = pattern.replace(new RegExp("\\.", "g"), "\\."); //convert all "."s in url to non-special using escape char
                pattern = pattern.replace(new RegExp("%", "g"), ".*?"); //Replace the wildcard "%" with ".*?" to match anything including blank("")
                let re = new RegExp(pattern, "i");
                //console.log(re+ "created with"+pattern);
                if (re.test(loc)) {
                    dataDomainConfig = OTConfig[i][f]['prod']; //default map to Prod;
                    if(typeof localStorage ==="object" && typeof localStorage["OneTrustEnv"] !=="undefined"){
                        switch(localStorage["OneTrustEnv"]){
                            case "test":
                            dataDomainConfig = OTConfig[i][f]['prod']+"-test";
                            break;
                            case "uat":
                            dataDomainConfig = OTConfig[i][f]['uat'];
                            break;
                            case "uat-test":
                            dataDomainConfig = OTConfig[i][f]['uat']+"-test";
                            break;
                        }

                    }
                    //dataDomainConfig = (typeof localStorage ==="object" && localStorage["OneTrustEnv"] ==="test")? (OTConfig[i][f]+"-test"):OTConfig[i][f];
                    break; // only one config can be used per-match.
                }
            }
        }
        return dataDomainConfig;
    };
    /**
        Utility for current URL match for the given array of URL patterns
        ## signature ##   isUrlPatternMatch(url,patternArr)
        @param args : 
        url --> current url
        patternArr --> list of patterns to which current url need to be matched
    **/
    var isUrlPatternMatch =function (url,patternArr){
        var url = url || document.URL;        
        for (var i = 0; i < patternArr.length; i++) {
            var pattern = patternArr[i];
            pattern = pattern.replace(new RegExp("\\.", "g"), "\\."); //convert all "."s in url to non-special using escape char
            pattern = pattern.replace(new RegExp("%", "g"), ".*?"); //Replace the wildcard "%" with ".*?" to match anything including blank("")
            var re = new RegExp(pattern, "i");
            //console.log(re+ "created with"+pattern);
            if (re.test(url)) {
                //console.log(url+" matched to: "+re);
                return true;
            }
        }
        return false

    };
    /**
        Cookie reading and writing utility copied implemenation from 'cdc.cookie.js'
        sets a cookie. days and msecs are days and milliceconds from now,
        respectively. if neither days or msecs are given, defaults to
        expire at end of browser session.
        @param args {
            cookieName: string
            cookieValue: string
            days: int (optional)
            msecs: int (optional, overrides days)
            path: string (optional) (default=/)
            domain: string (optional)
        }
        */
    var setCookie = function(args) {
        // LEGACY - support old signature (string, string[, int])
        if (!args.cookieName) {
            args = {
                cookieName: args,
                cookieValue: arguments[1]
            };
            if (arguments.length > 2) {
                args.days = arguments[2];
            }
        }

        var expireStr = '';
        var pathStr = '';
        var domainStr = '';
        var msecs = parseInt(args.msecs);
        if (isNaN(msecs) && args.days) {
            msecs = args.days * 24 * 60 * 60 * 1000;
        }

        if (!isNaN(msecs)) {
            var ex = new Date();
            ex.setTime(ex.getTime() + msecs);
            expireStr = "; expires=" + ex.toUTCString();
        }
        if (args.path) {
            pathStr = "; path=" + args.path + ";";
        } else {
            pathStr = "; path=/;";
        }
        if (args.domain) {
            domainStr = "; domain=" + args.domain;
        }
        try {
            document.cookie = args.cookieName + "=" + escape(args.cookieValue) + expireStr + pathStr + domainStr;
        } catch (e) {
            return false;
        }
        return true;
    };
    /**
    gets requested cookie.
    @param args { cookieName: string }
    */
    var getCookie = function(args) {
        // LEGACY - if args is a string and not an object
        if (!args.cookieName) {
            args = {
                cookieName: args
            };
        }

        var dict = unpackParamString(document.cookie, /\s*;\s*/);
        return dict[args.cookieName] || "";
    };
    /**
    deletes requested cookie.
    args are identical to setCookie, except that expiry is forced
    to a negative number, effectively deleting the cookie.
    */
    var deleteCookie = function(args) {
        // mutating args obj might mess things up
        // if caller reuses it for other things
        var dArgs = {},
            name;
        for (name in args) {
            if (args.hasOwnProperty(name)) {
                dArgs[name] = args[name];
            }
        }
        dArgs.msecs = dArgs.days = -1;
        dArgs.cookieValue = '';
        return setCookie(dArgs);
    };
    /**
    takes a dictionary, returns a string
    e.g. {"foo":"bar","foo 2":"bar 2"} => "foo=bar&foo%202=bar%202"
    @param sep optional separator, defaults to "&" 
    */
    var packParamString = function(dict, sep) {
        sep = sep || '&';
        var frags = [],
            name;
        for (name in dict) {
            if (!dict.hasOwnProperty(name)) {
                continue;
            }
            frags.push(escape(name) + '=' + escape(dict[name]));
        }
        return frags.join(sep);
    };
    /**
    takes a string, returns a dictionary
    e.g. "foo=bar&foo%202=bar%202" => {"foo":"bar","foo 2":"bar 2"}
    @param sep optional separator, defaults to "&" (can be string or regexp)
    */
    var unpackParamString = function(str, sep) {
        sep = sep || '&';
        var frags = str.split(sep),
            dict = {},
            frag,
            ioe,
            name,
            val,
            i;
        for (i = 0; i < frags.length && (frag = frags[i]); i++) {
            ioe = frag.indexOf('='); // expecting "foo=bar"
            if (ioe < 0) {
                continue;
            }
            name = unescape(frag.substring(0, ioe));
            val = unescape(frag.substring(ioe + 1));
            dict[name] = val;
        }
        return dict;
    };
    // Function returns Performance flag
    var getPerformanceFlag = function() {
        var optCk = getCookie("OptanonConsent");
        var patternPerf = /(\=|\,)[2]\:[0]/g;
        if (optCk != "" && patternPerf.test(optCk)) {
            return "false";
        }
        return "true";
    };
    // Function returns Targeting flag
    var getTargetingFlag = function() {
        var optCk = getCookie("OptanonConsent");
        var patternTgt = /(\=|\,)[4]\:[0]/g;
        if (optCk != "" && patternTgt.test(optCk)) {
            return "false";
        }
        return "true";
    };
    //Function to validate subsequent visit
    var isOneTrustLoadedPrior = function() {
        var patternGroups = /\&groups\=/g;
        var optCk = getCookie("OptanonConsent");
        if ((getCookie("OptanonAlertBoxClosed") !== "") || ( optCk!== "" && patternGroups.test(optCk))) {
            return "true";
        }
        return "false";
    };
    //Function to check if OT cookie available to read
    var isOTCookieAvailable = function() {
        if ((eventqueue.length > 0) || (isOneTrustLoadedPrior()==="true")) {
            return true;
        }
        return false;
    }
    // Flag to detect users first visit
    const isFirstVisit = (function() {
        consoleLog("isOneTrustLoadedPrior: "+isOneTrustLoadedPrior());
        var flag = (isOneTrustLoadedPrior() === "false") ? true : false;
        return flag;
    })();

    // Function to check, whether current URL is a Privacy page or not
    const isPrivacyPage = (function(url) {
        var url = url || document.URL;
        var privUrls = ["www.cisco.com/c/en/us/about/legal/privacy-full.html"];
        return isUrlPatternMatch(url,privUrls);        
    })();
    //Function to detect, whether Tealium Consent is shown earlier
    /*
    //US#462422: Decommission Tealium Consent Across all Profiles 
    var isTealiumConsentLoaded = function() {
        var value = "; " + document.cookie;
        var parts = value.split("; CONSENTMGR=");
        if (parts.length == 2) {
            return true;
        }
        return false;
    };*/
    var isEU = function(cCode) {
        var euCountryList = {            
            "AT":"Austria",
            "BE":"Belgium",
            "BG":"Bulgaria",
            "HR":"Croatia",
            "CY":"Cyprus",
            "CZ":"Czech Republic",
            "DEN":"Denmark",
            "EE":"Estonia",
            "FI":"Finland",
            "FR":"France",
            "DE":"Germany",
            "GR":"Greece",
            "HU":"Hungary",
            "IE":"Ireland",
            "IS":"Iceland",
            "IT":"Italy",
            "LV":"Latvia",
            "LI":"Liechtenstein",
            "LT":"Lithuania",
            "LU":"Luxembourg",
            "MA":"Malta",
            "NL":"Netherlands",
            "NOR":"Norway",
            "PL":"Poland",
            "PT":"Portugal",
            "RO":"Romania",
            "SK":"Slovakia",
            "SL":"Slovenia",
            "ES":"Spain",
            "SE":"Sweden",
            "CH":"Switzerland",
            "TR":"Turkey",
            "UK":"United Kingdom",
            "GB":"England"
        };
        var geoLocObj= (typeof Optanon ==="object" && typeof Optanon.getGeolocationData ==="function")?Optanon.getGeolocationData():null;
        var cCode = cCode || (geoLocObj !==null)?geoLocObj["country"]:"" ;
        if(cCode in euCountryList){
            return true;
        }else{
            return false;
        }
    };
    // Function to check, whether OT is enabled for given URL
    var isOTEnabled = function(url) {
        var url = url || document.URL;
        //var otUrls = [".cisco.com/c/en/us/solutions/enterprise-networks/sd-wan/index.html", ".cisco.com/c/en/us/products/products-sanity-test/palkesh/index.html"];
        var otUrls = OTIncludeList;
        var otExclUrls = OTExcludeList;
        //if((!isUrlPatternMatch(url,otExclUrls)) && isUrlPatternMatch(url,otUrls) && (!isTealiumConsentLoaded())){
        if((!isUrlPatternMatch(url,otExclUrls)) && isUrlPatternMatch(url,otUrls)){
            return true;
        }        
        //console.log("OT not enabled...");
        return false
    };  

    //Checks to see if domain needs css stylesheet to override subdomain styling
    const isOTCSSOverride = (function() {
        var urls = OTCSSIncludeList;
        var currentDomain = document.location.host;
        for(var i = 0; i < urls.length; i++) {
            if (currentDomain == urls[i]) {
                return true;
                consoleLog("isOTCSS");
            }
        }
        return false;
    })();
    
    //adds css stylesheet to override styling from the subdomain
    function addOTCSSOverride(domain) {
        var csspath = "https://www.cisco.com/c/dam/cdc/t/ot/css/";
        var head  = document.getElementsByTagName('head')[0];
        var link  = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        //modifies domain name to match naming convention in dam assets (eg: blog.webex.com --> blog-webex-com)
        const filename = domain.toString().replace(/\./g,"-");
        link.href = csspath + filename + ".css";
        link.media = 'all';
        head.appendChild(link);
        consoleLog("### OT CSS Override added ###" +link.href);
    }


    // function to initiate One Trust Service
    var loadOnetrust = function(url) {
        var headTag = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        let ddScriptConfig = getOTDataDomainConfig();
        consoleLog("data-domain-script: "+ddScriptConfig);
        script.setAttribute("data-domain-script", ddScriptConfig);
        script.type = "text/javascript";
        script.src = "https://cdn.cookielaw.org/scripttemplates/otSDKStub.js";
        script.async = true;
        headTag.appendChild(script);
    };
    // initialize GDPR
    var init = function() {
        try {
            consoleLog("Initiating GDPR");
            //Load OneTrust Script
            if (isOTEnabled(document.URL)) {
                consoleLog("### Loading One Trust ####");
                if (isOTCSSOverride) {
                    addOTCSSOverride(document.location.host);
                }
                loadOnetrust();
            } else {
                consoleLog("OneTrust not enabled on this page!");
            }
        } catch (e) {
            console.log("ctm-core initiation error:", e);
        }
    };

    //initiate Tealium Call Back Function will be overridden in ctm.js
    var initiateTealium = function(obj) {
        eventqueue.push(obj);
    };
    // initiate Adobe Targeter Call Back Function will be overridden in pzn-init.js
    var initiatePznLib = function(obj) {
        eventqueue.push(obj);
    };
    return {
        isFirstVisit: isFirstVisit,
        isPrivacyPage:isPrivacyPage,
        isEU:isEU,
        owCount: owCount,
        init: init,
        isOTEnabled: isOTEnabled,
        //isTealiumConsentLoaded: isTealiumConsentLoaded,
        eventqueue: eventqueue,
        getPerformanceFlag: getPerformanceFlag,
        getTargetingFlag: getTargetingFlag,
        isOneTrustLoadedPrior: isOneTrustLoadedPrior,
        isOTCookieAvailable: isOTCookieAvailable,
        initiateTealium: initiateTealium,
        initiatePznLib:initiatePznLib,
        consoleLog:consoleLog,
        gdprLogQueue:gdprLogQueue
    }
})();
// End of gdpr function
//Call back function triggered by OT
function OptanonWrapper() {
    //window.dataLayer.push({ event: 'OneTrustGroupsUpdated' }) ;
    try {
        ctm.gdpr.consoleLog("OptanonWrapper called: "+ctm.gdpr.owCount);
        if (ctm.gdpr.owCount === 0) {
            var acceptBtn = document.querySelector("#onetrust-accept-btn-handler");
            var allowAllBtn = document.querySelector("#accept-recommended-btn-handler");
            //var saveBtn = document.querySelector("button[aria-label='Save Settings']");
            var saveBtn = document.querySelector("button.save-preference-btn-handler");
            var isEU = ctm.gdpr.isEU().toString();
            ctm.gdpr.consoleLog("EU: "+isEU);
            if(ctm.gdpr.isEU()) {//only for EU
                //Binding Event Handler to accept button EU
                if (typeof acceptBtn !== "undefined" && acceptBtn !==null) {
                    acceptBtn.addEventListener("click", function() {
                        ctm.gdpr.initiateTealium({
                            "event": "OTAcceptBtn"
                        });
                    });
                }
                // Binding event handler for Save Settings button (Consent Manager) only for EU
                if (typeof saveBtn !== "undefined" && saveBtn !== null) {
                    saveBtn.addEventListener("click", function() {
                        ctm.gdpr.initiateTealium({
                            "event": "OTSaveBtn"
                        });
                    });
                }
                //Binding event handler for Allow All button (Consent Manager) only for EU
                if (typeof allowAllBtn !== "undefined" && allowAllBtn !== null) {
                    allowAllBtn.addEventListener("click", function() {
                        ctm.gdpr.initiateTealium({
                            "event": "OTAllowAllBtn"
                        });
                    });
                }
            }
            /**
            * Scenario 1:This function is executed with overridden definition in util/utagLoader.js, if this OT callback happens post ctm.js
            * Scenario 2: This function is executed with definition to push event obj to array, if OT callback happens before ctm.js
            **/
            if (ctm.gdpr.isFirstVisit) {
                ctm.gdpr.consoleLog("### First Visit ####");
                ctm.gdpr.initiatePznLib({
                    "event": "PznInitialLoad",
                    "isEU":isEU
                });
                ctm.gdpr.initiateTealium({
                    "event": "OTInitialLoad"
                });                
            }
            
        }
        // Counter to signify first OT load
        ctm.gdpr.owCount++;
    } catch (e) {
        console.log("exception in OptanonWrapper function", e);
    }
}

// Initialize GDPR
ctm.gdpr.init();