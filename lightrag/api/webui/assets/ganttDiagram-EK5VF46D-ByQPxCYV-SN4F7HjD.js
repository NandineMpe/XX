import{g as c,C as le,r as ue,P as de,O as he,t as fe,u as ye,x as st,y as mt,a7 as ke,a8 as me,a9 as pe,L as ge,aa as be,ab as ve,ac as j,I as bt,ad as xe,ae as Vt,af as Ht,ag as Te,ah as we,ai as _e,aj as $e,ak as De,al as Se,am as Ce,an as jt,ao as zt,ap as Rt,aq as Qt,ar as Ut,as as Ee,G as Me,E as Le,W as Ae,N as Ye,k as Mt}from"./index-BiAzcFFh.js";var wt={exports:{}},Ie=wt.exports,Xt;function We(){return Xt||(Xt=1,function(e,s){(function(n,a){e.exports=a()})(Ie,function(){var n="day";return function(a,i,d){var y=function(D){return D.add(4-D.isoWeekday(),n)},$=i.prototype;$.isoWeekYear=function(){return y(this).year()},$.isoWeek=function(D){if(!this.$utils().u(D))return this.add(7*(D-this.isoWeek()),n);var T,E,W,G,N=y(this),C=(T=this.isoWeekYear(),E=this.$u,W=(E?d.utc:d)().year(T).startOf("year"),G=4-W.isoWeekday(),W.isoWeekday()>4&&(G+=7),W.add(G,n));return N.diff(C,"week")+1},$.isoWeekday=function(D){return this.$utils().u(D)?this.day()||7:this.day(this.day()%7?D:D-7)};var Y=$.startOf;$.startOf=function(D,T){var E=this.$utils(),W=!!E.u(T)||T;return E.p(D)==="isoweek"?W?this.date(this.date()-(this.isoWeekday()-1)).startOf("day"):this.date(this.date()-1-(this.isoWeekday()-1)+7).endOf("day"):Y.bind(this)(D,T)}}})}(wt)),wt.exports}var Fe=We();const Oe=Mt(Fe);var _t={exports:{}},Pe=_t.exports,Zt;function Be(){return Zt||(Zt=1,function(e,s){(function(n,a){e.exports=a()})(Pe,function(){var n={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},a=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,i=/\d/,d=/\d\d/,y=/\d\d?/,$=/\d*[^-_:/,()\s\d]+/,Y={},D=function(g){return(g=+g)+(g>68?1900:2e3)},T=function(g){return function(S){this[g]=+S}},E=[/[+-]\d\d:?(\d\d)?|Z/,function(g){(this.zone||(this.zone={})).offset=function(S){if(!S||S==="Z")return 0;var M=S.match(/([+-]|\d\d)/g),L=60*M[1]+(+M[2]||0);return L===0?0:M[0]==="+"?-L:L}(g)}],W=function(g){var S=Y[g];return S&&(S.indexOf?S:S.s.concat(S.f))},G=function(g,S){var M,L=Y.meridiem;if(L){for(var V=1;V<=24;V+=1)if(g.indexOf(L(V,0,S))>-1){M=V>12;break}}else M=g===(S?"pm":"PM");return M},N={A:[$,function(g){this.afternoon=G(g,!1)}],a:[$,function(g){this.afternoon=G(g,!0)}],Q:[i,function(g){this.month=3*(g-1)+1}],S:[i,function(g){this.milliseconds=100*+g}],SS:[d,function(g){this.milliseconds=10*+g}],SSS:[/\d{3}/,function(g){this.milliseconds=+g}],s:[y,T("seconds")],ss:[y,T("seconds")],m:[y,T("minutes")],mm:[y,T("minutes")],H:[y,T("hours")],h:[y,T("hours")],HH:[y,T("hours")],hh:[y,T("hours")],D:[y,T("day")],DD:[d,T("day")],Do:[$,function(g){var S=Y.ordinal,M=g.match(/\d+/);if(this.day=M[0],S)for(var L=1;L<=31;L+=1)S(L).replace(/\[|\]/g,"")===g&&(this.day=L)}],w:[y,T("week")],ww:[d,T("week")],M:[y,T("month")],MM:[d,T("month")],MMM:[$,function(g){var S=W("months"),M=(W("monthsShort")||S.map(function(L){return L.slice(0,3)})).indexOf(g)+1;if(M<1)throw new Error;this.month=M%12||M}],MMMM:[$,function(g){var S=W("months").indexOf(g)+1;if(S<1)throw new Error;this.month=S%12||S}],Y:[/[+-]?\d+/,T("year")],YY:[d,function(g){this.year=D(g)}],YYYY:[/\d{4}/,T("year")],Z:E,ZZ:E};function C(g){var S,M;S=g,M=Y&&Y.formats;for(var L=(g=S.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,function(x,b,h){var m=h&&h.toUpperCase();return b||M[h]||n[h]||M[m].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,function(r,u,l){return u||l.slice(1)})})).match(a),V=L.length,H=0;H<V;H+=1){var X=L[H],z=N[X],k=z&&z[0],v=z&&z[1];L[H]=v?{regex:k,parser:v}:X.replace(/^\[|\]$/g,"")}return function(x){for(var b={},h=0,m=0;h<V;h+=1){var r=L[h];if(typeof r=="string")m+=r.length;else{var u=r.regex,l=r.parser,p=x.slice(m),t=u.exec(p)[0];l.call(b,t),x=x.replace(t,"")}}return function(f){var o=f.afternoon;if(o!==void 0){var _=f.hours;o?_<12&&(f.hours+=12):_===12&&(f.hours=0),delete f.afternoon}}(b),b}}return function(g,S,M){M.p.customParseFormat=!0,g&&g.parseTwoDigitYear&&(D=g.parseTwoDigitYear);var L=S.prototype,V=L.parse;L.parse=function(H){var X=H.date,z=H.utc,k=H.args;this.$u=z;var v=k[1];if(typeof v=="string"){var x=k[2]===!0,b=k[3]===!0,h=x||b,m=k[2];b&&(m=k[2]),Y=this.$locale(),!x&&m&&(Y=M.Ls[m]),this.$d=function(p,t,f,o){try{if(["x","X"].indexOf(t)>-1)return new Date((t==="X"?1e3:1)*p);var _=C(t)(p),w=_.year,A=_.month,I=_.day,ct=_.hours,F=_.minutes,J=_.seconds,lt=_.milliseconds,rt=_.zone,yt=_.week,ut=new Date,nt=I||(w||A?1:ut.getDate()),P=w||ut.getFullYear(),U=0;w&&!A||(U=A>0?A-1:ut.getMonth());var B,et=ct||0,Z=F||0,tt=J||0,R=lt||0;return rt?new Date(Date.UTC(P,U,nt,et,Z,tt,R+60*rt.offset*1e3)):f?new Date(Date.UTC(P,U,nt,et,Z,tt,R)):(B=new Date(P,U,nt,et,Z,tt,R),yt&&(B=o(B).week(yt).toDate()),B)}catch{return new Date("")}}(X,v,z,M),this.init(),m&&m!==!0&&(this.$L=this.locale(m).$L),h&&X!=this.format(v)&&(this.$d=new Date("")),Y={}}else if(v instanceof Array)for(var r=v.length,u=1;u<=r;u+=1){k[1]=v[u-1];var l=M.apply(this,k);if(l.isValid()){this.$d=l.$d,this.$L=l.$L,this.init();break}u===r&&(this.$d=new Date(""))}else V.call(this,H)}}})}(_t)),_t.exports}var Ne=Be();const Ge=Mt(Ne);var $t={exports:{}},Ve=$t.exports,Kt;function He(){return Kt||(Kt=1,function(e,s){(function(n,a){e.exports=a()})(Ve,function(){return function(n,a){var i=a.prototype,d=i.format;i.format=function(y){var $=this,Y=this.$locale();if(!this.isValid())return d.bind(this)(y);var D=this.$utils(),T=(y||"YYYY-MM-DDTHH:mm:ssZ").replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g,function(E){switch(E){case"Q":return Math.ceil(($.$M+1)/3);case"Do":return Y.ordinal($.$D);case"gggg":return $.weekYear();case"GGGG":return $.isoWeekYear();case"wo":return Y.ordinal($.week(),"W");case"w":case"ww":return D.s($.week(),E==="w"?1:2,"0");case"W":case"WW":return D.s($.isoWeek(),E==="W"?1:2,"0");case"k":case"kk":return D.s(String($.$H===0?24:$.$H),E==="k"?1:2,"0");case"X":return Math.floor($.$d.getTime()/1e3);case"x":return $.$d.getTime();case"z":return"["+$.offsetName()+"]";case"zzz":return"["+$.offsetName("long")+"]";default:return E}});return d.bind(this)(T)}}})}($t)),$t.exports}var je=He();const ze=Mt(je);var Dt=function(){var e=c(function(m,r,u,l){for(u=u||{},l=m.length;l--;u[m[l]]=r);return u},"o"),s=[6,8,10,12,13,14,15,16,17,18,20,21,22,23,24,25,26,27,28,29,30,31,33,35,36,38,40],n=[1,26],a=[1,27],i=[1,28],d=[1,29],y=[1,30],$=[1,31],Y=[1,32],D=[1,33],T=[1,34],E=[1,9],W=[1,10],G=[1,11],N=[1,12],C=[1,13],g=[1,14],S=[1,15],M=[1,16],L=[1,19],V=[1,20],H=[1,21],X=[1,22],z=[1,23],k=[1,25],v=[1,35],x={trace:c(function(){},"trace"),yy:{},symbols_:{error:2,start:3,gantt:4,document:5,EOF:6,line:7,SPACE:8,statement:9,NL:10,weekday:11,weekday_monday:12,weekday_tuesday:13,weekday_wednesday:14,weekday_thursday:15,weekday_friday:16,weekday_saturday:17,weekday_sunday:18,weekend:19,weekend_friday:20,weekend_saturday:21,dateFormat:22,inclusiveEndDates:23,topAxis:24,axisFormat:25,tickInterval:26,excludes:27,includes:28,todayMarker:29,title:30,acc_title:31,acc_title_value:32,acc_descr:33,acc_descr_value:34,acc_descr_multiline_value:35,section:36,clickStatement:37,taskTxt:38,taskData:39,click:40,callbackname:41,callbackargs:42,href:43,clickStatementDebug:44,$accept:0,$end:1},terminals_:{2:"error",4:"gantt",6:"EOF",8:"SPACE",10:"NL",12:"weekday_monday",13:"weekday_tuesday",14:"weekday_wednesday",15:"weekday_thursday",16:"weekday_friday",17:"weekday_saturday",18:"weekday_sunday",20:"weekend_friday",21:"weekend_saturday",22:"dateFormat",23:"inclusiveEndDates",24:"topAxis",25:"axisFormat",26:"tickInterval",27:"excludes",28:"includes",29:"todayMarker",30:"title",31:"acc_title",32:"acc_title_value",33:"acc_descr",34:"acc_descr_value",35:"acc_descr_multiline_value",36:"section",38:"taskTxt",39:"taskData",40:"click",41:"callbackname",42:"callbackargs",43:"href"},productions_:[0,[3,3],[5,0],[5,2],[7,2],[7,1],[7,1],[7,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[19,1],[19,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,2],[9,1],[9,1],[9,1],[9,2],[37,2],[37,3],[37,3],[37,4],[37,3],[37,4],[37,2],[44,2],[44,3],[44,3],[44,4],[44,3],[44,4],[44,2]],performAction:c(function(m,r,u,l,p,t,f){var o=t.length-1;switch(p){case 1:return t[o-1];case 2:this.$=[];break;case 3:t[o-1].push(t[o]),this.$=t[o-1];break;case 4:case 5:this.$=t[o];break;case 6:case 7:this.$=[];break;case 8:l.setWeekday("monday");break;case 9:l.setWeekday("tuesday");break;case 10:l.setWeekday("wednesday");break;case 11:l.setWeekday("thursday");break;case 12:l.setWeekday("friday");break;case 13:l.setWeekday("saturday");break;case 14:l.setWeekday("sunday");break;case 15:l.setWeekend("friday");break;case 16:l.setWeekend("saturday");break;case 17:l.setDateFormat(t[o].substr(11)),this.$=t[o].substr(11);break;case 18:l.enableInclusiveEndDates(),this.$=t[o].substr(18);break;case 19:l.TopAxis(),this.$=t[o].substr(8);break;case 20:l.setAxisFormat(t[o].substr(11)),this.$=t[o].substr(11);break;case 21:l.setTickInterval(t[o].substr(13)),this.$=t[o].substr(13);break;case 22:l.setExcludes(t[o].substr(9)),this.$=t[o].substr(9);break;case 23:l.setIncludes(t[o].substr(9)),this.$=t[o].substr(9);break;case 24:l.setTodayMarker(t[o].substr(12)),this.$=t[o].substr(12);break;case 27:l.setDiagramTitle(t[o].substr(6)),this.$=t[o].substr(6);break;case 28:this.$=t[o].trim(),l.setAccTitle(this.$);break;case 29:case 30:this.$=t[o].trim(),l.setAccDescription(this.$);break;case 31:l.addSection(t[o].substr(8)),this.$=t[o].substr(8);break;case 33:l.addTask(t[o-1],t[o]),this.$="task";break;case 34:this.$=t[o-1],l.setClickEvent(t[o-1],t[o],null);break;case 35:this.$=t[o-2],l.setClickEvent(t[o-2],t[o-1],t[o]);break;case 36:this.$=t[o-2],l.setClickEvent(t[o-2],t[o-1],null),l.setLink(t[o-2],t[o]);break;case 37:this.$=t[o-3],l.setClickEvent(t[o-3],t[o-2],t[o-1]),l.setLink(t[o-3],t[o]);break;case 38:this.$=t[o-2],l.setClickEvent(t[o-2],t[o],null),l.setLink(t[o-2],t[o-1]);break;case 39:this.$=t[o-3],l.setClickEvent(t[o-3],t[o-1],t[o]),l.setLink(t[o-3],t[o-2]);break;case 40:this.$=t[o-1],l.setLink(t[o-1],t[o]);break;case 41:case 47:this.$=t[o-1]+" "+t[o];break;case 42:case 43:case 45:this.$=t[o-2]+" "+t[o-1]+" "+t[o];break;case 44:case 46:this.$=t[o-3]+" "+t[o-2]+" "+t[o-1]+" "+t[o];break}},"anonymous"),table:[{3:1,4:[1,2]},{1:[3]},e(s,[2,2],{5:3}),{6:[1,4],7:5,8:[1,6],9:7,10:[1,8],11:17,12:n,13:a,14:i,15:d,16:y,17:$,18:Y,19:18,20:D,21:T,22:E,23:W,24:G,25:N,26:C,27:g,28:S,29:M,30:L,31:V,33:H,35:X,36:z,37:24,38:k,40:v},e(s,[2,7],{1:[2,1]}),e(s,[2,3]),{9:36,11:17,12:n,13:a,14:i,15:d,16:y,17:$,18:Y,19:18,20:D,21:T,22:E,23:W,24:G,25:N,26:C,27:g,28:S,29:M,30:L,31:V,33:H,35:X,36:z,37:24,38:k,40:v},e(s,[2,5]),e(s,[2,6]),e(s,[2,17]),e(s,[2,18]),e(s,[2,19]),e(s,[2,20]),e(s,[2,21]),e(s,[2,22]),e(s,[2,23]),e(s,[2,24]),e(s,[2,25]),e(s,[2,26]),e(s,[2,27]),{32:[1,37]},{34:[1,38]},e(s,[2,30]),e(s,[2,31]),e(s,[2,32]),{39:[1,39]},e(s,[2,8]),e(s,[2,9]),e(s,[2,10]),e(s,[2,11]),e(s,[2,12]),e(s,[2,13]),e(s,[2,14]),e(s,[2,15]),e(s,[2,16]),{41:[1,40],43:[1,41]},e(s,[2,4]),e(s,[2,28]),e(s,[2,29]),e(s,[2,33]),e(s,[2,34],{42:[1,42],43:[1,43]}),e(s,[2,40],{41:[1,44]}),e(s,[2,35],{43:[1,45]}),e(s,[2,36]),e(s,[2,38],{42:[1,46]}),e(s,[2,37]),e(s,[2,39])],defaultActions:{},parseError:c(function(m,r){if(r.recoverable)this.trace(m);else{var u=new Error(m);throw u.hash=r,u}},"parseError"),parse:c(function(m){var r=this,u=[0],l=[],p=[null],t=[],f=this.table,o="",_=0,w=0,A=2,I=1,ct=t.slice.call(arguments,1),F=Object.create(this.lexer),J={yy:{}};for(var lt in this.yy)Object.prototype.hasOwnProperty.call(this.yy,lt)&&(J.yy[lt]=this.yy[lt]);F.setInput(m,J.yy),J.yy.lexer=F,J.yy.parser=this,typeof F.yylloc>"u"&&(F.yylloc={});var rt=F.yylloc;t.push(rt);var yt=F.options&&F.options.ranges;typeof J.yy.parseError=="function"?this.parseError=J.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function ut(Q){u.length=u.length-2*Q,p.length=p.length-Q,t.length=t.length-Q}c(ut,"popStack");function nt(){var Q;return Q=l.pop()||F.lex()||I,typeof Q!="number"&&(Q instanceof Array&&(l=Q,Q=l.pop()),Q=r.symbols_[Q]||Q),Q}c(nt,"lex");for(var P,U,B,et,Z={},tt,R,Gt,kt;;){if(U=u[u.length-1],this.defaultActions[U]?B=this.defaultActions[U]:((P===null||typeof P>"u")&&(P=nt()),B=f[U]&&f[U][P]),typeof B>"u"||!B.length||!B[0]){var Tt="";kt=[];for(tt in f[U])this.terminals_[tt]&&tt>A&&kt.push("'"+this.terminals_[tt]+"'");F.showPosition?Tt="Parse error on line "+(_+1)+`:
`+F.showPosition()+`
Expecting `+kt.join(", ")+", got '"+(this.terminals_[P]||P)+"'":Tt="Parse error on line "+(_+1)+": Unexpected "+(P==I?"end of input":"'"+(this.terminals_[P]||P)+"'"),this.parseError(Tt,{text:F.match,token:this.terminals_[P]||P,line:F.yylineno,loc:rt,expected:kt})}if(B[0]instanceof Array&&B.length>1)throw new Error("Parse Error: multiple actions possible at state: "+U+", token: "+P);switch(B[0]){case 1:u.push(P),p.push(F.yytext),t.push(F.yylloc),u.push(B[1]),P=null,w=F.yyleng,o=F.yytext,_=F.yylineno,rt=F.yylloc;break;case 2:if(R=this.productions_[B[1]][1],Z.$=p[p.length-R],Z._$={first_line:t[t.length-(R||1)].first_line,last_line:t[t.length-1].last_line,first_column:t[t.length-(R||1)].first_column,last_column:t[t.length-1].last_column},yt&&(Z._$.range=[t[t.length-(R||1)].range[0],t[t.length-1].range[1]]),et=this.performAction.apply(Z,[o,w,_,J.yy,B[1],p,t].concat(ct)),typeof et<"u")return et;R&&(u=u.slice(0,-1*R*2),p=p.slice(0,-1*R),t=t.slice(0,-1*R)),u.push(this.productions_[B[1]][0]),p.push(Z.$),t.push(Z._$),Gt=f[u[u.length-2]][u[u.length-1]],u.push(Gt);break;case 3:return!0}}return!0},"parse")},b=function(){var m={EOF:1,parseError:c(function(r,u){if(this.yy.parser)this.yy.parser.parseError(r,u);else throw new Error(r)},"parseError"),setInput:c(function(r,u){return this.yy=u||this.yy||{},this._input=r,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:c(function(){var r=this._input[0];this.yytext+=r,this.yyleng++,this.offset++,this.match+=r,this.matched+=r;var u=r.match(/(?:\r\n?|\n).*/g);return u?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),r},"input"),unput:c(function(r){var u=r.length,l=r.split(/(?:\r\n?|\n)/g);this._input=r+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-u),this.offset-=u;var p=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),l.length-1&&(this.yylineno-=l.length-1);var t=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:l?(l.length===p.length?this.yylloc.first_column:0)+p[p.length-l.length].length-l[0].length:this.yylloc.first_column-u},this.options.ranges&&(this.yylloc.range=[t[0],t[0]+this.yyleng-u]),this.yyleng=this.yytext.length,this},"unput"),more:c(function(){return this._more=!0,this},"more"),reject:c(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:c(function(r){this.unput(this.match.slice(r))},"less"),pastInput:c(function(){var r=this.matched.substr(0,this.matched.length-this.match.length);return(r.length>20?"...":"")+r.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:c(function(){var r=this.match;return r.length<20&&(r+=this._input.substr(0,20-r.length)),(r.substr(0,20)+(r.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:c(function(){var r=this.pastInput(),u=new Array(r.length+1).join("-");return r+this.upcomingInput()+`
`+u+"^"},"showPosition"),test_match:c(function(r,u){var l,p,t;if(this.options.backtrack_lexer&&(t={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(t.yylloc.range=this.yylloc.range.slice(0))),p=r[0].match(/(?:\r\n?|\n).*/g),p&&(this.yylineno+=p.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:p?p[p.length-1].length-p[p.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+r[0].length},this.yytext+=r[0],this.match+=r[0],this.matches=r,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(r[0].length),this.matched+=r[0],l=this.performAction.call(this,this.yy,this,u,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),l)return l;if(this._backtrack){for(var f in t)this[f]=t[f];return!1}return!1},"test_match"),next:c(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var r,u,l,p;this._more||(this.yytext="",this.match="");for(var t=this._currentRules(),f=0;f<t.length;f++)if(l=this._input.match(this.rules[t[f]]),l&&(!u||l[0].length>u[0].length)){if(u=l,p=f,this.options.backtrack_lexer){if(r=this.test_match(l,t[f]),r!==!1)return r;if(this._backtrack){u=!1;continue}else return!1}else if(!this.options.flex)break}return u?(r=this.test_match(u,t[p]),r!==!1?r:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:c(function(){var r=this.next();return r||this.lex()},"lex"),begin:c(function(r){this.conditionStack.push(r)},"begin"),popState:c(function(){var r=this.conditionStack.length-1;return r>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),_currentRules:c(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),topState:c(function(r){return r=this.conditionStack.length-1-Math.abs(r||0),r>=0?this.conditionStack[r]:"INITIAL"},"topState"),pushState:c(function(r){this.begin(r)},"pushState"),stateStackSize:c(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:c(function(r,u,l,p){switch(l){case 0:return this.begin("open_directive"),"open_directive";case 1:return this.begin("acc_title"),31;case 2:return this.popState(),"acc_title_value";case 3:return this.begin("acc_descr"),33;case 4:return this.popState(),"acc_descr_value";case 5:this.begin("acc_descr_multiline");break;case 6:this.popState();break;case 7:return"acc_descr_multiline_value";case 8:break;case 9:break;case 10:break;case 11:return 10;case 12:break;case 13:break;case 14:this.begin("href");break;case 15:this.popState();break;case 16:return 43;case 17:this.begin("callbackname");break;case 18:this.popState();break;case 19:this.popState(),this.begin("callbackargs");break;case 20:return 41;case 21:this.popState();break;case 22:return 42;case 23:this.begin("click");break;case 24:this.popState();break;case 25:return 40;case 26:return 4;case 27:return 22;case 28:return 23;case 29:return 24;case 30:return 25;case 31:return 26;case 32:return 28;case 33:return 27;case 34:return 29;case 35:return 12;case 36:return 13;case 37:return 14;case 38:return 15;case 39:return 16;case 40:return 17;case 41:return 18;case 42:return 20;case 43:return 21;case 44:return"date";case 45:return 30;case 46:return"accDescription";case 47:return 36;case 48:return 38;case 49:return 39;case 50:return":";case 51:return 6;case 52:return"INVALID"}},"anonymous"),rules:[/^(?:%%\{)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:%%(?!\{)*[^\n]*)/i,/^(?:[^\}]%%*[^\n]*)/i,/^(?:%%*[^\n]*[\n]*)/i,/^(?:[\n]+)/i,/^(?:\s+)/i,/^(?:%[^\n]*)/i,/^(?:href[\s]+["])/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:call[\s]+)/i,/^(?:\([\s]*\))/i,/^(?:\()/i,/^(?:[^(]*)/i,/^(?:\))/i,/^(?:[^)]*)/i,/^(?:click[\s]+)/i,/^(?:[\s\n])/i,/^(?:[^\s\n]*)/i,/^(?:gantt\b)/i,/^(?:dateFormat\s[^#\n;]+)/i,/^(?:inclusiveEndDates\b)/i,/^(?:topAxis\b)/i,/^(?:axisFormat\s[^#\n;]+)/i,/^(?:tickInterval\s[^#\n;]+)/i,/^(?:includes\s[^#\n;]+)/i,/^(?:excludes\s[^#\n;]+)/i,/^(?:todayMarker\s[^\n;]+)/i,/^(?:weekday\s+monday\b)/i,/^(?:weekday\s+tuesday\b)/i,/^(?:weekday\s+wednesday\b)/i,/^(?:weekday\s+thursday\b)/i,/^(?:weekday\s+friday\b)/i,/^(?:weekday\s+saturday\b)/i,/^(?:weekday\s+sunday\b)/i,/^(?:weekend\s+friday\b)/i,/^(?:weekend\s+saturday\b)/i,/^(?:\d\d\d\d-\d\d-\d\d\b)/i,/^(?:title\s[^\n]+)/i,/^(?:accDescription\s[^#\n;]+)/i,/^(?:section\s[^\n]+)/i,/^(?:[^:\n]+)/i,/^(?::[^#\n;]+)/i,/^(?::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{acc_descr_multiline:{rules:[6,7],inclusive:!1},acc_descr:{rules:[4],inclusive:!1},acc_title:{rules:[2],inclusive:!1},callbackargs:{rules:[21,22],inclusive:!1},callbackname:{rules:[18,19,20],inclusive:!1},href:{rules:[15,16],inclusive:!1},click:{rules:[24,25],inclusive:!1},INITIAL:{rules:[0,1,3,5,8,9,10,11,12,13,14,17,23,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],inclusive:!0}}};return m}();x.lexer=b;function h(){this.yy={}}return c(h,"Parser"),h.prototype=x,x.Parser=h,new h}();Dt.parser=Dt;var Re=Dt;j.extend(Oe);j.extend(Ge);j.extend(ze);var Jt={friday:5,saturday:6},K="",Lt="",At=void 0,Yt="",dt=[],ht=[],It=new Map,Wt=[],vt=[],ot="",Ft="",ee=["active","done","crit","milestone","vert"],Ot=[],ft=!1,Pt=!1,Bt="sunday",xt="saturday",St=0,Qe=c(function(){Wt=[],vt=[],ot="",Ot=[],pt=0,Et=void 0,gt=void 0,O=[],K="",Lt="",Ft="",At=void 0,Yt="",dt=[],ht=[],ft=!1,Pt=!1,St=0,It=new Map,Ae(),Bt="sunday",xt="saturday"},"clear"),Ue=c(function(e){Lt=e},"setAxisFormat"),Xe=c(function(){return Lt},"getAxisFormat"),Ze=c(function(e){At=e},"setTickInterval"),Ke=c(function(){return At},"getTickInterval"),Je=c(function(e){Yt=e},"setTodayMarker"),qe=c(function(){return Yt},"getTodayMarker"),ti=c(function(e){K=e},"setDateFormat"),ei=c(function(){ft=!0},"enableInclusiveEndDates"),ii=c(function(){return ft},"endDatesAreInclusive"),ri=c(function(){Pt=!0},"enableTopAxis"),ni=c(function(){return Pt},"topAxisEnabled"),si=c(function(e){Ft=e},"setDisplayMode"),ai=c(function(){return Ft},"getDisplayMode"),oi=c(function(){return K},"getDateFormat"),ci=c(function(e){dt=e.toLowerCase().split(/[\s,]+/)},"setIncludes"),li=c(function(){return dt},"getIncludes"),ui=c(function(e){ht=e.toLowerCase().split(/[\s,]+/)},"setExcludes"),di=c(function(){return ht},"getExcludes"),hi=c(function(){return It},"getLinks"),fi=c(function(e){ot=e,Wt.push(e)},"addSection"),yi=c(function(){return Wt},"getSections"),ki=c(function(){let e=qt();const s=10;let n=0;for(;!e&&n<s;)e=qt(),n++;return vt=O,vt},"getTasks"),ie=c(function(e,s,n,a){return a.includes(e.format(s.trim()))?!1:n.includes("weekends")&&(e.isoWeekday()===Jt[xt]||e.isoWeekday()===Jt[xt]+1)||n.includes(e.format("dddd").toLowerCase())?!0:n.includes(e.format(s.trim()))},"isInvalidDate"),mi=c(function(e){Bt=e},"setWeekday"),pi=c(function(){return Bt},"getWeekday"),gi=c(function(e){xt=e},"setWeekend"),re=c(function(e,s,n,a){if(!n.length||e.manualEndTime)return;let i;e.startTime instanceof Date?i=j(e.startTime):i=j(e.startTime,s,!0),i=i.add(1,"d");let d;e.endTime instanceof Date?d=j(e.endTime):d=j(e.endTime,s,!0);const[y,$]=bi(i,d,s,n,a);e.endTime=y.toDate(),e.renderEndTime=$},"checkTaskDates"),bi=c(function(e,s,n,a,i){let d=!1,y=null;for(;e<=s;)d||(y=s.toDate()),d=ie(e,n,a,i),d&&(s=s.add(1,"d")),e=e.add(1,"d");return[s,y]},"fixTaskDates"),Ct=c(function(e,s,n){n=n.trim();const a=/^after\s+(?<ids>[\d\w- ]+)/.exec(n);if(a!==null){let d=null;for(const $ of a.groups.ids.split(" ")){let Y=it($);Y!==void 0&&(!d||Y.endTime>d.endTime)&&(d=Y)}if(d)return d.endTime;const y=new Date;return y.setHours(0,0,0,0),y}let i=j(n,s.trim(),!0);if(i.isValid())return i.toDate();{bt.debug("Invalid date:"+n),bt.debug("With date format:"+s.trim());const d=new Date(n);if(d===void 0||isNaN(d.getTime())||d.getFullYear()<-1e4||d.getFullYear()>1e4)throw new Error("Invalid date:"+n);return d}},"getStartDate"),ne=c(function(e){const s=/^(\d+(?:\.\d+)?)([Mdhmswy]|ms)$/.exec(e.trim());return s!==null?[Number.parseFloat(s[1]),s[2]]:[NaN,"ms"]},"parseDuration"),se=c(function(e,s,n,a=!1){n=n.trim();const i=/^until\s+(?<ids>[\d\w- ]+)/.exec(n);if(i!==null){let D=null;for(const E of i.groups.ids.split(" ")){let W=it(E);W!==void 0&&(!D||W.startTime<D.startTime)&&(D=W)}if(D)return D.startTime;const T=new Date;return T.setHours(0,0,0,0),T}let d=j(n,s.trim(),!0);if(d.isValid())return a&&(d=d.add(1,"d")),d.toDate();let y=j(e);const[$,Y]=ne(n);if(!Number.isNaN($)){const D=y.add($,Y);D.isValid()&&(y=D)}return y.toDate()},"getEndDate"),pt=0,at=c(function(e){return e===void 0?(pt=pt+1,"task"+pt):e},"parseId"),vi=c(function(e,s){let n;s.substr(0,1)===":"?n=s.substr(1,s.length):n=s;const a=n.split(","),i={};Nt(a,i,ee);for(let y=0;y<a.length;y++)a[y]=a[y].trim();let d="";switch(a.length){case 1:i.id=at(),i.startTime=e.endTime,d=a[0];break;case 2:i.id=at(),i.startTime=Ct(void 0,K,a[0]),d=a[1];break;case 3:i.id=at(a[0]),i.startTime=Ct(void 0,K,a[1]),d=a[2];break}return d&&(i.endTime=se(i.startTime,K,d,ft),i.manualEndTime=j(d,"YYYY-MM-DD",!0).isValid(),re(i,K,ht,dt)),i},"compileData"),xi=c(function(e,s){let n;s.substr(0,1)===":"?n=s.substr(1,s.length):n=s;const a=n.split(","),i={};Nt(a,i,ee);for(let d=0;d<a.length;d++)a[d]=a[d].trim();switch(a.length){case 1:i.id=at(),i.startTime={type:"prevTaskEnd",id:e},i.endTime={data:a[0]};break;case 2:i.id=at(),i.startTime={type:"getStartDate",startData:a[0]},i.endTime={data:a[1]};break;case 3:i.id=at(a[0]),i.startTime={type:"getStartDate",startData:a[1]},i.endTime={data:a[2]};break}return i},"parseData"),Et,gt,O=[],ae={},Ti=c(function(e,s){const n={section:ot,type:ot,processed:!1,manualEndTime:!1,renderEndTime:null,raw:{data:s},task:e,classes:[]},a=xi(gt,s);n.raw.startTime=a.startTime,n.raw.endTime=a.endTime,n.id=a.id,n.prevTaskId=gt,n.active=a.active,n.done=a.done,n.crit=a.crit,n.milestone=a.milestone,n.vert=a.vert,n.order=St,St++;const i=O.push(n);gt=n.id,ae[n.id]=i-1},"addTask"),it=c(function(e){const s=ae[e];return O[s]},"findTaskById"),wi=c(function(e,s){const n={section:ot,type:ot,description:e,task:e,classes:[]},a=vi(Et,s);n.startTime=a.startTime,n.endTime=a.endTime,n.id=a.id,n.active=a.active,n.done=a.done,n.crit=a.crit,n.milestone=a.milestone,n.vert=a.vert,Et=n,vt.push(n)},"addTaskOrg"),qt=c(function(){const e=c(function(n){const a=O[n];let i="";switch(O[n].raw.startTime.type){case"prevTaskEnd":{const d=it(a.prevTaskId);a.startTime=d.endTime;break}case"getStartDate":i=Ct(void 0,K,O[n].raw.startTime.startData),i&&(O[n].startTime=i);break}return O[n].startTime&&(O[n].endTime=se(O[n].startTime,K,O[n].raw.endTime.data,ft),O[n].endTime&&(O[n].processed=!0,O[n].manualEndTime=j(O[n].raw.endTime.data,"YYYY-MM-DD",!0).isValid(),re(O[n],K,ht,dt))),O[n].processed},"compileTask");let s=!0;for(const[n,a]of O.entries())e(n),s=s&&a.processed;return s},"compileTasks"),_i=c(function(e,s){let n=s;st().securityLevel!=="loose"&&(n=Le.sanitizeUrl(s)),e.split(",").forEach(function(a){it(a)!==void 0&&(ce(a,()=>{window.open(n,"_self")}),It.set(a,n))}),oe(e,"clickable")},"setLink"),oe=c(function(e,s){e.split(",").forEach(function(n){let a=it(n);a!==void 0&&a.classes.push(s)})},"setClass"),$i=c(function(e,s,n){if(st().securityLevel!=="loose"||s===void 0)return;let a=[];if(typeof n=="string"){a=n.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);for(let i=0;i<a.length;i++){let d=a[i].trim();d.startsWith('"')&&d.endsWith('"')&&(d=d.substr(1,d.length-2)),a[i]=d}}a.length===0&&a.push(e),it(e)!==void 0&&ce(e,()=>{Ye.runFunc(s,...a)})},"setClickFun"),ce=c(function(e,s){Ot.push(function(){const n=document.querySelector(`[id="${e}"]`);n!==null&&n.addEventListener("click",function(){s()})},function(){const n=document.querySelector(`[id="${e}-text"]`);n!==null&&n.addEventListener("click",function(){s()})})},"pushFun"),Di=c(function(e,s,n){e.split(",").forEach(function(a){$i(a,s,n)}),oe(e,"clickable")},"setClickEvent"),Si=c(function(e){Ot.forEach(function(s){s(e)})},"bindFunctions"),Ci={getConfig:c(()=>st().gantt,"getConfig"),clear:Qe,setDateFormat:ti,getDateFormat:oi,enableInclusiveEndDates:ei,endDatesAreInclusive:ii,enableTopAxis:ri,topAxisEnabled:ni,setAxisFormat:Ue,getAxisFormat:Xe,setTickInterval:Ze,getTickInterval:Ke,setTodayMarker:Je,getTodayMarker:qe,setAccTitle:ye,getAccTitle:fe,setDiagramTitle:he,getDiagramTitle:de,setDisplayMode:si,getDisplayMode:ai,setAccDescription:ue,getAccDescription:le,addSection:fi,getSections:yi,getTasks:ki,addTask:Ti,findTaskById:it,addTaskOrg:wi,setIncludes:ci,getIncludes:li,setExcludes:ui,getExcludes:di,setClickEvent:Di,setLink:_i,getLinks:hi,bindFunctions:Si,parseDuration:ne,isInvalidDate:ie,setWeekday:mi,getWeekday:pi,setWeekend:gi};function Nt(e,s,n){let a=!0;for(;a;)a=!1,n.forEach(function(i){const d="^\\s*"+i+"\\s*$",y=new RegExp(d);e[0].match(y)&&(s[i]=!0,e.shift(1),a=!0)})}c(Nt,"getTaskTags");var Ei=c(function(){bt.debug("Something is calling, setConf, remove the call")},"setConf"),te={monday:Ce,tuesday:Se,wednesday:De,thursday:$e,friday:_e,saturday:we,sunday:Te},Mi=c((e,s)=>{let n=[...e].map(()=>-1/0),a=[...e].sort((d,y)=>d.startTime-y.startTime||d.order-y.order),i=0;for(const d of a)for(let y=0;y<n.length;y++)if(d.startTime>=n[y]){n[y]=d.endTime,d.order=y+s,y>i&&(i=y);break}return i},"getMaxIntersections"),q,Li=c(function(e,s,n,a){const i=st().gantt,d=st().securityLevel;let y;d==="sandbox"&&(y=mt("#i"+s));const $=d==="sandbox"?mt(y.nodes()[0].contentDocument.body):mt("body"),Y=d==="sandbox"?y.nodes()[0].contentDocument:document,D=Y.getElementById(s);q=D.parentElement.offsetWidth,q===void 0&&(q=1200),i.useWidth!==void 0&&(q=i.useWidth);const T=a.db.getTasks();let E=[];for(const k of T)E.push(k.type);E=z(E);const W={};let G=2*i.topPadding;if(a.db.getDisplayMode()==="compact"||i.displayMode==="compact"){const k={};for(const x of T)k[x.section]===void 0?k[x.section]=[x]:k[x.section].push(x);let v=0;for(const x of Object.keys(k)){const b=Mi(k[x],v)+1;v+=b,G+=b*(i.barHeight+i.barGap),W[x]=b}}else{G+=T.length*(i.barHeight+i.barGap);for(const k of E)W[k]=T.filter(v=>v.type===k).length}D.setAttribute("viewBox","0 0 "+q+" "+G);const N=$.select(`[id="${s}"]`),C=ke().domain([me(T,function(k){return k.startTime}),pe(T,function(k){return k.endTime})]).rangeRound([0,q-i.leftPadding-i.rightPadding]);function g(k,v){const x=k.startTime,b=v.startTime;let h=0;return x>b?h=1:x<b&&(h=-1),h}c(g,"taskCompare"),T.sort(g),S(T,q,G),ge(N,G,q,i.useMaxWidth),N.append("text").text(a.db.getDiagramTitle()).attr("x",q/2).attr("y",i.titleTopMargin).attr("class","titleText");function S(k,v,x){const b=i.barHeight,h=b+i.barGap,m=i.topPadding,r=i.leftPadding,u=be().domain([0,E.length]).range(["#00B9FA","#F95002"]).interpolate(ve);L(h,m,r,v,x,k,a.db.getExcludes(),a.db.getIncludes()),V(r,m,v,x),M(k,h,m,r,b,u,v),H(h,m),X(r,m,v,x)}c(S,"makeGantt");function M(k,v,x,b,h,m,r){k.sort((t,f)=>t.vert===f.vert?0:t.vert?1:-1);const u=[...new Set(k.map(t=>t.order))].map(t=>k.find(f=>f.order===t));N.append("g").selectAll("rect").data(u).enter().append("rect").attr("x",0).attr("y",function(t,f){return f=t.order,f*v+x-2}).attr("width",function(){return r-i.rightPadding/2}).attr("height",v).attr("class",function(t){for(const[f,o]of E.entries())if(t.type===o)return"section section"+f%i.numberSectionStyles;return"section section0"}).enter();const l=N.append("g").selectAll("rect").data(k).enter(),p=a.db.getLinks();if(l.append("rect").attr("id",function(t){return t.id}).attr("rx",3).attr("ry",3).attr("x",function(t){return t.milestone?C(t.startTime)+b+.5*(C(t.endTime)-C(t.startTime))-.5*h:C(t.startTime)+b}).attr("y",function(t,f){return f=t.order,t.vert?i.gridLineStartPadding:f*v+x}).attr("width",function(t){return t.milestone?h:t.vert?.08*h:C(t.renderEndTime||t.endTime)-C(t.startTime)}).attr("height",function(t){return t.vert?T.length*(i.barHeight+i.barGap)+i.barHeight*2:h}).attr("transform-origin",function(t,f){return f=t.order,(C(t.startTime)+b+.5*(C(t.endTime)-C(t.startTime))).toString()+"px "+(f*v+x+.5*h).toString()+"px"}).attr("class",function(t){const f="task";let o="";t.classes.length>0&&(o=t.classes.join(" "));let _=0;for(const[A,I]of E.entries())t.type===I&&(_=A%i.numberSectionStyles);let w="";return t.active?t.crit?w+=" activeCrit":w=" active":t.done?t.crit?w=" doneCrit":w=" done":t.crit&&(w+=" crit"),w.length===0&&(w=" task"),t.milestone&&(w=" milestone "+w),t.vert&&(w=" vert "+w),w+=_,w+=" "+o,f+w}),l.append("text").attr("id",function(t){return t.id+"-text"}).text(function(t){return t.task}).attr("font-size",i.fontSize).attr("x",function(t){let f=C(t.startTime),o=C(t.renderEndTime||t.endTime);if(t.milestone&&(f+=.5*(C(t.endTime)-C(t.startTime))-.5*h,o=f+h),t.vert)return C(t.startTime)+b;const _=this.getBBox().width;return _>o-f?o+_+1.5*i.leftPadding>r?f+b-5:o+b+5:(o-f)/2+f+b}).attr("y",function(t,f){return t.vert?i.gridLineStartPadding+T.length*(i.barHeight+i.barGap)+60:(f=t.order,f*v+i.barHeight/2+(i.fontSize/2-2)+x)}).attr("text-height",h).attr("class",function(t){const f=C(t.startTime);let o=C(t.endTime);t.milestone&&(o=f+h);const _=this.getBBox().width;let w="";t.classes.length>0&&(w=t.classes.join(" "));let A=0;for(const[ct,F]of E.entries())t.type===F&&(A=ct%i.numberSectionStyles);let I="";return t.active&&(t.crit?I="activeCritText"+A:I="activeText"+A),t.done?t.crit?I=I+" doneCritText"+A:I=I+" doneText"+A:t.crit&&(I=I+" critText"+A),t.milestone&&(I+=" milestoneText"),t.vert&&(I+=" vertText"),_>o-f?o+_+1.5*i.leftPadding>r?w+" taskTextOutsideLeft taskTextOutside"+A+" "+I:w+" taskTextOutsideRight taskTextOutside"+A+" "+I+" width-"+_:w+" taskText taskText"+A+" "+I+" width-"+_}),st().securityLevel==="sandbox"){let t;t=mt("#i"+s);const f=t.nodes()[0].contentDocument;l.filter(function(o){return p.has(o.id)}).each(function(o){var _=f.querySelector("#"+o.id),w=f.querySelector("#"+o.id+"-text");const A=_.parentNode;var I=f.createElement("a");I.setAttribute("xlink:href",p.get(o.id)),I.setAttribute("target","_top"),A.appendChild(I),I.appendChild(_),I.appendChild(w)})}}c(M,"drawRects");function L(k,v,x,b,h,m,r,u){if(r.length===0&&u.length===0)return;let l,p;for(const{startTime:w,endTime:A}of m)(l===void 0||w<l)&&(l=w),(p===void 0||A>p)&&(p=A);if(!l||!p)return;if(j(p).diff(j(l),"year")>5){bt.warn("The difference between the min and max time is more than 5 years. This will cause performance issues. Skipping drawing exclude days.");return}const t=a.db.getDateFormat(),f=[];let o=null,_=j(l);for(;_.valueOf()<=p;)a.db.isInvalidDate(_,t,r,u)?o?o.end=_:o={start:_,end:_}:o&&(f.push(o),o=null),_=_.add(1,"d");N.append("g").selectAll("rect").data(f).enter().append("rect").attr("id",function(w){return"exclude-"+w.start.format("YYYY-MM-DD")}).attr("x",function(w){return C(w.start)+x}).attr("y",i.gridLineStartPadding).attr("width",function(w){const A=w.end.add(1,"day");return C(A)-C(w.start)}).attr("height",h-v-i.gridLineStartPadding).attr("transform-origin",function(w,A){return(C(w.start)+x+.5*(C(w.end)-C(w.start))).toString()+"px "+(A*k+.5*h).toString()+"px"}).attr("class","exclude-range")}c(L,"drawExcludeDays");function V(k,v,x,b){let h=xe(C).tickSize(-b+v+i.gridLineStartPadding).tickFormat(Vt(a.db.getAxisFormat()||i.axisFormat||"%Y-%m-%d"));const m=/^([1-9]\d*)(millisecond|second|minute|hour|day|week|month)$/.exec(a.db.getTickInterval()||i.tickInterval);if(m!==null){const r=m[1],u=m[2],l=a.db.getWeekday()||i.weekday;switch(u){case"millisecond":h.ticks(Ut.every(r));break;case"second":h.ticks(Qt.every(r));break;case"minute":h.ticks(Rt.every(r));break;case"hour":h.ticks(zt.every(r));break;case"day":h.ticks(jt.every(r));break;case"week":h.ticks(te[l].every(r));break;case"month":h.ticks(Ht.every(r));break}}if(N.append("g").attr("class","grid").attr("transform","translate("+k+", "+(b-50)+")").call(h).selectAll("text").style("text-anchor","middle").attr("fill","#000").attr("stroke","none").attr("font-size",10).attr("dy","1em"),a.db.topAxisEnabled()||i.topAxis){let r=Ee(C).tickSize(-b+v+i.gridLineStartPadding).tickFormat(Vt(a.db.getAxisFormat()||i.axisFormat||"%Y-%m-%d"));if(m!==null){const u=m[1],l=m[2],p=a.db.getWeekday()||i.weekday;switch(l){case"millisecond":r.ticks(Ut.every(u));break;case"second":r.ticks(Qt.every(u));break;case"minute":r.ticks(Rt.every(u));break;case"hour":r.ticks(zt.every(u));break;case"day":r.ticks(jt.every(u));break;case"week":r.ticks(te[p].every(u));break;case"month":r.ticks(Ht.every(u));break}}N.append("g").attr("class","grid").attr("transform","translate("+k+", "+v+")").call(r).selectAll("text").style("text-anchor","middle").attr("fill","#000").attr("stroke","none").attr("font-size",10)}}c(V,"makeGrid");function H(k,v){let x=0;const b=Object.keys(W).map(h=>[h,W[h]]);N.append("g").selectAll("text").data(b).enter().append(function(h){const m=h[0].split(Me.lineBreakRegex),r=-(m.length-1)/2,u=Y.createElementNS("http://www.w3.org/2000/svg","text");u.setAttribute("dy",r+"em");for(const[l,p]of m.entries()){const t=Y.createElementNS("http://www.w3.org/2000/svg","tspan");t.setAttribute("alignment-baseline","central"),t.setAttribute("x","10"),l>0&&t.setAttribute("dy","1em"),t.textContent=p,u.appendChild(t)}return u}).attr("x",10).attr("y",function(h,m){if(m>0)for(let r=0;r<m;r++)return x+=b[m-1][1],h[1]*k/2+x*k+v;else return h[1]*k/2+v}).attr("font-size",i.sectionFontSize).attr("class",function(h){for(const[m,r]of E.entries())if(h[0]===r)return"sectionTitle sectionTitle"+m%i.numberSectionStyles;return"sectionTitle"})}c(H,"vertLabels");function X(k,v,x,b){const h=a.db.getTodayMarker();if(h==="off")return;const m=N.append("g").attr("class","today"),r=new Date,u=m.append("line");u.attr("x1",C(r)+k).attr("x2",C(r)+k).attr("y1",i.titleTopMargin).attr("y2",b-i.titleTopMargin).attr("class","today"),h!==""&&u.attr("style",h.replace(/,/g,";"))}c(X,"drawToday");function z(k){const v={},x=[];for(let b=0,h=k.length;b<h;++b)Object.prototype.hasOwnProperty.call(v,k[b])||(v[k[b]]=!0,x.push(k[b]));return x}c(z,"checkUnique")},"draw"),Ai={setConf:Ei,draw:Li},Yi=c(e=>`
  .mermaid-main-font {
        font-family: ${e.fontFamily};
  }

  .exclude-range {
    fill: ${e.excludeBkgColor};
  }

  .section {
    stroke: none;
    opacity: 0.2;
  }

  .section0 {
    fill: ${e.sectionBkgColor};
  }

  .section2 {
    fill: ${e.sectionBkgColor2};
  }

  .section1,
  .section3 {
    fill: ${e.altSectionBkgColor};
    opacity: 0.2;
  }

  .sectionTitle0 {
    fill: ${e.titleColor};
  }

  .sectionTitle1 {
    fill: ${e.titleColor};
  }

  .sectionTitle2 {
    fill: ${e.titleColor};
  }

  .sectionTitle3 {
    fill: ${e.titleColor};
  }

  .sectionTitle {
    text-anchor: start;
    font-family: ${e.fontFamily};
  }


  /* Grid and axis */

  .grid .tick {
    stroke: ${e.gridColor};
    opacity: 0.8;
    shape-rendering: crispEdges;
  }

  .grid .tick text {
    font-family: ${e.fontFamily};
    fill: ${e.textColor};
  }

  .grid path {
    stroke-width: 0;
  }


  /* Today line */

  .today {
    fill: none;
    stroke: ${e.todayLineColor};
    stroke-width: 2px;
  }


  /* Task styling */

  /* Default task */

  .task {
    stroke-width: 2;
  }

  .taskText {
    text-anchor: middle;
    font-family: ${e.fontFamily};
  }

  .taskTextOutsideRight {
    fill: ${e.taskTextDarkColor};
    text-anchor: start;
    font-family: ${e.fontFamily};
  }

  .taskTextOutsideLeft {
    fill: ${e.taskTextDarkColor};
    text-anchor: end;
  }


  /* Special case clickable */

  .task.clickable {
    cursor: pointer;
  }

  .taskText.clickable {
    cursor: pointer;
    fill: ${e.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideLeft.clickable {
    cursor: pointer;
    fill: ${e.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideRight.clickable {
    cursor: pointer;
    fill: ${e.taskTextClickableColor} !important;
    font-weight: bold;
  }


  /* Specific task settings for the sections*/

  .taskText0,
  .taskText1,
  .taskText2,
  .taskText3 {
    fill: ${e.taskTextColor};
  }

  .task0,
  .task1,
  .task2,
  .task3 {
    fill: ${e.taskBkgColor};
    stroke: ${e.taskBorderColor};
  }

  .taskTextOutside0,
  .taskTextOutside2
  {
    fill: ${e.taskTextOutsideColor};
  }

  .taskTextOutside1,
  .taskTextOutside3 {
    fill: ${e.taskTextOutsideColor};
  }


  /* Active task */

  .active0,
  .active1,
  .active2,
  .active3 {
    fill: ${e.activeTaskBkgColor};
    stroke: ${e.activeTaskBorderColor};
  }

  .activeText0,
  .activeText1,
  .activeText2,
  .activeText3 {
    fill: ${e.taskTextDarkColor} !important;
  }


  /* Completed task */

  .done0,
  .done1,
  .done2,
  .done3 {
    stroke: ${e.doneTaskBorderColor};
    fill: ${e.doneTaskBkgColor};
    stroke-width: 2;
  }

  .doneText0,
  .doneText1,
  .doneText2,
  .doneText3 {
    fill: ${e.taskTextDarkColor} !important;
  }


  /* Tasks on the critical line */

  .crit0,
  .crit1,
  .crit2,
  .crit3 {
    stroke: ${e.critBorderColor};
    fill: ${e.critBkgColor};
    stroke-width: 2;
  }

  .activeCrit0,
  .activeCrit1,
  .activeCrit2,
  .activeCrit3 {
    stroke: ${e.critBorderColor};
    fill: ${e.activeTaskBkgColor};
    stroke-width: 2;
  }

  .doneCrit0,
  .doneCrit1,
  .doneCrit2,
  .doneCrit3 {
    stroke: ${e.critBorderColor};
    fill: ${e.doneTaskBkgColor};
    stroke-width: 2;
    cursor: pointer;
    shape-rendering: crispEdges;
  }

  .milestone {
    transform: rotate(45deg) scale(0.8,0.8);
  }

  .milestoneText {
    font-style: italic;
  }
  .doneCritText0,
  .doneCritText1,
  .doneCritText2,
  .doneCritText3 {
    fill: ${e.taskTextDarkColor} !important;
  }

  .vert {
    stroke: ${e.vertLineColor};
  }

  .vertText {
    font-size: 15px;
    text-anchor: middle;
    fill: ${e.vertLineColor} !important;
  }

  .activeCritText0,
  .activeCritText1,
  .activeCritText2,
  .activeCritText3 {
    fill: ${e.taskTextDarkColor} !important;
  }

  .titleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${e.titleColor||e.textColor};
    font-family: ${e.fontFamily};
  }
`,"getStyles"),Ii=Yi,Fi={parser:Re,db:Ci,renderer:Ai,styles:Ii};export{Fi as diagram};
