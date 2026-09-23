const FS = require("fs");
const jpeg = require("D:/trave/Documents/dsh/网站/assets/_tools/node_modules/jpeg-js");
const dir = "D:/trave/Documents/dsh/网站/assets";

const LIMIT = 600 * 1024;

function jpegSize(buf){
  let i = 2;
  while(i < buf.length){
    if(buf[i] !== 0xFF){ i++; continue; }
    const m = buf[i+1];
    if(m === 0xD8 || m === 0x01 || (m >= 0xD0 && m <= 0xD7)){ i += 2; continue; }
    const len = buf.readUInt16BE(i+2);
    if(m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC){
      return {h: buf.readUInt16BE(i+5), w: buf.readUInt16BE(i+7)};
    }
    i += 2 + len;
  }
  return null;
}

// Simple box-filter downscale of RGBA
function downscale(src, sw, sh, ow, oh){
  const out = Buffer.alloc(ow*oh*4);
  const cnt = new Float64Array(ow*oh);
  const acc = new Float64Array(ow*oh*3);
  for(let y=0; y<sh; y++){
    const oy = Math.min(oh-1, Math.floor(y*oh/sh));
    for(let x=0; x<sw; x++){
      const ox = Math.min(ow-1, Math.floor(x*ow/sw));
      const si = (y*sw+x)*4, di = oy*ow+ox;
      acc[di*3]   += src[si];
      acc[di*3+1] += src[si+1];
      acc[di*3+2] += src[si+2];
      cnt[di]++;
    }
  }
  for(let i=0;i<ow*oh;i++){
    const c = cnt[i] || 1;
    out[i*4]   = Math.round(acc[i*3]/c);
    out[i*4+1] = Math.round(acc[i*3+1]/c);
    out[i*4+2] = Math.round(acc[i*3+2]/c);
    out[i*4+3] = 255;
  }
  return out;
}

const raw = FS.readFileSync(dir+"/_bosse-original.jpg");
const dec = jpeg.decode(raw, {useTArray:true, formatAsRGBA:true});
console.log("source decoded: "+dec.width+"x"+dec.height);

const targetW = parseInt(process.argv[2]||"1400",10);

let best = null;
for(const w of [targetW, Math.round(targetW*0.85), Math.round(targetW*0.7), Math.round(targetW*0.55)]){
  const h = Math.round(dec.height * w / dec.width);
  process.stdout.write("scale "+w+"x"+h+": ");
  const px = downscale(dec.data, dec.width, dec.height, w, h);
  let chosen = null;
  for(const q of [92,88,84,80,76,72,68,64,60,55,50]){
    const enc = jpeg.encode({data:px, width:w, height:h}, q);
    if(enc.data.length < LIMIT){ chosen = {q, buf:enc.data, w, h}; break; }
  }
  if(chosen){
    console.log("q="+chosen.q+" bytes="+chosen.buf.length);
    if(!best || chosen.w > best.w) best = chosen;
    if(chosen.w === targetW) break;
  } else {
    console.log("too big even at q=50");
  }
}

if(!best){ console.log("FAILED: no size under limit"); process.exit(1); }
FS.writeFileSync(dir+"/oath-painting.jpg", best.buf);

// verify
const v = FS.readFileSync(dir+"/oath-painting.jpg");
const d = jpegSize(v);
console.log("\nSAVED oath-painting.jpg bytes="+v.length+" ("+(v.length/1024).toFixed(1)+" KB) magic="+v.subarray(0,3).toString("hex").toUpperCase()+" dims="+d.w+"x"+d.h);
FS.writeFileSync(dir+"/_final_meta.json", JSON.stringify({bytes:v.length,w:d.w,h:d.h,q:best.q}));
