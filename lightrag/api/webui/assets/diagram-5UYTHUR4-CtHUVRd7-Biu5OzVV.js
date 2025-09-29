import{m as B}from"./chunk-353BL4L5-BbApztrK-DoNd0ZVI.js";import{g as d,r as v,C as P,P as W,O as z,t as S,u as F,a3 as x,at as E,L as T,W as D,a4 as L,a5 as A,I as m}from"./index-CnQ5AggB.js";import{w as I}from"./treemap-75Q7IDZK-DCNj2AqJ-dl_NJ8Qr.js";import"./_baseUniq-C8e369Jq-CCVN0AX_.js";import"./_basePickBy-I_8Sje-O-CTzx5zHv.js";import"./clone-BnhFz35D-lfHrBZtk.js";var $={packet:[]},w=structuredClone($),R=A.packet,Y=d(()=>{const t=x({...R,...L().packet});return t.showBits&&(t.paddingY+=10),t},"getConfig"),H=d(()=>w.packet,"getPacket"),M=d(t=>{t.length>0&&w.packet.push(t)},"pushWord"),O=d(()=>{D(),w=structuredClone($)},"clear"),u={pushWord:M,getPacket:H,getConfig:Y,clear:O,setAccTitle:F,getAccTitle:S,setDiagramTitle:z,getDiagramTitle:W,getAccDescription:P,setAccDescription:v},X=1e4,j=d(t=>{B(t,u);let e=-1,o=[],i=1;const{bitsPerRow:s}=u.getConfig();for(let{start:a,end:r,bits:n,label:k}of t.blocks){if(a!==void 0&&r!==void 0&&r<a)throw new Error(`Packet block ${a} - ${r} is invalid. End must be greater than start.`);if(a??(a=e+1),a!==e+1)throw new Error(`Packet block ${a} - ${r??a} is not contiguous. It should start from ${e+1}.`);if(n===0)throw new Error(`Packet block ${a} is invalid. Cannot have a zero bit field.`);for(r??(r=a+(n??1)-1),n??(n=r-a+1),e=r,m.debug(`Packet block ${a} - ${e} with label ${k}`);o.length<=s+1&&u.getPacket().length<X;){const[c,b]=q({start:a,end:r,bits:n,label:k},i,s);if(o.push(c),c.end+1===i*s&&(u.pushWord(o),o=[],i++),!b)break;({start:a,end:r,bits:n,label:k}=b)}}u.pushWord(o)},"populate"),q=d((t,e,o)=>{if(t.start===void 0)throw new Error("start should have been set during first phase");if(t.end===void 0)throw new Error("end should have been set during first phase");if(t.start>t.end)throw new Error(`Block start ${t.start} is greater than block end ${t.end}.`);if(t.end+1<=e*o)return[t,void 0];const i=e*o-1,s=e*o;return[{start:t.start,end:i,label:t.label,bits:i-t.start},{start:s,end:t.end,label:t.label,bits:t.end-s}]},"getNextFittingBlock"),G={parse:d(async t=>{const e=await I("packet",t);m.debug(e),j(e)},"parse")},J=d((t,e,o,i)=>{const s=i.db,a=s.getConfig(),{rowHeight:r,paddingY:n,bitWidth:k,bitsPerRow:c}=a,b=s.getPacket(),l=s.getDiagramTitle(),h=r+n,p=h*(b.length+1)-(l?0:r),g=k*c+2,f=E(e);f.attr("viewbox",`0 0 ${g} ${p}`),T(f,p,g,a.useMaxWidth);for(const[C,y]of b.entries())K(f,y,C,a);f.append("text").text(l).attr("x",g/2).attr("y",p-h/2).attr("dominant-baseline","middle").attr("text-anchor","middle").attr("class","packetTitle")},"draw"),K=d((t,e,o,{rowHeight:i,paddingX:s,paddingY:a,bitWidth:r,bitsPerRow:n,showBits:k})=>{const c=t.append("g"),b=o*(i+a)+a;for(const l of e){const h=l.start%n*r+1,p=(l.end-l.start+1)*r-s;if(c.append("rect").attr("x",h).attr("y",b).attr("width",p).attr("height",i).attr("class","packetBlock"),c.append("text").attr("x",h+p/2).attr("y",b+i/2).attr("class","packetLabel").attr("dominant-baseline","middle").attr("text-anchor","middle").text(l.label),!k)continue;const g=l.end===l.start,f=b-2;c.append("text").attr("x",h+(g?p/2:0)).attr("y",f).attr("class","packetByte start").attr("dominant-baseline","auto").attr("text-anchor",g?"middle":"start").text(l.start),g||c.append("text").attr("x",h+p).attr("y",f).attr("class","packetByte end").attr("dominant-baseline","auto").attr("text-anchor","end").text(l.end)}},"drawWord"),N={draw:J},U={byteFontSize:"10px",startByteColor:"black",endByteColor:"black",labelColor:"black",labelFontSize:"12px",titleColor:"black",titleFontSize:"14px",blockStrokeColor:"black",blockStrokeWidth:"1",blockFillColor:"#efefef"},_=d(({packet:t}={})=>{const e=x(U,t);return`
	.packetByte {
		font-size: ${e.byteFontSize};
	}
	.packetByte.start {
		fill: ${e.startByteColor};
	}
	.packetByte.end {
		fill: ${e.endByteColor};
	}
	.packetLabel {
		fill: ${e.labelColor};
		font-size: ${e.labelFontSize};
	}
	.packetTitle {
		fill: ${e.titleColor};
		font-size: ${e.titleFontSize};
	}
	.packetBlock {
		stroke: ${e.blockStrokeColor};
		stroke-width: ${e.blockStrokeWidth};
		fill: ${e.blockFillColor};
	}
	`},"styles"),rt={parser:G,db:u,renderer:N,styles:_};export{rt as diagram};
