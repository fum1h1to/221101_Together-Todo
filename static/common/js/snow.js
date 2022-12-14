(function () {

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.requestAnimationFrame = 
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.weblitRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (cb) { setTimeout(cb, 17); };

const NUM=200;//表示数
const snow_list=[];//配列


class Snow {
  constructor(x, y, radius, speed, wind) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.wind = wind;
  }
  render() {
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.fillStyle =this.fill();
    ctx.globalAlpha = 1;
    ctx.closePath();
    ctx.fill();
  }

  move() {
    
    this.y=this.y+speed;
    this.x += this.wind+ Math.cos(this.y/20)*0.5;

    if(this.y>canvas.height-this.radius){

     this.y=0;
    }

    if(this.x>canvas.width-this.radius){

      this.x=0;
     }
    
    this.render();
   
  }

  fill(){
 
   if(this.y<canvas.height/3){
   
    return "#ffff";

   }else if(this.y<canvas.height/2&&this.y>canvas.height/3){

    return "#F9FFFF";

   }

   return "#E7FFFF";

  }
}

//ランダム数をもらう
function getRandom(min, max){
  min = Math.ceil(min);
  max = Math.floor(max);
  
  return Math.floor(Math.random() * (max - min + 1) + min); 
}

//読み込みと同時に関数が動く
window.onload =initSnow;
render();

///配列に代入する。
function initSnow(){
for(let i = 0; i < NUM; i++) {
x=getRandom(1, canvas.width);//位置をランダムに
y=getRandom(1, canvas.height);
radian=getRandom(1 ,7);//大きさ
speed=getRandom(2,3);//縦に落ちる速さ
wind=getRandom(0, 1.5);//横に揺れる

const snow= new Snow(x, y, radian, speed, wind);
snow_list.push(snow);

}
}





//配列として動かす。
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);//一度リセットする。
  
  for(let i = 0; i < snow_list.length; i++) {
    snow_list[i].move();
    snow_list[i].fill();
  }
  requestAnimationFrame(render);
}


// ↑ この中に処理を記述 ↑
})();