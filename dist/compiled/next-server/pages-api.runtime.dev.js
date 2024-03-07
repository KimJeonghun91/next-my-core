(()=>{var e={"./dist/compiled/@edge-runtime/cookies/index.js":e=>{"use strict";var t=Object.defineProperty,r=Object.getOwnPropertyDescriptor,n=Object.getOwnPropertyNames,o=Object.prototype.hasOwnProperty,a={};function i(e){var t;let r=["path"in e&&e.path&&`Path=${e.path}`,"expires"in e&&(e.expires||0===e.expires)&&`Expires=${("number"==typeof e.expires?new Date(e.expires):e.expires).toUTCString()}`,"maxAge"in e&&"number"==typeof e.maxAge&&`Max-Age=${e.maxAge}`,"domain"in e&&e.domain&&`Domain=${e.domain}`,"secure"in e&&e.secure&&"Secure","httpOnly"in e&&e.httpOnly&&"HttpOnly","sameSite"in e&&e.sameSite&&`SameSite=${e.sameSite}`,"priority"in e&&e.priority&&`Priority=${e.priority}`].filter(Boolean);return`${e.name}=${encodeURIComponent(null!=(t=e.value)?t:"")}; ${r.join("; ")}`}function s(e){let t=new Map;for(let r of e.split(/; */)){if(!r)continue;let e=r.indexOf("=");if(-1===e){t.set(r,"true");continue}let[n,o]=[r.slice(0,e),r.slice(e+1)];try{t.set(n,decodeURIComponent(null!=o?o:"true"))}catch{}}return t}function d(e){var t,r;if(!e)return;let[[n,o],...a]=s(e),{domain:i,expires:d,httponly:l,maxage:c,path:f,samesite:h,secure:g,priority:v}=Object.fromEntries(a.map(([e,t])=>[e.toLowerCase(),t])),m={name:n,value:decodeURIComponent(o),domain:i,...d&&{expires:new Date(d)},...l&&{httpOnly:!0},..."string"==typeof c&&{maxAge:Number(c)},path:f,...h&&{sameSite:u.includes(t=(t=h).toLowerCase())?t:void 0},...g&&{secure:!0},...v&&{priority:p.includes(r=(r=v).toLowerCase())?r:void 0}};return function(e){let t={};for(let r in e)e[r]&&(t[r]=e[r]);return t}(m)}((e,r)=>{for(var n in r)t(e,n,{get:r[n],enumerable:!0})})(a,{RequestCookies:()=>l,ResponseCookies:()=>c,parseCookie:()=>s,parseSetCookie:()=>d,stringifyCookie:()=>i}),e.exports=((e,a,i,s)=>{if(a&&"object"==typeof a||"function"==typeof a)for(let i of n(a))o.call(e,i)||void 0===i||t(e,i,{get:()=>a[i],enumerable:!(s=r(a,i))||s.enumerable});return e})(t({},"__esModule",{value:!0}),a);var u=["strict","lax","none"],p=["low","medium","high"],l=class{constructor(e){this._parsed=new Map,this._headers=e;let t=e.get("cookie");if(t){let e=s(t);for(let[t,r]of e)this._parsed.set(t,{name:t,value:r})}}[Symbol.iterator](){return this._parsed[Symbol.iterator]()}get size(){return this._parsed.size}get(...e){let t="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(t)}getAll(...e){var t;let r=Array.from(this._parsed);if(!e.length)return r.map(([e,t])=>t);let n="string"==typeof e[0]?e[0]:null==(t=e[0])?void 0:t.name;return r.filter(([e])=>e===n).map(([e,t])=>t)}has(e){return this._parsed.has(e)}set(...e){let[t,r]=1===e.length?[e[0].name,e[0].value]:e,n=this._parsed;return n.set(t,{name:t,value:r}),this._headers.set("cookie",Array.from(n).map(([e,t])=>i(t)).join("; ")),this}delete(e){let t=this._parsed,r=Array.isArray(e)?e.map(e=>t.delete(e)):t.delete(e);return this._headers.set("cookie",Array.from(t).map(([e,t])=>i(t)).join("; ")),r}clear(){return this.delete(Array.from(this._parsed.keys())),this}[Symbol.for("edge-runtime.inspect.custom")](){return`RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(e=>`${e.name}=${encodeURIComponent(e.value)}`).join("; ")}},c=class{constructor(e){var t,r,n;this._parsed=new Map,this._headers=e;let o=null!=(n=null!=(r=null==(t=e.getSetCookie)?void 0:t.call(e))?r:e.get("set-cookie"))?n:[],a=Array.isArray(o)?o:function(e){if(!e)return[];var t,r,n,o,a,i=[],s=0;function d(){for(;s<e.length&&/\s/.test(e.charAt(s));)s+=1;return s<e.length}for(;s<e.length;){for(t=s,a=!1;d();)if(","===(r=e.charAt(s))){for(n=s,s+=1,d(),o=s;s<e.length&&"="!==(r=e.charAt(s))&&";"!==r&&","!==r;)s+=1;s<e.length&&"="===e.charAt(s)?(a=!0,s=o,i.push(e.substring(t,n)),t=s):s=n+1}else s+=1;(!a||s>=e.length)&&i.push(e.substring(t,e.length))}return i}(o);for(let e of a){let t=d(e);t&&this._parsed.set(t.name,t)}}get(...e){let t="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(t)}getAll(...e){var t;let r=Array.from(this._parsed.values());if(!e.length)return r;let n="string"==typeof e[0]?e[0]:null==(t=e[0])?void 0:t.name;return r.filter(e=>e.name===n)}has(e){return this._parsed.has(e)}set(...e){let[t,r,n]=1===e.length?[e[0].name,e[0].value,e[0]]:e,o=this._parsed;return o.set(t,function(e={name:"",value:""}){return"number"==typeof e.expires&&(e.expires=new Date(e.expires)),e.maxAge&&(e.expires=new Date(Date.now()+1e3*e.maxAge)),(null===e.path||void 0===e.path)&&(e.path="/"),e}({name:t,value:r,...n})),function(e,t){for(let[,r]of(t.delete("set-cookie"),e)){let e=i(r);t.append("set-cookie",e)}}(o,this._headers),this}delete(...e){let[t,r,n]="string"==typeof e[0]?[e[0]]:[e[0].name,e[0].path,e[0].domain];return this.set({name:t,path:r,domain:n,value:"",expires:new Date(0)})}[Symbol.for("edge-runtime.inspect.custom")](){return`ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(i).join("; ")}}},"./dist/compiled/bytes/index.js":e=>{(()=>{"use strict";var t={56:e=>{/*!
 * bytes
 * Copyright(c) 2012-2014 TJ Holowaychuk
 * Copyright(c) 2015 Jed Watson
 * MIT Licensed
 */e.exports=function(e,t){return"string"==typeof e?i(e):"number"==typeof e?a(e,t):null},e.exports.format=a,e.exports.parse=i;var t=/\B(?=(\d{3})+(?!\d))/g,r=/(?:\.0*|(\.[^0]+)0+)$/,n={b:1,kb:1024,mb:1048576,gb:1073741824,tb:1099511627776,pb:0x4000000000000},o=/^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb|pb)$/i;function a(e,o){if(!Number.isFinite(e))return null;var a=Math.abs(e),i=o&&o.thousandsSeparator||"",s=o&&o.unitSeparator||"",d=o&&void 0!==o.decimalPlaces?o.decimalPlaces:2,u=!!(o&&o.fixedDecimals),p=o&&o.unit||"";p&&n[p.toLowerCase()]||(p=a>=n.pb?"PB":a>=n.tb?"TB":a>=n.gb?"GB":a>=n.mb?"MB":a>=n.kb?"KB":"B");var l=(e/n[p.toLowerCase()]).toFixed(d);return u||(l=l.replace(r,"$1")),i&&(l=l.split(".").map(function(e,r){return 0===r?e.replace(t,i):e}).join(".")),l+s+p}function i(e){if("number"==typeof e&&!isNaN(e))return e;if("string"!=typeof e)return null;var t,r=o.exec(e),a="b";return r?(t=parseFloat(r[1]),a=r[4].toLowerCase()):(t=parseInt(e,10),a="b"),Math.floor(n[a]*t)}}},r={};function n(e){var o=r[e];if(void 0!==o)return o.exports;var a=r[e]={exports:{}},i=!0;try{t[e](a,a.exports,n),i=!1}finally{i&&delete r[e]}return a.exports}n.ab=__dirname+"/";var o=n(56);e.exports=o})()},"./dist/compiled/content-type/index.js":e=>{(()=>{"use strict";"undefined"!=typeof __nccwpck_require__&&(__nccwpck_require__.ab=__dirname+"/");var t={};(()=>{/*!
 * content-type
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */var e=/; *([!#$%&'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[\u000b\u0020\u0021\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\u000b\u0020-\u00ff])*"|[!#$%&'*+.^_`|~0-9A-Za-z-]+) */g,r=/^[\u000b\u0020-\u007e\u0080-\u00ff]+$/,n=/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/,o=/\\([\u000b\u0020-\u00ff])/g,a=/([\\"])/g,i=/^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;function s(e){this.parameters=Object.create(null),this.type=e}t.format=function(e){if(!e||"object"!=typeof e)throw TypeError("argument obj is required");var t=e.parameters,o=e.type;if(!o||!i.test(o))throw TypeError("invalid type");var s=o;if(t&&"object"==typeof t)for(var d,u=Object.keys(t).sort(),p=0;p<u.length;p++){if(d=u[p],!n.test(d))throw TypeError("invalid parameter name");s+="; "+d+"="+function(e){var t=String(e);if(n.test(t))return t;if(t.length>0&&!r.test(t))throw TypeError("invalid parameter value");return'"'+t.replace(a,"\\$1")+'"'}(t[d])}return s},t.parse=function(t){if(!t)throw TypeError("argument string is required");var r,n,a,d="object"==typeof t?function(e){var t;if("function"==typeof e.getHeader?t=e.getHeader("content-type"):"object"==typeof e.headers&&(t=e.headers&&e.headers["content-type"]),"string"!=typeof t)throw TypeError("content-type header is missing from object");return t}(t):t;if("string"!=typeof d)throw TypeError("argument string is required to be a string");var u=d.indexOf(";"),p=-1!==u?d.substr(0,u).trim():d.trim();if(!i.test(p))throw TypeError("invalid media type");var l=new s(p.toLowerCase());if(-1!==u){for(e.lastIndex=u;n=e.exec(d);){if(n.index!==u)throw TypeError("invalid parameter format");u+=n[0].length,r=n[1].toLowerCase(),'"'===(a=n[2])[0]&&(a=a.substr(1,a.length-2).replace(o,"$1")),l.parameters[r]=a}if(u!==d.length)throw TypeError("invalid parameter format")}return l}})(),e.exports=t})()},"./dist/compiled/cookie/index.js":e=>{(()=>{"use strict";"undefined"!=typeof __nccwpck_require__&&(__nccwpck_require__.ab=__dirname+"/");var t={};(()=>{/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */t.parse=function(t,r){if("string"!=typeof t)throw TypeError("argument str must be a string");for(var o={},a=t.split(n),i=(r||{}).decode||e,s=0;s<a.length;s++){var d=a[s],u=d.indexOf("=");if(!(u<0)){var p=d.substr(0,u).trim(),l=d.substr(++u,d.length).trim();'"'==l[0]&&(l=l.slice(1,-1)),void 0==o[p]&&(o[p]=function(e,t){try{return t(e)}catch(t){return e}}(l,i))}}return o},t.serialize=function(e,t,n){var a=n||{},i=a.encode||r;if("function"!=typeof i)throw TypeError("option encode is invalid");if(!o.test(e))throw TypeError("argument name is invalid");var s=i(t);if(s&&!o.test(s))throw TypeError("argument val is invalid");var d=e+"="+s;if(null!=a.maxAge){var u=a.maxAge-0;if(isNaN(u)||!isFinite(u))throw TypeError("option maxAge is invalid");d+="; Max-Age="+Math.floor(u)}if(a.domain){if(!o.test(a.domain))throw TypeError("option domain is invalid");d+="; Domain="+a.domain}if(a.path){if(!o.test(a.path))throw TypeError("option path is invalid");d+="; Path="+a.path}if(a.expires){if("function"!=typeof a.expires.toUTCString)throw TypeError("option expires is invalid");d+="; Expires="+a.expires.toUTCString()}if(a.httpOnly&&(d+="; HttpOnly"),a.secure&&(d+="; Secure"),a.sameSite)switch("string"==typeof a.sameSite?a.sameSite.toLowerCase():a.sameSite){case!0:case"strict":d+="; SameSite=Strict";break;case"lax":d+="; SameSite=Lax";break;case"none":d+="; SameSite=None";break;default:throw TypeError("option sameSite is invalid")}return d};var e=decodeURIComponent,r=encodeURIComponent,n=/; */,o=/^[\u0009\u0020-\u007e\u0080-\u00ff]+$/})(),e.exports=t})()},"./dist/compiled/fresh/index.js":e=>{(()=>{"use strict";var t={695:e=>{/*!
 * fresh
 * Copyright(c) 2012 TJ Holowaychuk
 * Copyright(c) 2016-2017 Douglas Christopher Wilson
 * MIT Licensed
 */var t=/(?:^|,)\s*?no-cache\s*?(?:,|$)/;function r(e){var t=e&&Date.parse(e);return"number"==typeof t?t:NaN}e.exports=function(e,n){var o=e["if-modified-since"],a=e["if-none-match"];if(!o&&!a)return!1;var i=e["cache-control"];if(i&&t.test(i))return!1;if(a&&"*"!==a){var s=n.etag;if(!s)return!1;for(var d=!0,u=function(e){for(var t=0,r=[],n=0,o=0,a=e.length;o<a;o++)switch(e.charCodeAt(o)){case 32:n===t&&(n=t=o+1);break;case 44:r.push(e.substring(n,t)),n=t=o+1;break;default:t=o+1}return r.push(e.substring(n,t)),r}(a),p=0;p<u.length;p++){var l=u[p];if(l===s||l==="W/"+s||"W/"+l===s){d=!1;break}}if(d)return!1}if(o){var c=n["last-modified"];if(!c||!(r(c)<=r(o)))return!1}return!0}}},r={};function n(e){var o=r[e];if(void 0!==o)return o.exports;var a=r[e]={exports:{}},i=!0;try{t[e](a,a.exports,n),i=!1}finally{i&&delete r[e]}return a.exports}n.ab=__dirname+"/";var o=n(695);e.exports=o})()},"./dist/esm/server/crypto-utils.js":(e,t,r)=>{"use strict";r.r(t),r.d(t,{decryptWithSecret:()=>s,encryptWithSecret:()=>i});let n=require("crypto");var o=r.n(n);let a="aes-256-gcm";function i(e,t){let r=o().randomBytes(16),n=o().randomBytes(64),i=o().pbkdf2Sync(e,n,1e5,32,"sha512"),s=o().createCipheriv(a,i,r),d=Buffer.concat([s.update(t,"utf8"),s.final()]),u=s.getAuthTag();return Buffer.concat([n,r,u,d]).toString("hex")}function s(e,t){let r=Buffer.from(t,"hex"),n=r.slice(0,64),i=r.slice(64,80),s=r.slice(80,96),d=r.slice(96),u=o().pbkdf2Sync(e,n,1e5,32,"sha512"),p=o().createDecipheriv(a,u,i);return p.setAuthTag(s),p.update(d)+p.final("utf8")}},"next/dist/compiled/jsonwebtoken":e=>{"use strict";e.exports=require("next/dist/compiled/jsonwebtoken")},"next/dist/compiled/raw-body":e=>{"use strict";e.exports=require("next/dist/compiled/raw-body")},querystring:e=>{"use strict";e.exports=require("querystring")}},t={};function r(n){var o=t[n];if(void 0!==o)return o.exports;var a=t[n]={exports:{}};return e[n](a,a.exports,r),a.exports}r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var n in t)r.o(t,n)&&!r.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var n={};(()=>{"use strict";r.r(n),r.d(n,{PagesAPIRouteModule:()=>U,default:()=>F});class e{constructor({userland:e,definition:t}){this.userland=e,this.definition=t}}var t,o,a,i,s,d,u,p,l,c,f,h=r("./dist/compiled/bytes/index.js"),g=r.n(h);let v=e=>{let t=e.length,r=0,n=0,o=8997,a=0,i=33826,s=0,d=40164,u=0,p=52210;for(;r<t;)o^=e.charCodeAt(r++),n=435*o,a=435*i,s=435*d,u=435*p,s+=o<<8,u+=i<<8,a+=n>>>16,o=65535&n,s+=a>>>16,i=65535&a,p=u+(s>>>16)&65535,d=65535&s;return(15&p)*281474976710656+4294967296*d+65536*i+(o^p>>4)},m=(e,t=!1)=>(t?'W/"':'"')+v(e).toString(36)+e.length.toString(36)+'"',y="undefined"!=typeof performance;y&&["mark","measure","getEntriesByName"].every(e=>"function"==typeof performance[e]);var b=r("./dist/compiled/fresh/index.js"),x=r.n(b);let w="x-prerender-revalidate",S="x-prerender-revalidate-if-generated",R={shared:"shared",reactServerComponents:"rsc",serverSideRendering:"ssr",actionBrowser:"action-browser",api:"api",middleware:"middleware",edgeAsset:"edge-asset",appPagesBrowser:"app-pages-browser",appMetadataRoute:"app-metadata-route",appRouteHandler:"app-route-handler"};({...R,GROUP:{server:[R.reactServerComponents,R.actionBrowser,R.appMetadataRoute,R.appRouteHandler],nonClientServerTarget:[R.middleware,R.api],app:[R.reactServerComponents,R.actionBrowser,R.appMetadataRoute,R.appRouteHandler,R.serverSideRendering,R.appPagesBrowser,R.shared]}});let C=require("stream");function j(e){return"object"==typeof e&&null!==e&&"name"in e&&"message"in e}class A{static get(e,t,r){let n=Reflect.get(e,t,r);return"function"==typeof n?n.bind(e):n}static set(e,t,r,n){return Reflect.set(e,t,r,n)}static has(e,t){return Reflect.has(e,t)}static deleteProperty(e,t){return Reflect.deleteProperty(e,t)}}class _ extends Error{constructor(){super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers")}static callable(){throw new _}}class N extends Headers{constructor(e){super(),this.headers=new Proxy(e,{get(t,r,n){if("symbol"==typeof r)return A.get(t,r,n);let o=r.toLowerCase(),a=Object.keys(e).find(e=>e.toLowerCase()===o);if(void 0!==a)return A.get(t,a,n)},set(t,r,n,o){if("symbol"==typeof r)return A.set(t,r,n,o);let a=r.toLowerCase(),i=Object.keys(e).find(e=>e.toLowerCase()===a);return A.set(t,i??r,n,o)},has(t,r){if("symbol"==typeof r)return A.has(t,r);let n=r.toLowerCase(),o=Object.keys(e).find(e=>e.toLowerCase()===n);return void 0!==o&&A.has(t,o)},deleteProperty(t,r){if("symbol"==typeof r)return A.deleteProperty(t,r);let n=r.toLowerCase(),o=Object.keys(e).find(e=>e.toLowerCase()===n);return void 0===o||A.deleteProperty(t,o)}})}static seal(e){return new Proxy(e,{get(e,t,r){switch(t){case"append":case"delete":case"set":return _.callable;default:return A.get(e,t,r)}}})}merge(e){return Array.isArray(e)?e.join(", "):e}static from(e){return e instanceof Headers?e:new N(e)}append(e,t){let r=this.headers[e];"string"==typeof r?this.headers[e]=[r,t]:Array.isArray(r)?r.push(t):this.headers[e]=t}delete(e){delete this.headers[e]}get(e){let t=this.headers[e];return void 0!==t?this.merge(t):null}has(e){return void 0!==this.headers[e]}set(e,t){this.headers[e]=t}forEach(e,t){for(let[r,n]of this.entries())e.call(t,n,r,this)}*entries(){for(let e of Object.keys(this.headers)){let t=e.toLowerCase(),r=this.get(t);yield[t,r]}}*keys(){for(let e of Object.keys(this.headers)){let t=e.toLowerCase();yield t}}*values(){for(let e of Object.keys(this.headers)){let t=this.get(e);yield t}}[Symbol.iterator](){return this.entries()}}let T="__prerender_bypass",H="__next_preview_data",P=Symbol(H),M=Symbol(T);function k(e,t={}){if(M in e)return e;let{serialize:n}=r("./dist/compiled/cookie/index.js"),o=e.getHeader("Set-Cookie");return e.setHeader("Set-Cookie",[..."string"==typeof o?[o]:Array.isArray(o)?o:[],n(T,"",{expires:new Date(0),httpOnly:!0,sameSite:"lax",secure:!1,path:"/",...void 0!==t.path?{path:t.path}:void 0}),n(H,"",{expires:new Date(0),httpOnly:!0,sameSite:"lax",secure:!1,path:"/",...void 0!==t.path?{path:t.path}:void 0})]),Object.defineProperty(e,M,{value:!0,enumerable:!1}),e}class E extends Error{constructor(e,t){super(t),this.statusCode=e}}function O(e,t,r){e.statusCode=t,e.statusMessage=r,e.end(r)}function L({req:e},t,r){let n={configurable:!0,enumerable:!0},o={...n,writable:!0};Object.defineProperty(e,t,{...n,get:()=>{let n=r();return Object.defineProperty(e,t,{...o,value:n}),n},set:r=>{Object.defineProperty(e,t,{...o,value:r})}})}let B=require("next/dist/server/lib/trace/tracer");(function(e){e.handleRequest="BaseServer.handleRequest",e.run="BaseServer.run",e.pipe="BaseServer.pipe",e.getStaticHTML="BaseServer.getStaticHTML",e.render="BaseServer.render",e.renderToResponseWithComponents="BaseServer.renderToResponseWithComponents",e.renderToResponse="BaseServer.renderToResponse",e.renderToHTML="BaseServer.renderToHTML",e.renderError="BaseServer.renderError",e.renderErrorToResponse="BaseServer.renderErrorToResponse",e.renderErrorToHTML="BaseServer.renderErrorToHTML",e.render404="BaseServer.render404"})(t||(t={})),function(e){e.loadDefaultErrorComponents="LoadComponents.loadDefaultErrorComponents",e.loadComponents="LoadComponents.loadComponents"}(o||(o={})),function(e){e.getRequestHandler="NextServer.getRequestHandler",e.getServer="NextServer.getServer",e.getServerRequestHandler="NextServer.getServerRequestHandler",e.createServer="createServer.createServer"}(a||(a={})),function(e){e.compression="NextNodeServer.compression",e.getBuildId="NextNodeServer.getBuildId",e.getLayoutOrPageModule="NextNodeServer.getLayoutOrPageModule",e.generateStaticRoutes="NextNodeServer.generateStaticRoutes",e.generateFsStaticRoutes="NextNodeServer.generateFsStaticRoutes",e.generatePublicRoutes="NextNodeServer.generatePublicRoutes",e.generateImageRoutes="NextNodeServer.generateImageRoutes.route",e.sendRenderResult="NextNodeServer.sendRenderResult",e.proxyRequest="NextNodeServer.proxyRequest",e.runApi="NextNodeServer.runApi",e.render="NextNodeServer.render",e.renderHTML="NextNodeServer.renderHTML",e.imageOptimizer="NextNodeServer.imageOptimizer",e.getPagePath="NextNodeServer.getPagePath",e.getRoutesManifest="NextNodeServer.getRoutesManifest",e.findPageComponents="NextNodeServer.findPageComponents",e.getFontManifest="NextNodeServer.getFontManifest",e.getServerComponentManifest="NextNodeServer.getServerComponentManifest",e.getRequestHandler="NextNodeServer.getRequestHandler",e.renderToHTML="NextNodeServer.renderToHTML",e.renderError="NextNodeServer.renderError",e.renderErrorToHTML="NextNodeServer.renderErrorToHTML",e.render404="NextNodeServer.render404",e.route="route",e.onProxyReq="onProxyReq",e.apiResolver="apiResolver",e.internalFetch="internalFetch"}(i||(i={})),(s||(s={})).startServer="startServer.startServer",function(e){e.getServerSideProps="Render.getServerSideProps",e.getStaticProps="Render.getStaticProps",e.renderToString="Render.renderToString",e.renderDocument="Render.renderDocument",e.createBodyResult="Render.createBodyResult"}(d||(d={})),function(e){e.renderToString="AppRender.renderToString",e.renderToReadableStream="AppRender.renderToReadableStream",e.getBodyResult="AppRender.getBodyResult",e.fetch="AppRender.fetch"}(u||(u={})),(p||(p={})).executeRoute="Router.executeRoute",(l||(l={})).runHandler="Node.runHandler",(c||(c={})).runHandler="AppRouteRouteHandlers.runHandler",function(e){e.generateMetadata="ResolveMetadata.generateMetadata",e.generateViewport="ResolveMetadata.generateViewport"}(f||(f={}));var $=r("./dist/compiled/@edge-runtime/cookies/index.js"),q=r("./dist/compiled/content-type/index.js");async function I(e,t){let n,o;try{n=(0,q.parse)(e.headers["content-type"]||"text/plain")}catch{n=(0,q.parse)("text/plain")}let{type:a,parameters:i}=n,s=i.charset||"utf-8";try{let n=r("next/dist/compiled/raw-body");o=await n(e,{encoding:s,limit:t})}catch(e){if(j(e)&&"entity.too.large"===e.type)throw new E(413,`Body exceeded ${t} limit`);throw new E(400,"Invalid body")}let d=o.toString();if("application/json"===a||"application/ld+json"===a)return function(e){if(0===e.length)return{};try{return JSON.parse(e)}catch(e){throw new E(400,"Invalid JSON")}}(d);if("application/x-www-form-urlencoded"!==a)return d;{let e=r("querystring");return e.decode(d)}}function D(e){return"string"==typeof e&&e.length>=16}async function z(e,t,r,n){if("string"!=typeof e||!e.startsWith("/"))throw Error(`Invalid urlPath provided to revalidate(), must be a path e.g. /blog/post-1, received ${e}`);let o={[w]:n.previewModeId,...t.unstable_onlyGenerated?{[S]:"1"}:{}},a=[...n.allowedRevalidateHeaderKeys||[],...n.trustHostHeader?["cookie","x-vercel-protection-bypass"]:[]];for(let e of Object.keys(r.headers))a.includes(e)&&(o[e]=r.headers[e]);try{if(n.trustHostHeader){let n=await fetch(`https://${r.headers.host}${e}`,{method:"HEAD",headers:o}),a=n.headers.get("x-vercel-cache")||n.headers.get("x-nextjs-cache");if((null==a?void 0:a.toUpperCase())!=="REVALIDATED"&&!(404===n.status&&t.unstable_onlyGenerated))throw Error(`Invalid response ${n.status}`)}else if(n.revalidate)await n.revalidate({urlPath:e,revalidateHeaders:o,opts:t});else throw Error("Invariant: required internal revalidate method not passed to api-utils")}catch(t){throw Error(`Failed to revalidate ${e}: ${j(t)?t.message:t}`)}}async function K(e,t,n,o,a,i,s,d){try{var u,p,c,f,h;if(!o){t.statusCode=404,t.end("Not Found");return}let i=o.config||{},s=(null==(u=i.api)?void 0:u.bodyParser)!==!1,v=(null==(p=i.api)?void 0:p.responseLimit)??!0,y=(null==(c=i.api)?void 0:c.externalResolver)||!1;L({req:e},"cookies",(h=e.headers,function(){let{cookie:e}=h;if(!e)return{};let{parse:t}=r("./dist/compiled/cookie/index.js");return t(Array.isArray(e)?e.join("; "):e)})),e.query=n,L({req:e},"previewData",()=>(function(e,t,n){var o,a;let i;if(n&&function(e,t){let r=N.from(e.headers),n=r.get(w),o=n===t.previewModeId,a=r.has(S);return{isOnDemandRevalidate:o,revalidateOnlyGenerated:a}}(e,n).isOnDemandRevalidate)return!1;if(P in e)return e[P];let s=N.from(e.headers),d=new $.RequestCookies(s),u=null==(o=d.get(T))?void 0:o.value,p=null==(a=d.get(H))?void 0:a.value;if(u&&!p&&u===n.previewModeId){let t={};return Object.defineProperty(e,P,{value:t,enumerable:!1}),t}if(!u&&!p)return!1;if(!u||!p||u!==n.previewModeId)return k(t),!1;try{let e=r("next/dist/compiled/jsonwebtoken");i=e.verify(p,n.previewModeSigningKey)}catch{return k(t),!1}let{decryptWithSecret:l}=r("./dist/esm/server/crypto-utils.js"),c=l(Buffer.from(n.previewModeEncryptionKey),i.data);try{let t=JSON.parse(c);return Object.defineProperty(e,P,{value:t,enumerable:!1}),t}catch{return!1}})(e,t,a)),L({req:e},"preview",()=>!1!==e.previewData||void 0),L({req:e},"draftMode",()=>e.preview),s&&!e.body&&(e.body=await I(e,i.api&&i.api.bodyParser&&i.api.bodyParser.sizeLimit?i.api.bodyParser.sizeLimit:"1mb"));let b=0,R=v&&"boolean"!=typeof v?g().parse(v):4194304,j=t.write,A=t.end;t.write=(...e)=>(b+=Buffer.byteLength(e[0]||""),j.apply(t,e)),t.end=(...r)=>(r.length&&"function"!=typeof r[0]&&(b+=Buffer.byteLength(r[0]||"")),v&&b>=R&&console.warn(`API response for ${e.url} exceeds ${g().format(R)}. API Routes are meant to respond quickly. https://nextjs.org/docs/messages/api-routes-response-size-limit`),A.apply(t,r)),t.status=e=>(t.statusCode=e,t),t.send=r=>(function(e,t,r){if(null==r){t.end();return}if(204===t.statusCode||304===t.statusCode){t.removeHeader("Content-Type"),t.removeHeader("Content-Length"),t.removeHeader("Transfer-Encoding"),r&&console.warn(`A body was attempted to be set with a 204 statusCode for ${e.url}, this is invalid and the body was ignored.
See more info here https://nextjs.org/docs/messages/invalid-api-status-body`),t.end();return}let n=t.getHeader("Content-Type");if(r instanceof C.Stream){n||t.setHeader("Content-Type","application/octet-stream"),r.pipe(t);return}let o=["object","number","boolean"].includes(typeof r),a=o?JSON.stringify(r):r,i=m(a);if(i&&t.setHeader("ETag",i),!x()(e.headers,{etag:i})||(t.statusCode=304,t.end(),0)){if(Buffer.isBuffer(r)){n||t.setHeader("Content-Type","application/octet-stream"),t.setHeader("Content-Length",r.length),t.end(r);return}o&&t.setHeader("Content-Type","application/json; charset=utf-8"),t.setHeader("Content-Length",Buffer.byteLength(a)),t.end(a)}})(e,t,r),t.json=e=>{t.setHeader("Content-Type","application/json; charset=utf-8"),t.send(JSON.stringify(e))},t.redirect=(e,r)=>(function(e,t,r){if("string"==typeof t&&(r=t,t=307),"number"!=typeof t||"string"!=typeof r)throw Error("Invalid redirect arguments. Please use a single argument URL, e.g. res.redirect('/destination') or use a status code and URL, e.g. res.redirect(307, '/destination').");return e.writeHead(t,{Location:r}),e.write(r),e.end(),e})(t,e,r),t.setDraftMode=(e={enable:!0})=>(function(e,t){if(!D(t.previewModeId))throw Error("invariant: invalid previewModeId");let n=t.enable?void 0:new Date(0),{serialize:o}=r("./dist/compiled/cookie/index.js"),a=e.getHeader("Set-Cookie");return e.setHeader("Set-Cookie",[..."string"==typeof a?[a]:Array.isArray(a)?a:[],o(T,t.previewModeId,{httpOnly:!0,sameSite:"lax",secure:!1,path:"/",expires:n})]),e})(t,Object.assign({},a,e)),t.setPreviewData=(e,n={})=>(function(e,t,n){if(!D(n.previewModeId))throw Error("invariant: invalid previewModeId");if(!D(n.previewModeEncryptionKey))throw Error("invariant: invalid previewModeEncryptionKey");if(!D(n.previewModeSigningKey))throw Error("invariant: invalid previewModeSigningKey");let o=r("next/dist/compiled/jsonwebtoken"),{encryptWithSecret:a}=r("./dist/esm/server/crypto-utils.js"),i=o.sign({data:a(Buffer.from(n.previewModeEncryptionKey),JSON.stringify(t))},n.previewModeSigningKey,{algorithm:"HS256",...void 0!==n.maxAge?{expiresIn:n.maxAge}:void 0});if(i.length>2048)throw Error("Preview data is limited to 2KB currently, reduce how much data you are storing as preview data to continue");let{serialize:s}=r("./dist/compiled/cookie/index.js"),d=e.getHeader("Set-Cookie");return e.setHeader("Set-Cookie",[..."string"==typeof d?[d]:Array.isArray(d)?d:[],s(T,n.previewModeId,{httpOnly:!0,sameSite:"lax",secure:!1,path:"/",...void 0!==n.maxAge?{maxAge:n.maxAge}:void 0,...void 0!==n.path?{path:n.path}:void 0}),s(H,i,{httpOnly:!0,sameSite:"lax",secure:!1,path:"/",...void 0!==n.maxAge?{maxAge:n.maxAge}:void 0,...void 0!==n.path?{path:n.path}:void 0})]),e})(t,e,Object.assign({},a,n)),t.clearPreviewData=(e={})=>k(t,e),t.revalidate=(t,r)=>z(t,r||{},e,a);let _=o.default||o,M=!1;t.once("pipe",()=>M=!0),null==(f=(0,B.getTracer)().getRootSpanAttributes())||f.set("next.route",d);let E=await (0,B.getTracer)().trace(l.runHandler,{spanName:`executing api route (pages) ${d}`},()=>_(e,t));if(void 0!==E){if(E instanceof Response)throw Error('API route returned a Response object in the Node.js runtime, this is not supported. Please use `runtime: "edge"` instead: https://nextjs.org/docs/api-routes/edge-api-routes');console.warn(`API handler should not return a value, received ${typeof E}.`)}y||t.finished||t.headersSent||M||console.warn(`API resolved without sending a response for ${e.url}, this may result in stalled requests.`)}catch(e){if(e instanceof E)O(t,e.statusCode,e.message);else{if(s)throw j(e)&&(e.page=d),e;if(console.error(e),i)throw e;O(t,500,"Internal Server Error")}}}class U extends e{constructor(e){if(super(e),"function"!=typeof e.userland.default)throw Error(`Page ${e.definition.page} does not export a default function.`)}async render(e,t,r){await K(e,t,r.query,this.userland,{...r.previewProps,revalidate:r.revalidate,trustHostHeader:r.trustHostHeader,allowedRevalidateHeaderKeys:r.allowedRevalidateHeaderKeys,hostname:r.hostname},r.minimalMode,r.dev,r.page)}}let F=U})(),module.exports=n})();
//# sourceMappingURL=pages-api.runtime.dev.js.map