(()=>{var e={"./dist/compiled/@edge-runtime/cookies/index.js":e=>{"use strict";var r=Object.defineProperty,t=Object.getOwnPropertyDescriptor,n=Object.getOwnPropertyNames,o=Object.prototype.hasOwnProperty,a={};function i(e){var r;let t=["path"in e&&e.path&&`Path=${e.path}`,"expires"in e&&(e.expires||0===e.expires)&&`Expires=${("number"==typeof e.expires?new Date(e.expires):e.expires).toUTCString()}`,"maxAge"in e&&"number"==typeof e.maxAge&&`Max-Age=${e.maxAge}`,"domain"in e&&e.domain&&`Domain=${e.domain}`,"secure"in e&&e.secure&&"Secure","httpOnly"in e&&e.httpOnly&&"HttpOnly","sameSite"in e&&e.sameSite&&`SameSite=${e.sameSite}`,"priority"in e&&e.priority&&`Priority=${e.priority}`].filter(Boolean);return`${e.name}=${encodeURIComponent(null!=(r=e.value)?r:"")}; ${t.join("; ")}`}function s(e){let r=new Map;for(let t of e.split(/; */)){if(!t)continue;let e=t.indexOf("=");if(-1===e){r.set(t,"true");continue}let[n,o]=[t.slice(0,e),t.slice(e+1)];try{r.set(n,decodeURIComponent(null!=o?o:"true"))}catch{}}return r}function d(e){var r,t;if(!e)return;let[[n,o],...a]=s(e),{domain:i,expires:d,httponly:l,maxage:c,path:f,samesite:h,secure:g,priority:v}=Object.fromEntries(a.map(([e,r])=>[e.toLowerCase(),r])),m={name:n,value:decodeURIComponent(o),domain:i,...d&&{expires:new Date(d)},...l&&{httpOnly:!0},..."string"==typeof c&&{maxAge:Number(c)},path:f,...h&&{sameSite:p.includes(r=(r=h).toLowerCase())?r:void 0},...g&&{secure:!0},...v&&{priority:u.includes(t=(t=v).toLowerCase())?t:void 0}};return function(e){let r={};for(let t in e)e[t]&&(r[t]=e[t]);return r}(m)}((e,t)=>{for(var n in t)r(e,n,{get:t[n],enumerable:!0})})(a,{RequestCookies:()=>l,ResponseCookies:()=>c,parseCookie:()=>s,parseSetCookie:()=>d,stringifyCookie:()=>i}),e.exports=((e,a,i,s)=>{if(a&&"object"==typeof a||"function"==typeof a)for(let i of n(a))o.call(e,i)||void 0===i||r(e,i,{get:()=>a[i],enumerable:!(s=t(a,i))||s.enumerable});return e})(r({},"__esModule",{value:!0}),a);var p=["strict","lax","none"],u=["low","medium","high"],l=class{constructor(e){this._parsed=new Map,this._headers=e;let r=e.get("cookie");if(r){let e=s(r);for(let[r,t]of e)this._parsed.set(r,{name:r,value:t})}}[Symbol.iterator](){return this._parsed[Symbol.iterator]()}get size(){return this._parsed.size}get(...e){let r="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(r)}getAll(...e){var r;let t=Array.from(this._parsed);if(!e.length)return t.map(([e,r])=>r);let n="string"==typeof e[0]?e[0]:null==(r=e[0])?void 0:r.name;return t.filter(([e])=>e===n).map(([e,r])=>r)}has(e){return this._parsed.has(e)}set(...e){let[r,t]=1===e.length?[e[0].name,e[0].value]:e,n=this._parsed;return n.set(r,{name:r,value:t}),this._headers.set("cookie",Array.from(n).map(([e,r])=>i(r)).join("; ")),this}delete(e){let r=this._parsed,t=Array.isArray(e)?e.map(e=>r.delete(e)):r.delete(e);return this._headers.set("cookie",Array.from(r).map(([e,r])=>i(r)).join("; ")),t}clear(){return this.delete(Array.from(this._parsed.keys())),this}[Symbol.for("edge-runtime.inspect.custom")](){return`RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(e=>`${e.name}=${encodeURIComponent(e.value)}`).join("; ")}},c=class{constructor(e){var r,t,n;this._parsed=new Map,this._headers=e;let o=null!=(n=null!=(t=null==(r=e.getSetCookie)?void 0:r.call(e))?t:e.get("set-cookie"))?n:[],a=Array.isArray(o)?o:function(e){if(!e)return[];var r,t,n,o,a,i=[],s=0;function d(){for(;s<e.length&&/\s/.test(e.charAt(s));)s+=1;return s<e.length}for(;s<e.length;){for(r=s,a=!1;d();)if(","===(t=e.charAt(s))){for(n=s,s+=1,d(),o=s;s<e.length&&"="!==(t=e.charAt(s))&&";"!==t&&","!==t;)s+=1;s<e.length&&"="===e.charAt(s)?(a=!0,s=o,i.push(e.substring(r,n)),r=s):s=n+1}else s+=1;(!a||s>=e.length)&&i.push(e.substring(r,e.length))}return i}(o);for(let e of a){let r=d(e);r&&this._parsed.set(r.name,r)}}get(...e){let r="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(r)}getAll(...e){var r;let t=Array.from(this._parsed.values());if(!e.length)return t;let n="string"==typeof e[0]?e[0]:null==(r=e[0])?void 0:r.name;return t.filter(e=>e.name===n)}has(e){return this._parsed.has(e)}set(...e){let[r,t,n]=1===e.length?[e[0].name,e[0].value,e[0]]:e,o=this._parsed;return o.set(r,function(e={name:"",value:""}){return"number"==typeof e.expires&&(e.expires=new Date(e.expires)),e.maxAge&&(e.expires=new Date(Date.now()+1e3*e.maxAge)),(null===e.path||void 0===e.path)&&(e.path="/"),e}({name:r,value:t,...n})),function(e,r){for(let[,t]of(r.delete("set-cookie"),e)){let e=i(t);r.append("set-cookie",e)}}(o,this._headers),this}delete(...e){let[r,t,n]="string"==typeof e[0]?[e[0]]:[e[0].name,e[0].path,e[0].domain];return this.set({name:r,path:t,domain:n,value:"",expires:new Date(0)})}[Symbol.for("edge-runtime.inspect.custom")](){return`ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(i).join("; ")}}},"./dist/compiled/bytes/index.js":e=>{(()=>{"use strict";var r={56:e=>{/*!
 * bytes
 * Copyright(c) 2012-2014 TJ Holowaychuk
 * Copyright(c) 2015 Jed Watson
 * MIT Licensed
 */e.exports=function(e,r){return"string"==typeof e?i(e):"number"==typeof e?a(e,r):null},e.exports.format=a,e.exports.parse=i;var r=/\B(?=(\d{3})+(?!\d))/g,t=/(?:\.0*|(\.[^0]+)0+)$/,n={b:1,kb:1024,mb:1048576,gb:1073741824,tb:1099511627776,pb:0x4000000000000},o=/^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb|pb)$/i;function a(e,o){if(!Number.isFinite(e))return null;var a=Math.abs(e),i=o&&o.thousandsSeparator||"",s=o&&o.unitSeparator||"",d=o&&void 0!==o.decimalPlaces?o.decimalPlaces:2,p=!!(o&&o.fixedDecimals),u=o&&o.unit||"";u&&n[u.toLowerCase()]||(u=a>=n.pb?"PB":a>=n.tb?"TB":a>=n.gb?"GB":a>=n.mb?"MB":a>=n.kb?"KB":"B");var l=(e/n[u.toLowerCase()]).toFixed(d);return p||(l=l.replace(t,"$1")),i&&(l=l.split(".").map(function(e,t){return 0===t?e.replace(r,i):e}).join(".")),l+s+u}function i(e){if("number"==typeof e&&!isNaN(e))return e;if("string"!=typeof e)return null;var r,t=o.exec(e),a="b";return t?(r=parseFloat(t[1]),a=t[4].toLowerCase()):(r=parseInt(e,10),a="b"),Math.floor(n[a]*r)}}},t={};function n(e){var o=t[e];if(void 0!==o)return o.exports;var a=t[e]={exports:{}},i=!0;try{r[e](a,a.exports,n),i=!1}finally{i&&delete t[e]}return a.exports}n.ab=__dirname+"/";var o=n(56);e.exports=o})()},"./dist/compiled/content-type/index.js":e=>{(()=>{"use strict";"undefined"!=typeof __nccwpck_require__&&(__nccwpck_require__.ab=__dirname+"/");var r={};(()=>{/*!
 * content-type
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */var e=/; *([!#$%&'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[\u000b\u0020\u0021\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\u000b\u0020-\u00ff])*"|[!#$%&'*+.^_`|~0-9A-Za-z-]+) */g,t=/^[\u000b\u0020-\u007e\u0080-\u00ff]+$/,n=/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/,o=/\\([\u000b\u0020-\u00ff])/g,a=/([\\"])/g,i=/^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;function s(e){this.parameters=Object.create(null),this.type=e}r.format=function(e){if(!e||"object"!=typeof e)throw TypeError("argument obj is required");var r=e.parameters,o=e.type;if(!o||!i.test(o))throw TypeError("invalid type");var s=o;if(r&&"object"==typeof r)for(var d,p=Object.keys(r).sort(),u=0;u<p.length;u++){if(d=p[u],!n.test(d))throw TypeError("invalid parameter name");s+="; "+d+"="+function(e){var r=String(e);if(n.test(r))return r;if(r.length>0&&!t.test(r))throw TypeError("invalid parameter value");return'"'+r.replace(a,"\\$1")+'"'}(r[d])}return s},r.parse=function(r){if(!r)throw TypeError("argument string is required");var t,n,a,d="object"==typeof r?function(e){var r;if("function"==typeof e.getHeader?r=e.getHeader("content-type"):"object"==typeof e.headers&&(r=e.headers&&e.headers["content-type"]),"string"!=typeof r)throw TypeError("content-type header is missing from object");return r}(r):r;if("string"!=typeof d)throw TypeError("argument string is required to be a string");var p=d.indexOf(";"),u=-1!==p?d.substr(0,p).trim():d.trim();if(!i.test(u))throw TypeError("invalid media type");var l=new s(u.toLowerCase());if(-1!==p){for(e.lastIndex=p;n=e.exec(d);){if(n.index!==p)throw TypeError("invalid parameter format");p+=n[0].length,t=n[1].toLowerCase(),'"'===(a=n[2])[0]&&(a=a.substr(1,a.length-2).replace(o,"$1")),l.parameters[t]=a}if(p!==d.length)throw TypeError("invalid parameter format")}return l}})(),e.exports=r})()},"./dist/compiled/cookie/index.js":e=>{(()=>{"use strict";"undefined"!=typeof __nccwpck_require__&&(__nccwpck_require__.ab=__dirname+"/");var r={};(()=>{/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */r.parse=function(r,t){if("string"!=typeof r)throw TypeError("argument str must be a string");for(var o={},a=r.split(n),i=(t||{}).decode||e,s=0;s<a.length;s++){var d=a[s],p=d.indexOf("=");if(!(p<0)){var u=d.substr(0,p).trim(),l=d.substr(++p,d.length).trim();'"'==l[0]&&(l=l.slice(1,-1)),void 0==o[u]&&(o[u]=function(e,r){try{return r(e)}catch(r){return e}}(l,i))}}return o},r.serialize=function(e,r,n){var a=n||{},i=a.encode||t;if("function"!=typeof i)throw TypeError("option encode is invalid");if(!o.test(e))throw TypeError("argument name is invalid");var s=i(r);if(s&&!o.test(s))throw TypeError("argument val is invalid");var d=e+"="+s;if(null!=a.maxAge){var p=a.maxAge-0;if(isNaN(p)||!isFinite(p))throw TypeError("option maxAge is invalid");d+="; Max-Age="+Math.floor(p)}if(a.domain){if(!o.test(a.domain))throw TypeError("option domain is invalid");d+="; Domain="+a.domain}if(a.path){if(!o.test(a.path))throw TypeError("option path is invalid");d+="; Path="+a.path}if(a.expires){if("function"!=typeof a.expires.toUTCString)throw TypeError("option expires is invalid");d+="; Expires="+a.expires.toUTCString()}if(a.httpOnly&&(d+="; HttpOnly"),a.secure&&(d+="; Secure"),a.sameSite)switch("string"==typeof a.sameSite?a.sameSite.toLowerCase():a.sameSite){case!0:case"strict":d+="; SameSite=Strict";break;case"lax":d+="; SameSite=Lax";break;case"none":d+="; SameSite=None";break;default:throw TypeError("option sameSite is invalid")}return d};var e=decodeURIComponent,t=encodeURIComponent,n=/; */,o=/^[\u0009\u0020-\u007e\u0080-\u00ff]+$/})(),e.exports=r})()},"./dist/compiled/fresh/index.js":e=>{(()=>{"use strict";var r={695:e=>{/*!
 * fresh
 * Copyright(c) 2012 TJ Holowaychuk
 * Copyright(c) 2016-2017 Douglas Christopher Wilson
 * MIT Licensed
 */var r=/(?:^|,)\s*?no-cache\s*?(?:,|$)/;function t(e){var r=e&&Date.parse(e);return"number"==typeof r?r:NaN}e.exports=function(e,n){var o=e["if-modified-since"],a=e["if-none-match"];if(!o&&!a)return!1;var i=e["cache-control"];if(i&&r.test(i))return!1;if(a&&"*"!==a){var s=n.etag;if(!s)return!1;for(var d=!0,p=function(e){for(var r=0,t=[],n=0,o=0,a=e.length;o<a;o++)switch(e.charCodeAt(o)){case 32:n===r&&(n=r=o+1);break;case 44:t.push(e.substring(n,r)),n=r=o+1;break;default:r=o+1}return t.push(e.substring(n,r)),t}(a),u=0;u<p.length;u++){var l=p[u];if(l===s||l==="W/"+s||"W/"+l===s){d=!1;break}}if(d)return!1}if(o){var c=n["last-modified"];if(!c||!(t(c)<=t(o)))return!1}return!0}}},t={};function n(e){var o=t[e];if(void 0!==o)return o.exports;var a=t[e]={exports:{}},i=!0;try{r[e](a,a.exports,n),i=!1}finally{i&&delete t[e]}return a.exports}n.ab=__dirname+"/";var o=n(695);e.exports=o})()},"./dist/esm/server/crypto-utils.js":(e,r,t)=>{"use strict";t.r(r),t.d(r,{decryptWithSecret:()=>s,encryptWithSecret:()=>i});let n=require("crypto");var o=t.n(n);let a="aes-256-gcm";function i(e,r){let t=o().randomBytes(16),n=o().randomBytes(64),i=o().pbkdf2Sync(e,n,1e5,32,"sha512"),s=o().createCipheriv(a,i,t),d=Buffer.concat([s.update(r,"utf8"),s.final()]),p=s.getAuthTag();return Buffer.concat([n,t,p,d]).toString("hex")}function s(e,r){let t=Buffer.from(r,"hex"),n=t.slice(0,64),i=t.slice(64,80),s=t.slice(80,96),d=t.slice(96),p=o().pbkdf2Sync(e,n,1e5,32,"sha512"),u=o().createDecipheriv(a,p,i);return u.setAuthTag(s),u.update(d)+u.final("utf8")}},"next/dist/compiled/jsonwebtoken":e=>{"use strict";e.exports=require("next/dist/compiled/jsonwebtoken")},"next/dist/compiled/raw-body":e=>{"use strict";e.exports=require("next/dist/compiled/raw-body")},querystring:e=>{"use strict";e.exports=require("querystring")}},r={};function t(n){var o=r[n];if(void 0!==o)return o.exports;var a=r[n]={exports:{}};return e[n](a,a.exports,t),a.exports}t.n=e=>{var r=e&&e.__esModule?()=>e.default:()=>e;return t.d(r,{a:r}),r},t.d=(e,r)=>{for(var n in r)t.o(r,n)&&!t.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:r[n]})},t.o=(e,r)=>Object.prototype.hasOwnProperty.call(e,r),t.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var n={};(()=>{"use strict";t.r(n),t.d(n,{PagesAPIRouteModule:()=>U,default:()=>F});class e{constructor({userland:e,definition:r}){this.userland=e,this.definition=r}}var r,o,a,i,s,d,p,u,l,c,f,h=t("./dist/compiled/bytes/index.js"),g=t.n(h);let v=e=>{let r=e.length,t=0,n=0,o=8997,a=0,i=33826,s=0,d=40164,p=0,u=52210;for(;t<r;)o^=e.charCodeAt(t++),n=435*o,a=435*i,s=435*d,p=435*u,s+=o<<8,p+=i<<8,a+=n>>>16,o=65535&n,s+=a>>>16,i=65535&a,u=p+(s>>>16)&65535,d=65535&s;return(15&u)*281474976710656+4294967296*d+65536*i+(o^u>>4)},m=(e,r=!1)=>(r?'W/"':'"')+v(e).toString(36)+e.length.toString(36)+'"',y="undefined"!=typeof performance;y&&["mark","measure","getEntriesByName"].every(e=>"function"==typeof performance[e]);var b=t("./dist/compiled/fresh/index.js"),x=t.n(b);let w="x-prerender-revalidate",S="x-prerender-revalidate-if-generated",R={shared:"shared",reactServerComponents:"rsc",serverSideRendering:"ssr",actionBrowser:"action-browser",api:"api",middleware:"middleware",edgeAsset:"edge-asset",appPagesBrowser:"app-pages-browser",appMetadataRoute:"app-metadata-route",appRouteHandler:"app-route-handler"};({...R,GROUP:{server:[R.reactServerComponents,R.actionBrowser,R.appMetadataRoute,R.appRouteHandler],nonClientServerTarget:[R.middleware,R.api],app:[R.reactServerComponents,R.actionBrowser,R.appMetadataRoute,R.appRouteHandler,R.serverSideRendering,R.appPagesBrowser,R.shared]}});let C=require("stream");function j(e){return"object"==typeof e&&null!==e&&"name"in e&&"message"in e}class _{static get(e,r,t){let n=Reflect.get(e,r,t);return"function"==typeof n?n.bind(e):n}static set(e,r,t,n){return Reflect.set(e,r,t,n)}static has(e,r){return Reflect.has(e,r)}static deleteProperty(e,r){return Reflect.deleteProperty(e,r)}}class N extends Error{constructor(){super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers")}static callable(){throw new N}}class T extends Headers{constructor(e){super(),this.headers=new Proxy(e,{get(r,t,n){if("symbol"==typeof t)return _.get(r,t,n);let o=t.toLowerCase(),a=Object.keys(e).find(e=>e.toLowerCase()===o);if(void 0!==a)return _.get(r,a,n)},set(r,t,n,o){if("symbol"==typeof t)return _.set(r,t,n,o);let a=t.toLowerCase(),i=Object.keys(e).find(e=>e.toLowerCase()===a);return _.set(r,i??t,n,o)},has(r,t){if("symbol"==typeof t)return _.has(r,t);let n=t.toLowerCase(),o=Object.keys(e).find(e=>e.toLowerCase()===n);return void 0!==o&&_.has(r,o)},deleteProperty(r,t){if("symbol"==typeof t)return _.deleteProperty(r,t);let n=t.toLowerCase(),o=Object.keys(e).find(e=>e.toLowerCase()===n);return void 0===o||_.deleteProperty(r,o)}})}static seal(e){return new Proxy(e,{get(e,r,t){switch(r){case"append":case"delete":case"set":return N.callable;default:return _.get(e,r,t)}}})}merge(e){return Array.isArray(e)?e.join(", "):e}static from(e){return e instanceof Headers?e:new T(e)}append(e,r){let t=this.headers[e];"string"==typeof t?this.headers[e]=[t,r]:Array.isArray(t)?t.push(r):this.headers[e]=r}delete(e){delete this.headers[e]}get(e){let r=this.headers[e];return void 0!==r?this.merge(r):null}has(e){return void 0!==this.headers[e]}set(e,r){this.headers[e]=r}forEach(e,r){for(let[t,n]of this.entries())e.call(r,n,t,this)}*entries(){for(let e of Object.keys(this.headers)){let r=e.toLowerCase(),t=this.get(r);yield[r,t]}}*keys(){for(let e of Object.keys(this.headers)){let r=e.toLowerCase();yield r}}*values(){for(let e of Object.keys(this.headers)){let r=this.get(e);yield r}}[Symbol.iterator](){return this.entries()}}let A="__prerender_bypass",H="__next_preview_data",M=Symbol(H),k=Symbol(A);function E(e,r={}){if(k in e)return e;let{serialize:n}=t("./dist/compiled/cookie/index.js"),o=e.getHeader("Set-Cookie");return e.setHeader("Set-Cookie",[..."string"==typeof o?[o]:Array.isArray(o)?o:[],n(A,"",{expires:new Date(0),httpOnly:!0,sameSite:"none",secure:!0,path:"/",...void 0!==r.path?{path:r.path}:void 0}),n(H,"",{expires:new Date(0),httpOnly:!0,sameSite:"none",secure:!0,path:"/",...void 0!==r.path?{path:r.path}:void 0})]),Object.defineProperty(e,k,{value:!0,enumerable:!1}),e}class O extends Error{constructor(e,r){super(r),this.statusCode=e}}function P(e,r,t){e.statusCode=r,e.statusMessage=t,e.end(t)}function L({req:e},r,t){let n={configurable:!0,enumerable:!0},o={...n,writable:!0};Object.defineProperty(e,r,{...n,get:()=>{let n=t();return Object.defineProperty(e,r,{...o,value:n}),n},set:t=>{Object.defineProperty(e,r,{...o,value:t})}})}let B=require("next/dist/server/lib/trace/tracer");(function(e){e.handleRequest="BaseServer.handleRequest",e.run="BaseServer.run",e.pipe="BaseServer.pipe",e.getStaticHTML="BaseServer.getStaticHTML",e.render="BaseServer.render",e.renderToResponseWithComponents="BaseServer.renderToResponseWithComponents",e.renderToResponse="BaseServer.renderToResponse",e.renderToHTML="BaseServer.renderToHTML",e.renderError="BaseServer.renderError",e.renderErrorToResponse="BaseServer.renderErrorToResponse",e.renderErrorToHTML="BaseServer.renderErrorToHTML",e.render404="BaseServer.render404"})(r||(r={})),function(e){e.loadDefaultErrorComponents="LoadComponents.loadDefaultErrorComponents",e.loadComponents="LoadComponents.loadComponents"}(o||(o={})),function(e){e.getRequestHandler="NextServer.getRequestHandler",e.getServer="NextServer.getServer",e.getServerRequestHandler="NextServer.getServerRequestHandler",e.createServer="createServer.createServer"}(a||(a={})),function(e){e.compression="NextNodeServer.compression",e.getBuildId="NextNodeServer.getBuildId",e.getLayoutOrPageModule="NextNodeServer.getLayoutOrPageModule",e.generateStaticRoutes="NextNodeServer.generateStaticRoutes",e.generateFsStaticRoutes="NextNodeServer.generateFsStaticRoutes",e.generatePublicRoutes="NextNodeServer.generatePublicRoutes",e.generateImageRoutes="NextNodeServer.generateImageRoutes.route",e.sendRenderResult="NextNodeServer.sendRenderResult",e.proxyRequest="NextNodeServer.proxyRequest",e.runApi="NextNodeServer.runApi",e.render="NextNodeServer.render",e.renderHTML="NextNodeServer.renderHTML",e.imageOptimizer="NextNodeServer.imageOptimizer",e.getPagePath="NextNodeServer.getPagePath",e.getRoutesManifest="NextNodeServer.getRoutesManifest",e.findPageComponents="NextNodeServer.findPageComponents",e.getFontManifest="NextNodeServer.getFontManifest",e.getServerComponentManifest="NextNodeServer.getServerComponentManifest",e.getRequestHandler="NextNodeServer.getRequestHandler",e.renderToHTML="NextNodeServer.renderToHTML",e.renderError="NextNodeServer.renderError",e.renderErrorToHTML="NextNodeServer.renderErrorToHTML",e.render404="NextNodeServer.render404",e.route="route",e.onProxyReq="onProxyReq",e.apiResolver="apiResolver",e.internalFetch="internalFetch"}(i||(i={})),(s||(s={})).startServer="startServer.startServer",function(e){e.getServerSideProps="Render.getServerSideProps",e.getStaticProps="Render.getStaticProps",e.renderToString="Render.renderToString",e.renderDocument="Render.renderDocument",e.createBodyResult="Render.createBodyResult"}(d||(d={})),function(e){e.renderToString="AppRender.renderToString",e.renderToReadableStream="AppRender.renderToReadableStream",e.getBodyResult="AppRender.getBodyResult",e.fetch="AppRender.fetch"}(p||(p={})),(u||(u={})).executeRoute="Router.executeRoute",(l||(l={})).runHandler="Node.runHandler",(c||(c={})).runHandler="AppRouteRouteHandlers.runHandler",function(e){e.generateMetadata="ResolveMetadata.generateMetadata",e.generateViewport="ResolveMetadata.generateViewport"}(f||(f={}));var q=t("./dist/compiled/@edge-runtime/cookies/index.js"),$=t("./dist/compiled/content-type/index.js");async function I(e,r){let n,o;try{n=(0,$.parse)(e.headers["content-type"]||"text/plain")}catch{n=(0,$.parse)("text/plain")}let{type:a,parameters:i}=n,s=i.charset||"utf-8";try{let n=t("next/dist/compiled/raw-body");o=await n(e,{encoding:s,limit:r})}catch(e){if(j(e)&&"entity.too.large"===e.type)throw new O(413,`Body exceeded ${r} limit`);throw new O(400,"Invalid body")}let d=o.toString();if("application/json"===a||"application/ld+json"===a)return function(e){if(0===e.length)return{};try{return JSON.parse(e)}catch(e){throw new O(400,"Invalid JSON")}}(d);if("application/x-www-form-urlencoded"!==a)return d;{let e=t("querystring");return e.decode(d)}}function D(e){return"string"==typeof e&&e.length>=16}async function z(e,r,t,n){if("string"!=typeof e||!e.startsWith("/"))throw Error(`Invalid urlPath provided to revalidate(), must be a path e.g. /blog/post-1, received ${e}`);let o={[w]:n.previewModeId,...r.unstable_onlyGenerated?{[S]:"1"}:{}},a=[...n.allowedRevalidateHeaderKeys||[],...n.trustHostHeader?["cookie","x-vercel-protection-bypass"]:[]];for(let e of Object.keys(t.headers))a.includes(e)&&(o[e]=t.headers[e]);try{if(n.trustHostHeader){let n=await fetch(`https://${t.headers.host}${e}`,{method:"HEAD",headers:o}),a=n.headers.get("x-vercel-cache")||n.headers.get("x-nextjs-cache");if((null==a?void 0:a.toUpperCase())!=="REVALIDATED"&&!(404===n.status&&r.unstable_onlyGenerated))throw Error(`Invalid response ${n.status}`)}else if(n.revalidate)await n.revalidate({urlPath:e,revalidateHeaders:o,opts:r});else throw Error("Invariant: required internal revalidate method not passed to api-utils")}catch(r){throw Error(`Failed to revalidate ${e}: ${j(r)?r.message:r}`)}}async function K(e,r,n,o,a,i,s,d){try{var p,u,c,f,h;if(!o){r.statusCode=404,r.end("Not Found");return}let i=o.config||{},s=(null==(p=i.api)?void 0:p.bodyParser)!==!1,v=(null==(u=i.api)?void 0:u.responseLimit)??!0;null==(c=i.api)||c.externalResolver,L({req:e},"cookies",(h=e.headers,function(){let{cookie:e}=h;if(!e)return{};let{parse:r}=t("./dist/compiled/cookie/index.js");return r(Array.isArray(e)?e.join("; "):e)})),e.query=n,L({req:e},"previewData",()=>(function(e,r,n){var o,a;let i;if(n&&function(e,r){let t=T.from(e.headers),n=t.get(w),o=n===r.previewModeId,a=t.has(S);return{isOnDemandRevalidate:o,revalidateOnlyGenerated:a}}(e,n).isOnDemandRevalidate)return!1;if(M in e)return e[M];let s=T.from(e.headers),d=new q.RequestCookies(s),p=null==(o=d.get(A))?void 0:o.value,u=null==(a=d.get(H))?void 0:a.value;if(p&&!u&&p===n.previewModeId){let r={};return Object.defineProperty(e,M,{value:r,enumerable:!1}),r}if(!p&&!u)return!1;if(!p||!u||p!==n.previewModeId)return E(r),!1;try{let e=t("next/dist/compiled/jsonwebtoken");i=e.verify(u,n.previewModeSigningKey)}catch{return E(r),!1}let{decryptWithSecret:l}=t("./dist/esm/server/crypto-utils.js"),c=l(Buffer.from(n.previewModeEncryptionKey),i.data);try{let r=JSON.parse(c);return Object.defineProperty(e,M,{value:r,enumerable:!1}),r}catch{return!1}})(e,r,a)),L({req:e},"preview",()=>!1!==e.previewData||void 0),L({req:e},"draftMode",()=>e.preview),s&&!e.body&&(e.body=await I(e,i.api&&i.api.bodyParser&&i.api.bodyParser.sizeLimit?i.api.bodyParser.sizeLimit:"1mb"));let y=0,b=v&&"boolean"!=typeof v?g().parse(v):4194304,R=r.write,j=r.end;r.write=(...e)=>(y+=Buffer.byteLength(e[0]||""),R.apply(r,e)),r.end=(...t)=>(t.length&&"function"!=typeof t[0]&&(y+=Buffer.byteLength(t[0]||"")),v&&y>=b&&console.warn(`API response for ${e.url} exceeds ${g().format(b)}. API Routes are meant to respond quickly. https://nextjs.org/docs/messages/api-routes-response-size-limit`),j.apply(r,t)),r.status=e=>(r.statusCode=e,r),r.send=t=>(function(e,r,t){if(null==t){r.end();return}if(204===r.statusCode||304===r.statusCode){r.removeHeader("Content-Type"),r.removeHeader("Content-Length"),r.removeHeader("Transfer-Encoding"),r.end();return}let n=r.getHeader("Content-Type");if(t instanceof C.Stream){n||r.setHeader("Content-Type","application/octet-stream"),t.pipe(r);return}let o=["object","number","boolean"].includes(typeof t),a=o?JSON.stringify(t):t,i=m(a);if(i&&r.setHeader("ETag",i),!x()(e.headers,{etag:i})||(r.statusCode=304,r.end(),0)){if(Buffer.isBuffer(t)){n||r.setHeader("Content-Type","application/octet-stream"),r.setHeader("Content-Length",t.length),r.end(t);return}o&&r.setHeader("Content-Type","application/json; charset=utf-8"),r.setHeader("Content-Length",Buffer.byteLength(a)),r.end(a)}})(e,r,t),r.json=e=>{r.setHeader("Content-Type","application/json; charset=utf-8"),r.send(JSON.stringify(e))},r.redirect=(e,t)=>(function(e,r,t){if("string"==typeof r&&(t=r,r=307),"number"!=typeof r||"string"!=typeof t)throw Error("Invalid redirect arguments. Please use a single argument URL, e.g. res.redirect('/destination') or use a status code and URL, e.g. res.redirect(307, '/destination').");return e.writeHead(r,{Location:t}),e.write(t),e.end(),e})(r,e,t),r.setDraftMode=(e={enable:!0})=>(function(e,r){if(!D(r.previewModeId))throw Error("invariant: invalid previewModeId");let n=r.enable?void 0:new Date(0),{serialize:o}=t("./dist/compiled/cookie/index.js"),a=e.getHeader("Set-Cookie");return e.setHeader("Set-Cookie",[..."string"==typeof a?[a]:Array.isArray(a)?a:[],o(A,r.previewModeId,{httpOnly:!0,sameSite:"none",secure:!0,path:"/",expires:n})]),e})(r,Object.assign({},a,e)),r.setPreviewData=(e,n={})=>(function(e,r,n){if(!D(n.previewModeId))throw Error("invariant: invalid previewModeId");if(!D(n.previewModeEncryptionKey))throw Error("invariant: invalid previewModeEncryptionKey");if(!D(n.previewModeSigningKey))throw Error("invariant: invalid previewModeSigningKey");let o=t("next/dist/compiled/jsonwebtoken"),{encryptWithSecret:a}=t("./dist/esm/server/crypto-utils.js"),i=o.sign({data:a(Buffer.from(n.previewModeEncryptionKey),JSON.stringify(r))},n.previewModeSigningKey,{algorithm:"HS256",...void 0!==n.maxAge?{expiresIn:n.maxAge}:void 0});if(i.length>2048)throw Error("Preview data is limited to 2KB currently, reduce how much data you are storing as preview data to continue");let{serialize:s}=t("./dist/compiled/cookie/index.js"),d=e.getHeader("Set-Cookie");return e.setHeader("Set-Cookie",[..."string"==typeof d?[d]:Array.isArray(d)?d:[],s(A,n.previewModeId,{httpOnly:!0,sameSite:"none",secure:!0,path:"/",...void 0!==n.maxAge?{maxAge:n.maxAge}:void 0,...void 0!==n.path?{path:n.path}:void 0}),s(H,i,{httpOnly:!0,sameSite:"none",secure:!0,path:"/",...void 0!==n.maxAge?{maxAge:n.maxAge}:void 0,...void 0!==n.path?{path:n.path}:void 0})]),e})(r,e,Object.assign({},a,n)),r.clearPreviewData=(e={})=>E(r,e),r.revalidate=(r,t)=>z(r,t||{},e,a);let _=o.default||o;null==(f=(0,B.getTracer)().getRootSpanAttributes())||f.set("next.route",d),await (0,B.getTracer)().trace(l.runHandler,{spanName:`executing api route (pages) ${d}`},()=>_(e,r))}catch(e){if(e instanceof O)P(r,e.statusCode,e.message);else{if(s)throw j(e)&&(e.page=d),e;if(console.error(e),i)throw e;P(r,500,"Internal Server Error")}}}class U extends e{constructor(e){if(super(e),"function"!=typeof e.userland.default)throw Error(`Page ${e.definition.page} does not export a default function.`)}async render(e,r,t){await K(e,r,t.query,this.userland,{...t.previewProps,revalidate:t.revalidate,trustHostHeader:t.trustHostHeader,allowedRevalidateHeaderKeys:t.allowedRevalidateHeaderKeys,hostname:t.hostname},t.minimalMode,t.dev,t.page)}}let F=U})(),module.exports=n})();
//# sourceMappingURL=pages-api-turbo.runtime.prod.js.map