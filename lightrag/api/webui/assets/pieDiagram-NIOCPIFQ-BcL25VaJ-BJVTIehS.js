import{m as G}from"./chunk-353BL4L5-BbApztrK-CDKYcMlo.js";import{g as r,C as Q,r as V,t as j,u as q,P as H,O as J,I as b,x as K,a3 as N,at as U,av as X,aw as R,ax as Y,L as Z,W as tt,ay as et,a5 as at}from"./index-CfMGOf3b.js";import{w as it}from"./treemap-75Q7IDZK-DCNj2AqJ-Bsq3IxBT.js";import"./_baseUniq-C8e369Jq-CBkPpXGU.js";import"./_basePickBy-I_8Sje-O-DumIlVNk.js";import"./clone-BnhFz35D-B0d9TKOZ.js";var rt=at.pie,T={sections:new Map,showData:!1},f=T.sections,C=T.showData,st=structuredClone(rt),lt=r(()=>structuredClone(st),"getConfig"),ot=r(()=>{f=new Map,C=T.showData,tt()},"clear"),nt=r(({label:t,value:e})=>{f.has(t)||(f.set(t,e),b.debug(`added new section: ${t}, with value: ${e}`))},"addSection"),pt=r(()=>f,"getSections"),ct=r(t=>{C=t},"setShowData"),dt=r(()=>C,"getShowData"),W={getConfig:lt,clear:ot,setDiagramTitle:J,getDiagramTitle:H,setAccTitle:q,getAccTitle:j,setAccDescription:V,getAccDescription:Q,addSection:nt,getSections:pt,setShowData:ct,getShowData:dt},gt=r((t,e)=>{G(t,e),e.setShowData(t.showData),t.sections.map(e.addSection)},"populateDb"),mt={parse:r(async t=>{const e=await it("pie",t);b.debug(e),gt(e,W)},"parse")},ut=r(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),ft=ut,ht=r(t=>{const e=[...t.entries()].map(s=>({label:s[0],value:s[1]})).sort((s,h)=>h.value-s.value);return et().value(s=>s.value)(e)},"createPieArcs"),xt=r((t,e,s,h)=>{b.debug(`rendering pie chart
`+t);const c=h.db,D=K(),v=N(c.getConfig(),D.pie),k=40,l=18,d=4,n=450,x=n,w=U(e),o=w.append("g");o.attr("transform","translate("+x/2+","+n/2+")");const{themeVariables:a}=D;let[S]=X(a.pieOuterStrokeWidth);S??(S=2);const A=v.textPosition,g=Math.min(x,n)/2-k,F=R().innerRadius(0).outerRadius(g),L=R().innerRadius(g*A).outerRadius(g*A);o.append("circle").attr("cx",0).attr("cy",0).attr("r",g+S/2).attr("class","pieOuterCircle");const O=c.getSections(),y=ht(O),E=[a.pie1,a.pie2,a.pie3,a.pie4,a.pie5,a.pie6,a.pie7,a.pie8,a.pie9,a.pie10,a.pie11,a.pie12],p=Y(E);o.selectAll("mySlices").data(y).enter().append("path").attr("d",F).attr("fill",i=>p(i.data.label)).attr("class","pieCircle");let z=0;O.forEach(i=>{z+=i}),o.selectAll("mySlices").data(y).enter().append("text").text(i=>(i.data.value/z*100).toFixed(0)+"%").attr("transform",i=>"translate("+L.centroid(i)+")").style("text-anchor","middle").attr("class","slice"),o.append("text").text(c.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText");const $=o.selectAll(".legend").data(p.domain()).enter().append("g").attr("class","legend").attr("transform",(i,m)=>{const u=l+d,B=u*p.domain().length/2,I=12*l,_=m*u-B;return"translate("+I+","+_+")"});$.append("rect").attr("width",l).attr("height",l).style("fill",p).style("stroke",p),$.data(y).append("text").attr("x",l+d).attr("y",l-d).text(i=>{const{label:m,value:u}=i.data;return c.getShowData()?`${m} [${u}]`:m});const P=Math.max(...$.selectAll("text").nodes().map(i=>i?.getBoundingClientRect().width??0)),M=x+k+l+d+P;w.attr("viewBox",`0 0 ${M} ${n}`),Z(w,n,M,v.useMaxWidth)},"draw"),wt={draw:xt},Dt={parser:mt,db:W,renderer:wt,styles:ft};export{Dt as diagram};
