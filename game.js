var config= {
  type: Phaser.AUTO,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 1000},
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
}
var game= new Phaser.Game(config)

function preload()
{
  
  this.load.spritesheet('right','right.png',{frameWidth:1108/4,frameHeight:1136/4})
  this.load.spritesheet('left','left.png',{frameWidth:1108/4,frameHeight:1136/4})
  this.load.image('stopright','stopright.png')
  this.load.image('stopleft','stopleft.png')
  this.load.image('sky','sky.png')
  this.load.image('goleft','goleft.png')
  this.load.image('goright','goright.png')
  this.load.image('jump','jump.png')
  this.load.image('tile','tile.png')
  this.load.image('box','box.png')
  this.load.image('spike','spikes.png')
  this.load.image('saw','saw.png')
  this.load.image('acid','acid.png')
  this.load.image('star','star.png')
  this.load.image('bomb','bomb.png')
  this.load.audio('gameAudio','gameAudio.mp3')
  this.load.audio('collectStarAudio','collectStarAudio.mp3')
  this.load.audio('gameOverAudio','gameOverAudio.mp3')
  this.load.audio('jumpAudio','jumpAudio.mp3')
  this.load.audio('waveAudio','waveAudio.mp3')
}

var player
var gameOver= false
var goingleft= false 
var goingright= false
var jumping= false
var score= 0
var scoreText
var wave= 1
var waveText
function create()
{
  let sky= this.add.sprite(400,300,'sky')
  sky.setScrollFactor(0)
  
  gameAudio= this.sound.add('gameAudio',{
    loop: true,
    volume: 1
  })
  gameAudio.play()
  
  collectStarAudio= this.sound.add('collectStarAudio',{loop: false, volume: 0.7})
  gameOverAudio= this.sound.add('gameOverAudio',{loop: false, volume: 1})
  jumpAudio= this.sound.add('jumpAudio',{loop: false,volume: 0.8})
  
  waveAudio= this.sound.add('waveAudio',{loop: false, volume: 1})
  
  
  var tiles = this.physics.add.staticGroup({
    key: 'tile',
    repeat: 2,
    setXY: { x: 128, y: 600, stepX: 256 }
  })
  tiles.createMultiple({
    key: 'tile',
    repeat: 1,
    setXY: {x: 1152,y: 600, stepX: 256}
  })
  tiles.createMultiple({
    key:'tile',
    repeat: 1,
    setXY: {x: 1850,y: 600, stepX: 256}
  })
  tiles.createMultiple({
    key:'box',
    repeat: 1,
    setXY: {x: 2618, y: 600,stepX: 256}
  })
  var obstacles = this.physics.add.staticGroup()
  var spike=obstacles.create(896, 500,'spike')

  spike.setDisplaySize(256, 256) // visual size
  spike.body.setSize(256, 50, true) // thin hitbox at bottom
   
  



  console.log(spike.width,spike.x)
  var saw=obstacles.create(1630, 570,'saw').setScale(256/500).refreshBody()
  
  var acid=obstacles.create(2362,600,'acid')
  /*acid.setDisplaySize(256, 128)
  acid.body.setSize(256, 20, true)*/ // only top part hurts
  
  tiles.children.iterate(function(tile){
    tile.setCrop(0,0,256,128)
  })
  player= this.physics.add.sprite(400,350,'stopright')
  
  player.setGravityY(300)
  player.setCollideWorldBounds(true)

  player.setDisplaySize(120, 120) // fixes the visual size
  player.body.setSize(160, 250,true) // hitbox smaller than sprite, centered
  console.log(player.height)
  this.physics.world.setBounds(0, 0, 3000, 600)
  this.cameras.main.setBounds(0, 0, 3000, 600)
  this.cameras.main.startFollow(player,true, 0.08,0.08)
  
  this.physics.add.collider(player,tiles)
  this.physics.add.overlap(player,obstacles,hitobastacle, null, this)
  var bombs= this.physics.add.group()
  this.physics.add.collider(bombs,tiles)
  function hitobastacle(){
    this.physics.pause()
    player.setTint(0xff0000)
    gameOver= true
    gameOverAudio.play()
    gameAudio.stop()
    var dark= this.add.rectangle(400,300,800,600,0x000000,0.5)
    dark.setScrollFactor(0)
    var gameOverText=this.add.text(280,100,'Game over!',{fontSize:'50px',fill:'red'})
    var restartText= this.add.text(160,200,'Tap the screen to restart!',{fontSize:'32px',fill:'red'})
    var hint= this.add.text(20,300,'Tip! You can also jump while on a star.',{fontSize:'32px',fill:'red'})
    hint.setScrollFactor(0)
    restartText.setScrollFactor(0)
    gameOverText.setScrollFactor(0)
    this.input.on('pointerdown',()=>{
      this.scene.restart()
      bombs.clear(true,true)
      score= 0
      wave=1
    })
  }
  var stars= this.physics.add.group({
    key: 'star',
    repeat: 29,
    setXY: {x: 600,y : 300, stepX: 70}
  })
  stars.children.iterate(function(star){
    star.y= Phaser.Math.Between(300,400)
    star.body.setAllowGravity(false)
  })
  scoreText= this.add.text(16,16,'Stars⭐: 0',{fontSize:'32px',fill:'goldenrod'})
  var goalText= this.add.text(20,60,'Only one goal, that is, collect as many stars as you can.',{fontSize:'20px',fill:'goldenrod'})
  goalText.setScrollFactor(0)
  scoreText.setScrollFactor(0)
  waveText= this.add.text(380,16,'Wave: 1',{fontSize:'32px',fill:'goldenrod'})
  waveText.setScrollFactor(0)
  this.physics.add.overlap(player,stars,collectstar,null, this)
  this.physics.add.collider(player,bombs,hitobastacle,null,this)
  function collectstar(player,star){
    star.disableBody(true,true)
    collectStarAudio.play()
    score+=1
    scoreText.setText('Stars⭐: '+score)
    
    
    
    if(stars.countActive(true)===0){
      stars.children.iterate(function(star){
        star.enableBody(true, star.x, star.y,true,true)
      })
      wave+=1
      var x= (player.x<1500)? Phaser.Math.Between(1500,3000): Phaser.Math.Between(0,1500)
      var bomb= bombs.create(x, 16,'bomb')
      bomb.setScale(2)
      bomb.setBounce(1)
      bomb.body.setSize(10,10,true)
      bomb.setCollideWorldBounds(true)
      bomb.setVelocity(Phaser.Math.Between(-200,200),20)
      waveText.setText('Wave: '+wave)
      waveAudio.play()
    }
  }
  
  
  lastDirection= 'right'
  
  this.input.addPointer(3)
  var left= this.add.sprite(100,500,'goleft').setInteractive()
  left.setScrollFactor(0)
  left.alpha= 0.5
  var right= this.add.sprite(250,500,'goright').setInteractive()
  right.setScrollFactor(0)
  right.alpha= 0.5
  var jump= this.add.sprite(700,500,'jump').setInteractive()
  jump.setScrollFactor(0)
  jump.alpha= 0.5
  left.on('pointerdown',()=>{
    goingleft= true
    
  })
  left.on('pointerup', () => {
    goingleft = false
  })
  right.on('pointerdown', () => {
    goingright = true
  })
  right.on('pointerup', () => {
    goingright = false
  })
  jump.on('pointerdown',() =>{
    jumping= true
  })
  jump.on('pointerup', () => {
    jumping = false
  })
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('right',{start: 0,end: 15}),
    frameRate: 12,
    repeat: -1
  })
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('left', { start: 0, end: 15 }),
    frameRate: 12,
    repeat: -1
  })
  this.anims.create({
    key: 'stopleft',
    frames: [
      {key: 'stopleft'}
    ],
    frameRate: 12,
    repeat: -1
  })
  this.anims.create({
    key: 'stopright',
    frames: [
      { key: 'stopright' }
    ],
    frameRate: 12,
    repeat: -1
  })
  this.anims.create({
    key: 'jumpleft',
    frames: [{key: 'left',frame: 3}],
    frameRate: 12,
    repeat: -1
  })
  this.anims.create({
    key: 'jumpright',
    frames: [{ key: 'right', frame: 3 }],
    frameRate: 12,
    repeat: -1
  })
}

function update()
{
  
 
  if(goingleft){
    player.anims.play('left',true)
    player.setVelocityX(-200)
    lastDirection='left'
  }
  else if(goingright){
    player.anims.play('right',true)
    player.setVelocityX(200)
    lastDirection='right'
  }
  
  
  else{
    player.setVelocityX(0)
    if(lastDirection==='right'){
      player.anims.play('stopright',true)
    }
    else{
      player.anims.play('stopleft',true)
    }
  }
  if(jumping && player.body.touching.down){
    player.setVelocityY(-900)
    jumpAudio.play()
  }
  if (!player.body.touching.down) {
    if (lastDirection === 'right' && player.anims.currentAnim.key !== 'jumpright') {
      player.anims.play('jumpright')
    }
    else if (lastDirection === 'left' && player.anims.currentAnim.key !== 'jumpleft') {
      player.anims.play('jumpleft')
    }
  }
}

document.addEventListener('touchstart',function(){
  if(!game.scale.isFullscreen){
    game.scale.startFullscreen()
    if(screen.orientation && screen.orientation.lock){
      screen.orientation.lock('landscape').catch(err => {
        console.warn('Orientation lock failed:', err);
      });
    }
  }
  
},{once: true})

