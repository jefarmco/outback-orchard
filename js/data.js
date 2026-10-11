// farm jobs, dialogue, boosters
const TILE_NAMES=['Mango','Lychee','Gum leaf','Wattle','Egg','Passionfruit'];
const TILE_COL=['#ffb300','#e53935','#5fae5a','#fdd835','#fff3dc','#8e44ad'];
// x,y = sprite cell centre in farm coords (720x1280)
const TASKS=[
 {id:'junk',name:'Clear out the rubbish',cost:2,spr:null,before:[['junk_0',470,592],['junk_1',300,760],['junk_0',645,770],['junk_1',92,640]],after:[],
  intro:[['J',"Strewth. Uncle Ron left the old place in a right state. First job: clear out all this rubbish."],['B',"Woof! (I found a boot. It's mine now.)"]],
  done:[['J',"That's better – you can actually see the paddock now!"]]},
 {id:'fence',name:'Fix the front fence',cost:3,pos:[360,700],
  intro:[['J',"Half the fence is lying in the grass. The neighbour's goats keep wandering in."]],done:[['J',"Fresh posts, tight wire and a new gate. Take that, goats."],['B',"Woof woof!"]]},
 {id:'house',name:'Repaint the homestead',cost:4,pos:[385,370],
  intro:[['J',"The old Queenslander's still standing… mostly. She needs a fresh coat and a new tin roof."]],done:[['J',"Cream walls, green trim, red roof. Mum would be proud."],['B',"(Blue approves. Blue approves of everything.)"]]},
 {id:'kennel',name:'Build Blue a kennel',cost:3,pos:[250,574],
  intro:[['B',"Woof! Woof woof! (Where do I sleep, boss?)"],['J',"Alright, alright. A proper kennel for the best cattle dog in the district."]],done:[['B',"WOOF! (Best. Day. Ever.)"]]},
 {id:'windmill',name:'Fix the windmill & bore',cost:4,pos:[85,320],
  intro:[['J',"No water, no farm. The windmill's lost half its blades in the last cyclone."]],done:[['J',"Listen to her creak and spin. Bore water's flowing again!"]]},
 {id:'tanks',name:'Put up the header tanks',cost:4,pos:[195,400],
  intro:[['J',"Now we need somewhere to keep the water. Two new header tanks on a good stand should do it."]],done:[['J',"Gravity-fed water for the house and the trees. Beauty."]]},
 {id:'shed',name:'Restore the machinery shed',cost:5,pos:[612,410],
  intro:[['J',"The machinery shed fell over years ago. The old red tractor's still under there somewhere…"]],done:[['J',"New shed, and the tractor started first go! Well… fifth go."],['B',"Woof! (It's loud. I'll bark at it.)"]]},
 {id:'ute',name:'Get the old ute running',cost:4,pos:[540,640],
  intro:[['J',"Grandad's old ute is sitting on blocks. Reckon we can get her going again?"]],done:[['J',"New tyres, new battery, and she purrs. Blue gets the tray, of course."],['B',"WOOF! (Tray dog!)"]]},
 {id:'orchard',name:'Plant the mango orchard',cost:5,pos:[165,900],
  intro:[['J',"This is what it's all about. Twelve Kensington Pride mangoes, right here in the red dirt."]],done:[['J',"Look at them! Come summer we'll be swimming in mangoes."]]},
 {id:'lychee',name:'Plant the lychee rows',cost:5,pos:[575,900],
  intro:[['J',"Lychees love this tropical north weather. Let's put in a few rows by the dam."]],done:[['J',"Lychees in, mangoes in. It's starting to look like a real orchard!"]]},
 {id:'smoko',name:'Build a smoko table',cost:3,pos:[230,1080],
  intro:[['J',"Every good farm needs a spot for smoko. Table, benches, and an esky in the shade."]],done:[['J',"Cuppa and a mango. Life doesn't get much better."],['B',"Woof? (Is there a snag for me?)"]]},
 {id:'chooks',name:'Chook pen & veggie patch',cost:5,pos:[585,1188],
  intro:[['J',"Fresh eggs and tomatoes – a chook pen and some veggie beds by the dam."]],done:[['J',"The girls are laying already. Blue, leave the chooks alone!"],['B',"…woof. (I wasn't going to.)"]]},
 {id:'yard',name:'Build the cattle yard',cost:6,pos:[175,1200],
  intro:[['J',"Last big job: a proper cattle yard for the Brahman calves we've been mustering."]],done:[['J',"Yards built and the calves are home. Blue, you earned your tucker."],['B',"WOOF WOOF WOOF!"],['J',"Best farm in North Queensland. Thanks for the help, mate!"]]},
];
TASKS.forEach(t=>{if(t.pos){t.before=[[t.id+'_0',...t.pos]];t.after=[[t.id+'_1',...t.pos]];}});
const SPRITE_FOR={fence:'fence',house:'house',kennel:'kennel',windmill:'windmill',tanks:'tanks',shed:'shed',ute:'ute',orchard:'orchard',lychee:'lychee',smoko:'smoko',chooks:'chooks',yard:'yard'};
TASKS.forEach(t=>{if(t.pos){t.before=[[SPRITE_FOR[t.id]+'_0',...t.pos]];t.after=[[SPRITE_FOR[t.id]+'_1',...t.pos]];}});
const INTRO=[['J',"G'day! I'm Jesse. I've just taken over the old family farm out past Strathdickie."],['B',"Woof woof!"],['J',"This is Blue. The place needs a LOT of work…"],['J',"Match fruit to earn ★ stars, then spend them on farm jobs. Let's get stuck in!"]];
const BOOSTERS={
 shovel:{name:'Shovel',spr:'b_shovel',desc:'Dig out one tile or hit one blocker',inlevel:1},
 tractor:{name:'Tractor',spr:'b_tractor',desc:'Plough a whole row',inlevel:1},
 willy:{name:'Willy-willy',spr:'b_willy',desc:'Shuffle the board',inlevel:1},
 esky:{name:'Esky',spr:'b_esky',desc:'+3 moves at the start (or +5 when you run out)',pre:1},
 bomb:{name:'Bore Blast',spr:'b_bomb',desc:'Start with a Bore Blast on the board',pre:1},
 uteb:{name:'Ute',spr:'b_uteb',desc:'Start with a Ute line-clearer',pre:1}};
const REWARD_CYCLE=['shovel','esky','tractor','bomb','willy','uteb'];
const CHEERS=['Good on ya!','Bonza!','Ripper!','You beauty!','Fair dinkum!','Strewth!','Too easy!','Crikey!'];
