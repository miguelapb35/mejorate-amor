let gravity = .1;

class Point{
  constructor(x, y, m=1){
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.dy = 0;
    this.dx = 0;
    this.e = random(3, 5)*s;
    this.type = floor(random(3));
    this.a = random(TAU);
    this.turn = random(-.1, .1);
    this.size = random(10, 20);
  }
  update(){
    this.prevX = this.x;
    this.prevY = this.y;
    this.x += this.dx;
    this.y += this.dy;
    this.dy += gravity*s;
    this.a += this.turn;
  }
  render(col="white"){
    stroke(col);
    line(this.x, this.y, this.prevX, this.prevY);
    push();
    translate(this.x, this.y);
    stroke(col._getHue(), col._getSaturation(), col._getBrightness(), .5);
    for (let i = 0; i < 100; i++){
      let a = random(TAU);
      let d = random(8)*s;
      point(cos(a)*d, sin(a)*d);
    }
    pop();
  }
  renderShape(buffer, col){
    let d = Math.hypot(this.x, this.y);
    buffer.stroke(col._getHue(), col._getSaturation(), col._getBrightness(), (1 - d/300)*.5);
    buffer.noFill();
    buffer.push();
    buffer.translate(this.x, this.y);
    buffer.rotate(this.a);
    buffer.rectMode(CENTER);
    let s = this.size;
    if (this.type == 0) buffer.ellipse(0, 0, s);
    if (this.type == 1) buffer.rect(0, 0, s);
    if (this.type == 2) buffer.triangle(0, -s/2, s/2, s/3, -s/2, s/3);
    buffer.pop();
  }
}

let fPoint = () => {
  let p = new Point(random(width), height);
  p.dx = random(-5*s, 5*s);
  p.dy = random(-10*s, -12*s);
  return p;
}

let sPoint = (a) => {
  let p = new Point(0, 0);
  let a2 = random(a);
  let d = random(.5, 2);
  p.dx = cos(a2)*d;
  p.dy = sin(a2)*d;
  return p;
}

class Firework{
  constructor(){
    this.point = fPoint();
    this.exploding = false;
    this.size = random(200, 300)*s;
    let type = floor(random(3));
    this.col = color(random(), .02, 1);
    if (type == 1) this.col = color(random(.97, 1.01)%1, random(.8, 1), 1);
    if (type == 2) this.col = color(random(.6, .7), random(.8, 1), 1);
    this.points = [];
    
    let divs = floor(random(6, 8))*2;
    let a = TAU/divs;
    let h = 300*tan(a);
    this.buffer = createGraphics(300, h);
    this.buffer.colorMode(HSB, 1, 1, 1);
    this.counter = 0;
    this.a = a; this.divs = divs;
  }
  explode(){
    this.exploding = true;
    let n = random(10, 30);
    for (let i = 0; i < n; i++){
      this.points.push(sPoint(this.a));
    }
  }
  update(){
    if (!this.exploding) this.point.update();
    if (!this.exploding && this.point.dy > this.point.e) this.explode();
    for (let p of this.points){
      p.x += p.dx;
      p.y += p.dy;
      p.a += p.turn;
    }
    if (this.exploding) this.counter++;
  }
  render(){
    if (!this.exploding) this.point.render(this.col);
    this.buffer.blendMode(BLEND);
    this.buffer.clear();
    this.buffer.blendMode(ADD);
    this.points.forEach(p => p.renderShape(this.buffer, this.col));
    push();
    translate(this.point.x, this.point.y);
    scale(s);
    blendMode(ADD);
    for (let i = 0; i < this.divs; i++){
      push();
      let n = i;
      if ((this.divs/2)%2 == 0) n += i%2;
      rotate(n*TAU/this.divs);
      if (i%2 == 1) scale(-1, 1);
      image(this.buffer, 0, 0);
      pop();
    }
    pop();
  }
}

function setup (){
  pixelDensity(1);
  createCanvas();
  colorMode(HSB, 1, 1, 1);
  windowResized();
}

let fireworks = [];
let s;
let init = () => {
  fireworks = [];
  s = height/750;
  // for (let i = 0; i < 10; i++) fireworks.push(new Firework());
  background(.2);
}

function draw(){
  background(0, .01);
  if (random() < .02*s) fireworks.push(new Firework());
  for (let f of fireworks){
    f.update();
    f.render();
  }
  fireworks = fireworks.filter(f => f.counter < 200);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  init();
}