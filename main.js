const canvas = document.querySelector(".game");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector(".score__number");
const startGameBtn = document.querySelector("#startGameElBtn");
const moduleEl = document.querySelector("#moduleEl");
const scoreMenuEl = document.querySelector(".menu__score");

const shopBtn = document.querySelector(".shop__icon");
const shopMainBtnEl = document.querySelector(".shop__btn");


const shopGoods = document.querySelector(".shop__goods");
const shopGoodsBtn = document.querySelectorAll(".shop__button");




class Player {
	constructor(x, y, radius, color){
		this.position = {
			x: x,
			y: y,
		}
		this.radius = radius;
		this.color = color;
	}
	draw(){
		ctx.beginPath();
		ctx.arc(this.position.x,this.position.y,this.radius,Math.PI * 2,false);
		ctx.fillStyle = this.color;
		ctx.fill();
	}
};

class Projectile {
	constructor(x, y, radius, color, velocity){
		this.position = {
			x: x,
			y: y,
		}
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}
	draw(){
		ctx.beginPath();
		ctx.arc(this.position.x,this.position.y,this.radius,Math.PI * 2,false);
		ctx.fillStyle = this.color;
		ctx.fill();
	}
	update(){
		this.draw();
		this.position.x = this.position.x + this.velocity.x;
		this.position.y = this.position.y + this.velocity.y;
	}
}


class Enemy {
	constructor(x, y, radius, color, velocity){
		this.position = {
			x: x,
			y: y,
		}
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}
	draw(){
		ctx.beginPath();
		ctx.arc(this.position.x,this.position.y,this.radius,Math.PI * 2,false);
		ctx.fillStyle = this.color;
		ctx.fill();
	}
	update(){
		this.draw();
		this.position.x = this.position.x + this.velocity.x;
		this.position.y = this.position.y + this.velocity.y;
	}
}

const friction = 0.988
class Particle {
	constructor(x, y, radius, color, velocity){
		this.position = {
			x: x,
			y: y,
		}
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
		this.alpha = 1;
	}
	draw(){
		ctx.save();
		ctx.globalAlpha = this.alpha;
		ctx.beginPath();
		ctx.arc(this.position.x,this.position.y,this.radius,Math.PI * 2,false);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.restore()
	}
	update(){
		this.draw();
		this.velocity.x *= friction;
		this.velocity.y *= friction;
		this.position.x = this.position.x + this.velocity.x;
		this.position.y = this.position.y + this.velocity.y;
		this.alpha -= 0.01;
	}
}



const playerX = canvas.width / 2;
const playerY = canvas.height / 2;

let player = new Player(playerX,playerY,20,"white");
let projectiles = [];
let enemies = [];
let particles = [];
let score = 0;
let projectileSpeed = 3;


function init(){
	player = new Player(playerX,playerY,20,"white");
	projectiles = [];
	enemies = [];
	particles = [];
	score = 0;
	scoreEl.innerHTML = score;
	scoreMenuEl.innerHTML = score;
	projectileSpeed = 3;
}

function spawnEnemies(){
	setInterval(() => {
		const radius = Math.random() * (30 - 10) + 10;
		let x,
			 y;
		if ( Math.random() < 0.5 ) {
			x = Math.random() < 0.5 ? 0 - radius: canvas.width + radius;
		 	y = Math.random() * canvas.height;
		} else {
			x = Math.random()* canvas.width;
		 	y = Math.random() < 0.5 ? 0 - radius: canvas.height + radius;
		}
		const color = `hsl(${Math.random() * 360},50%,50%)`;
		const angle = Math.atan2(
		canvas.height / 2 - y,
		canvas.width / 2 - x,  
		);
		const velocity = {
			x:Math.cos(angle),
			y:Math.sin(angle)
		};
		enemies.push(new Enemy(x,y,radius,color,velocity));
	},2000);
}

let animationId;

function animation() {
	animationId = requestAnimationFrame(animation);
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.fillRect(0,0,canvas.width,canvas.height);

	particles.forEach( function(particle,index) {

		if(particle.alpha <= 0) {
			particles.splice(index, 1);
		} else {
			particle.update();
		}
		
	});

	projectiles.forEach( (projectile,index)=> {
		projectile.update();
		//remove from edges of screen
		if (projectile.position.x + projectile.radius < 0 ||
			 projectile.position.x - projectile.radius > canvas.width ||
			 projectile.position.y + projectile.radius < 0 ||
			 projectile.position.y - projectile.radius > canvas.width) {
			setTimeout(() =>{
				projectiles.splice(index,1);
			}, 0);
		}

	});

	enemies.forEach( (enemy, indexEnemy)=> {
		enemy.update();
		const dist = Math.hypot(player.position.x - enemy.position.x,
				player.position.y - enemy.position.y);
			//end game
		if (dist - enemy.radius - player.radius < 1) {
			cancelAnimationFrame(animationId);
			moduleEl.style.display = "flex";
			scoreMenuEl.innerHTML = score;
			ShopBtn.style.display = "none";
		}
		projectiles.forEach( (projectile,indexProjectile)=> {
			const dist = Math.hypot(projectile.position.x - enemy.position.x,
				projectile.position.y - enemy.position.y);
			//Objects touch
			if (dist - enemy.radius - projectile.radius < 1) {

				//
				for(let i = 0; i < enemy.radius * 2; i++){
					particles.push(
						new Particle(projectile.position.x,
										projectile.position.y,
										Math.random() *2,
										enemy.color,
										{
											x: (Math.random() - 0.5) * (Math.random() * 5),
											y: (Math.random() - 0.5) * (Math.random() * 5),
										}));
				}

				if (enemy.radius - 10 > 10) {
					enemy.radius -= 10;
					//increse our score
					score +=100;
					scoreEl.innerHTML = score;

					setTimeout(() =>{
						projectiles.splice(indexEnemy,1);
					}, 0);
				} else {
					//increse our score
					score +=220;
					scoreEl.innerHTML = score;
					setTimeout(() =>{
						enemies.splice(indexEnemy,1);
						projectiles.splice(indexProjectile,1);
					}, 0);
				}

			}
		});
	});
	player.draw();
}






addEventListener("click", (event)=>{
	const angle = Math.atan2(
		event.clientY - canvas.height / 2,
		event.clientX - canvas.width / 2,  
		);
	const velocity = {
		x:Math.cos(angle) * projectileSpeed,
		y:Math.sin(angle) * projectileSpeed,
	};
	projectiles.push(new Projectile(
		canvas.width / 2,
		canvas.height / 2,
		5,
		"white",
		velocity
		));
});

startGameBtn.addEventListener("click", (event)=>{
	init();
	moduleEl.style.display = "none";
	shopBtn.style.display = "block";
	spawnEnemies();
	animation();
});

//shop
let openShop = false;

shopBtn.addEventListener("click", (event)=>{
	if (!openShop) {
		shopGoods.style.display = "flex";
		cancelAnimationFrame(animationId);
		shopMainBtnEl.innerText = "Close";
		openShop = true; 
	} else {
		shopGoods.style.display = "none";
		shopMainBtnEl.innerText = "Shop";
		openShop = false;
		animation();
	}
});

for (let i = 0; i < shopGoodsBtn.length; i++) {
	shopGoodsBtn[0].addEventListener("click", (event)=>{
			if(score > 1000 &&  projectileSpeed < 10){
				projectileSpeed +=1;
				score -= 1000;
				scoreEl.innerHTML = score;
			}
	});
	shopGoodsBtn[1].addEventListener("click", (event)=>{
			if(score > 3000){
				enemies.length = 0;
				score -= 3000;
				scoreEl.innerHTML = score;
			}
	});	
}





