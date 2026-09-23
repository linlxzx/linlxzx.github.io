const FS = require("fs");
const jpeg = require("D:/trave/Documents/dsh/网站/assets/_tools/node_modules/jpeg-js");
const dir = "D:/trave/Documents/dsh/网站/assets";
const LIMIT = 600*1024;

function downscale(src, sw, sh, ow, oh){
  const out = Buffer.alloc(ow*oh*4);
  const cnt = new Float64Array(ow*oh);
  const acc = new Float64Array(ow*oh*3);
  for(let y=0; y<sh; y++){
    const oy = Math.min(oh-1, Math.floor(y*oh/sh));
    for(let x=0; x<sw; x++){
      const ox = Math.min(ow-1, Math.floor(x*ow/sw));
      const si=(y*sw+x)*4, di=oy*ow+ox;
      acc[di*3]+=src[si]; acc[di*3+1]+=src[si+1]; acc[di*3+2]+=src[si+2]; cnt[di]++;
    }
  }
  for(let i=0;i<ow*oh;i++){
    const c=cnt[i]||1;
    out[i*4]=Math.round(acc[i*3]/c); out[i*4+1]=Math.round(acc[i*3+1]/c);
    out[i*4+2]=Math.round(acc[i*3+2]/c); out[i*4+3]=255;
  }
  return out;
}

const dec = jpeg.decode(FS.readFileSync(dir+"/_bosse-original.jpg"), {useTArray:true, formatAsRGBA:true});
for(const w of [1800,1600,1500,1400,1300,1200]){
  const h = Math.round(dec.height*w/dec.width);
  const px = downscale(dec.data, dec.width, dec.height, w, h);
  const row = [];
  for(const q of [88,82,76,70,64,58,52]){
    const b = jpeg.encode({data:px,width:w,height:h}, q).data.length;
    row.push("q"+q+"="+(b/1024).toFixed(0)+"K"+(b<LIMIT?"*":""));
  }
  console.log(w+"x"+h+"  "+row.join("  "));
}
console.log("\n(* = under 600KB)");
