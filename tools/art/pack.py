import json,glob,os
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.abspath(D+'/../..');OUT=ROOT+'/assets/'
os.makedirs(OUT,exist_ok=True)
meta=json.load(open(D+'/out/meta.json'));items=[]
for k in meta:
    im=Image.open(D+'/out/s_%s.png'%k).convert('RGBA');W,H=im.size;bb=im.getbbox();c=im.crop(bb)
    items.append([k,c,W/2-bb[0],H/2-bb[1],W,H])
items.sort(key=lambda t:-t[1].height)
AW=2048;x=y=rowh=0;pos={}
for k,c,*_ in items:
    if x+c.width+2>AW: x=0;y+=rowh+2;rowh=0
    pos[k]=(x,y);x+=c.width+2;rowh=max(rowh,c.height)
AH=y+rowh;atlas=Image.new('RGBA',(AW,AH),(0,0,0,0));frames={}
for k,c,ax,ay,W,H in items:
    px,py=pos[k];atlas.paste(c,(px,py));frames[k]=[px,py,c.width,c.height,round(ax,1),round(ay,1),W,H]
atlas.save(OUT+'atlas.webp','WEBP',quality=86,method=6)
open(ROOT+'/js/frames.js','w').write('const FRAMES='+json.dumps(frames,separators=(',',':'))+';\n')
Image.open(D+'/out/farm.png').convert('RGB').save(OUT+'farm.webp','WEBP',quality=80,method=6)
Image.open(D+'/out/logo.png').save(OUT+'logo.webp','WEBP',quality=86,method=6)
for n in ['wood','board']: Image.open(D+'/out/%s.png'%n).convert('RGB').save(OUT+n+'.webp','WEBP',quality=80,method=6)
for s in [192,512]: Image.open(D+'/out/icon%d.png'%s).convert('RGB').quantize(160).save(ROOT+'/icon-%d.png'%s,optimize=True)
print('atlas',AW,AH,len(frames));tot=0
for f in sorted(glob.glob(OUT+'*'))+[ROOT+'/icon-192.png',ROOT+'/icon-512.png']:
    sz=os.path.getsize(f);tot+=sz;print(os.path.basename(f),sz//1024,'KB')
print('total',tot//1024,'KB')
