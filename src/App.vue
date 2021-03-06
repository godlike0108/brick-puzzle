<template>
  <div id="app">
    <canvas id="game"></canvas>
  </div>
</template>

<script>
import {BrickGenerator, FieldGenerator} from './library'

export default {
  name: 'app',
  mounted() {
    this.init();
  },
  data () {
    return {
      x: null,                  // game position x
      y: null,                  // game position y
      canvas: null,             // canvas DOM
      ctx: null,                // canvas context
      loop: null,               // game loop
      status: null,             // ingame: 1, gameover: 0
      brickGenerator: null,     // generate bricks
      border: 20,               // border
      time: null,               // current time of each round
      maxT: 30,                 // max limit time
      minT: 3,                  // min limit time
      levelT: null,              // max time of current level
      freqT: 1000,              // frequency of round time change
      trigT: null,              // timestamp which triggers time change,
      scorePerLevel: 100,
      background: {
        x: null,
        y: null,
        width: null,
        height: null,
        color: '#2e2d2d'
      },
      menuBar: {                // menuBar settings
        x: null,
        y: null,
        width: null,
        height: 100,
        color: '#2e2d2d'
      },
      score: {                  // game score
        data: null,
        color: '#f5f5f5',
        style: '900 36px Avenir, Helvetica, Arial, sans-serif',
        x: 30,
        y: 20,
        size: 36
      },
      level: {                  // game level
        data: null,
        color: '#f5f5f5',
        style: '900 36px Avenir, Helvetica, Arial, sans-serif',
        x: null,
        y: 20,
        size: 36
      },
      timeBar: {                // menuBar settings
        x: null,
        y: 80,
        width: null,
        height: 20,
        color: {
          r: 255,
          g: 255,
          b: 0
        }
      },
      field: {                  // brick field
        x: null,
        y: null,
        width: null,
        height: null,
        row: 10,
        col: 10,
        color: '#4b4b4b',
        data: null,
        full:null
      },
      brickQueue: {             // queue preference
        x: null,
        y: null,
        width: null,
        height: 200,
        color: '#f5f5f5',
        data: null,
        length: 3,              // max length
      },
      brickInQueue: {           // brick in queue preference
        outerW: null,
        outerH: null,
        padding: 20,
        innerW: null,
        innerH: null,
        size: null
      },
      brick: {                  // brick preference
        size: 60,
        borderColor: '#fff',
        color: '#eedc00'
      },
      cBrick: {                 // current brick
        size: null,
        index: null,
        position: null,
        data: null
      },
      gameOver: {
        x: null,
        y: null,
        width: null,
        height: null,
        color: '#f00',
        textX: null,
        textY: null,
        textColor: '#fff',
        textSize: 72,
        style: '900 72px Avenir, Helvetica, Arial, sans-serif',
        text: 'GAME OVER'
      },
      restartBtn: {
        x: null,
        y: null,
        width: null,
        height: 60,
        color: '#eedc00',
        textX: null,
        textY: null,
        textColor: '#2e2d2d',
        textSize: 36,
        style: '900 36px Avenir, Helvetica, Arial, sans-serif',
        text: 'RESTART'
      },
      isDrag: false,            // check if user is dragging brick
      mouse: null               // current mouse position
    }
  },
  methods: {
    init() {
      // init total time
      this.totalT = 0;
      // set level
      this.level.data = 0;
      // set score
      this.score.data = 0;
      // init level time
      this.levelT = this.maxT;
      // set player time
      this.time = this.levelT * 1000;
      // set player time trigger point
      this.trigT = this.freqT;
      // create brick field data
      let fieldGenerator = fieldGenerator || new FieldGenerator(this.field.row, this.field.col);
      this.field.data = fieldGenerator.generate();
      // init field fulled array
      this.field.full = [];
      // load brick generator
      this.brickGenerator = this.brickGenerator || new BrickGenerator();
      // create brick queue data
      this.brickQueue.data = [];
      this.refreshQueue();
      // hook DOM
      this.canvas = document.querySelector('#game');
      // get context
      this.ctx = document.querySelector('#game').getContext('2d');
      // set canvas width/height
      this.ctx.canvas.width = this.brick.size * this.field.col + this.border * 2;
      this.ctx.canvas.height = this.menuBar.height + this.brick.size * this.field.row + this.brickQueue.height + this.border * 2;
      // set background UI
      this.background.x = 0;
      this.background.y = 0;
      this.background.width = this.ctx.canvas.width;
      this.background.height = this.ctx.canvas.height;
      // set menuBar UI
      this.menuBar.x = this.border;
      this.menuBar.y = this.border;
      this.menuBar.width = this.brick.size * this.field.col;
      // set menuBar UI
      this.timeBar.x = this.border;
      this.timeBar.width = this.menuBar.width;
      // set brick field UI
      this.field.x = this.border;
      this.field.y = this.border + this.menuBar.height;
      this.field.width = this.brick.size * this.field.col;
      this.field.height = this.brick.size * this.field.row;
      // set brick queue UI
      this.brickQueue.x = this.border;
      this.brickQueue.y = this.border + this.menuBar.height + this.field.height;
      this.brickQueue.width = this.brick.size * this.field.col;
      this.brickInQueue.outerW = this.brickQueue.width / 3;
      this.brickInQueue.outerH = this.brickQueue.height;
      this.brickInQueue.innerW = this.brickInQueue.outerW - this.brickInQueue.padding * 2;
      this.brickInQueue.innerH = this.brickInQueue.outerH - this.brickInQueue.padding * 2;
      this.brickInQueue.size = this.brickInQueue.innerW / 5;
      // set current brick UI
      this.cBrick.size = this.brick.size * 5;
      // set GAMEOVER UI
      this.gameOver.width = this.background.width * 0.8;
      this.gameOver.height = this.background.height * 0.4;
      this.gameOver.x = this.background.width / 2 - this.gameOver.width / 2;
      this.gameOver.y = this.background.height / 2 - this.gameOver.height / 2;
      // set restart button UI
      this.restartBtn.width = this.gameOver.width * 0.4;
      this.restartBtn.x = this.background.width / 2 - this.restartBtn.width / 2;
      this.restartBtn.y = this.gameOver.y + this.gameOver.height / 2 + this.restartBtn.height;
      // render UIs
      this.renderUI(this.background);
      this.renderUI(this.menuBar);
      this.renderUI(this.field);
      this.renderUI(this.brickQueue);
      this.renderScore();
      this.renderLevel();
      this.renderTimeBar();

      // hooking event handlers
      this.hookHandlers();

      // init game loop
      this.start();

    },
    restart() {
      // reset player round trigger time
      this.trigT = this.freqT;
      // reset level time
      this.levelT = this.maxT;
      // set player time
      this.time = this.levelT * 1000;
      // clear level
      this.level.data = 0;
      // clear score
      this.score.data = 0;
      // clear field
      let fieldGenerator = fieldGenerator || new FieldGenerator(this.field.row, this.field.col);
      this.field.data = fieldGenerator.generate();
      // refresh queue
      this.brickQueue.data = [];
      this.refreshQueue();
      // start game
      this.start();
    },
    /*.game loop */
    game(timestamp) {
      
      this.update(timestamp);
      this.render();

      this.loop = requestAnimationFrame(this.game);

    },

    update(timestamp) {
      // round time change with specific frequency
      if(timestamp > this.trigT && this.status 
        !== 0) {
        this.time -= 1000;

        // update trigT
        this.trigT = timestamp + this.freqT;
        // update time bar
        this.updateTimeBar();
      }

      if(this.time <= 0) {
        // game over
        this.status = 0;
      }

      // update current brick position if dragging
      if(this.isDrag) {
        this.cBrick.position = {
          x: this.mouse.x - this.cBrick.size / 5,
          y: this.mouse.y - this.cBrick.size / 2
        };
      }

    },

    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.renderUI(this.background);
      this.renderUI(this.menuBar);
      this.renderUI(this.field);
      this.renderUI(this.brickQueue);
      this.renderField(this.field.data);
      this.renderBrickQueue(this.brickQueue.data);
      this.renderScore();
      this.renderLevel();
      this.renderTimeBar();
      if(this.isDrag) {
        // render current brick at mouse position
        this.renderCBrick(this.cBrick.data);
      }
      if(this.status === 0) {
        this.renderGameOver();
        this.renderRestartBtn();
      }
    },

    start() {
      this.status = 1;
      if(!this.loop) {
        this.loop = requestAnimationFrame(this.game);
      }
    },

    togglePause() {
      if(this.loop) {
        cancelAnimationFrame(this.loop);
        this.loop = null;
      } else {
        this.start();
      }
    },

    checkAInB(a, b) {
      if(a.x < b.left || a.x > b.right || a.y < b.top || a.y > b.bottom) return false;
      return true;
    },

    getBrickIndex(mouse) {
      let bricks = [];
      for(let i = 0; i < this.brickQueue.length; i++) {
        let brick = {};
        brick.left = this.brickQueue.x + this.brickInQueue.outerW * i;
        brick.right = this.brickQueue.x + this.brickInQueue.outerW * (i+1);
        brick.top = this.brickQueue.y;
        brick.bottom = this.brickQueue.y + this.brickInQueue.outerH;
        bricks.push(brick);
      }

      if(this.checkAInB(mouse, bricks[0])) return 0;
      if(this.checkAInB(mouse, bricks[1])) return 1;
      if(this.checkAInB(mouse, bricks[2])) return 2;
      return null;
    },

    getMatchedPosition(pos) {
      // get matched row and col index
      let sX = Math.floor((pos.x - this.field.x) / this.brick.size);
      let sY = Math.floor((pos.y - this.field.y) / this.brick.size);

      let modX = (sX <= -1) ? (pos.x - this.field.x + this.brick.size) % this.brick.size : (pos.x - this.field.x) % this.brick.size;
      let modY = (sY <= -1) ? (pos.y - this.field.y + this.brick.size) % this.brick.size : (pos.y - this.field.y) % this.brick.size;

      if(modX > this.brick.size/2) {sX++}
      if(modY > this.brick.size/2) {sY++}

      return {
        row: sY,
        col: sX
      }
    },

    checkInField(pos) {
      if(pos.col < 0 || pos.col > this.field.col - 1 || pos.row < 0 || pos.row > this.field.row - 1) {
        return false;
      }
      return true;
    },

    checkBrickCollision(pos, data) {
      for(let i = 0; i < data.length; i++) {
        for(let j = 0; j < data[i].length; j++) {
          if(data[i][j] === 0) continue;
          if(pos.row + i < 0 || pos.row + i > this.field.row - 1 || pos.col + j < 0 || pos.col + j > this.field.col - 1) return true;
          if(this.field.data[pos.row + i][pos.col + j] === 1) return true;
        }
      }
      return false;
    },

    putBrickInField(pos, data) {
      for(let i = 0; i < data.length; i++) {
        for(let j = 0; j < data[i].length; j++) {
          if(data[i][j] === 1) {
            this.field.data[pos.row + i][pos.col + j] = 1;
            this.score.data++;
          }
        }
      }
    },

    updateRoundTime() {
      this.time = this.levelT * 1000;
    },

    updateTimeBar() {
      this.timeBar.width = this.menuBar.width * (this.time / (this.levelT * 1000));
      this.timeBar.color.g = Math.floor(255 * (this.time / (this.levelT * 1000)));
    },

    refreshQueue() {
      if(this.brickQueue.data && this.brickQueue.data.length === 0) {
        for(let i = 0; i < this.brickQueue.length; i++) {
          let newBrick = this.brickGenerator.generate(this.level.data);
          this.brickQueue.data.push(newBrick);
        }
      }
    },

    checkRowFull(row) {
      return row.every(value => value === 1);
    },

    checkColFull(data, colIndex) {
      return data.every(row => row[colIndex] === 1);
    },

    checkFieldFull(data) {
      // check if row is full, add to full array
      data.forEach((row, index) => {
        if(this.checkRowFull(row)) {
          this.field.full.push(index);
        }
      });
      // if col is full ,add to col array
      for(let col = 0; col < this.field.col; col++) {
        if(this.checkColFull(data, col)) {
          this.field.full.push(col + this.field.row);
        }
      }
    },

    cleanFullField() {
      while(this.field.full.length > 0) {
        // get the field index
        let index = this.field.full.shift();
        if(index < this.field.row) {
          for(let i = 0; i < this.field.data[index].length; i++) {
            this.field.data[index][i] = 0;
          }
          this.score.data += 10;
        } else if (index < this.field.row * 2) {
          for(let i = 0; i < this.field.data.length; i++) {
            this.field.data[i][index - this.field.row] = 0;
          }
          this.score.data += 10;
        }
      }
    },

    upgradeLevel() {
      this.level.data = Math.floor(this.score.data / this.scorePerLevel);
      this.levelT = this.minT + (this.maxT - this.minT) / (this.level.data + 1);
    },

    checkGameOver(fData, qData) {
      for(let qIdx = 0; qIdx < this.brickQueue.data.length; qIdx++) {
        for(let fRow = 0; fRow < this.field.data.length; fRow++) {
          for(let fCol = 0; fCol < this.field.data[fRow].length; fCol++) {
            let position = {
              row: fRow,
              col: fCol
            };
            if(this.checkBrickCollision(position, qData[qIdx])) {
              continue;
            } else {
              return false;
            }
          }
        }
      }
      return true;
    },

    /* Rendering */
    renderUI(part) {
      this.ctx.save();
      this.ctx.fillStyle = part.color;
      this.ctx.fillRect(part.x, part.y, part.width, part.height);
      this.ctx.restore();
    },
    renderTimeBar() {
      this.ctx.save();
      this.ctx.fillStyle = `rgb(${this.timeBar.color.r}, ${this.timeBar.color.g}, ${this.timeBar.color.b})`;
      this.ctx.fillRect(this.timeBar.x, this.timeBar.y, this.timeBar.width, this.timeBar.height);
      this.ctx.restore();
    },
    // render brick status
    renderField(data) {
      this.ctx.save();
      this.ctx.strokeStyle = this.brick.borderColor;
      this.ctx.fillStyle = this.brick.color;
      this.ctx.translate(this.field.x, this.field.y);
      let size = this.brick.size;
      for(let i = 0; i < data.length; i++) {
        for(let j = 0; j < data[i].length; j++) {
          if(data[i][j] === 1) {
            this.ctx.fillRect(size * j, size * i, size, size);
          }
          this.ctx.strokeRect(size * j, size * i, size, size);
        }
      }
      this.ctx.restore();
    },
    // render brick queue
    renderBrickQueue(data) {
      this.ctx.save();
      this.ctx.strokeStyle = this.brick.borderColor;
      this.ctx.fillStyle = this.brick.color;
      this.ctx.translate(this.brickQueue.x, this.brickQueue.y);
      data.forEach((brick, index) => {
        for(let i = 0; i < brick.length; i++) {
          for(let j = 0; j < brick[i].length; j++) {
            if(brick[i][j] !== 1) continue;
            let size = this.brickInQueue.size;
            let x = this.brickInQueue.padding + this.brickInQueue.outerW * index + size * j;
            let y = this.brickInQueue.padding + size * i;
            this.ctx.fillRect(x, y, size ,size);
            this.ctx.strokeRect(x, y, size, size);
          }
        }
      })
      this.ctx.restore();
    },
    renderScore() {
      this.ctx.save();
      this.ctx.font = this.score.style;
      this.ctx.fillStyle = this.score.color;
      this.ctx.fillText(`Score: ${this.score.data}`, this.menuBar.x + this.score.x, this.menuBar.y + this.score.y + this.score.size / 2);
      this.ctx.restore();
    },
    renderLevel() {
      this.ctx.save();
      this.ctx.font = this.level.style;
      this.ctx.fillStyle = this.level.color;
      this.level.x = this.level.x || this.menuBar.width - this.ctx.measureText(this.level.text).width;
      this.ctx.fillText(`Level: ${this.level.data}`, this.menuBar.x + this.level.x, this.menuBar.y + this.level.y + this.level.size / 2);
      this.ctx.restore();
    },
    renderCBrick(data) {
      this.ctx.save();
      this.ctx.strokeStyle = this.brick.borderColor;
      this.ctx.fillStyle = this.brick.color;
      this.ctx.translate(this.cBrick.position.x, this.cBrick.position.y);
      for(let i = 0; i < data.length; i++) {
        for(let j = 0; j < data[i].length; j++) {
          if(data[i][j] !== 1) continue;
          let size = this.brick.size;
          let x = size * j;
          let y = size * i;
          this.ctx.fillRect(x, y, size ,size);
          this.ctx.strokeRect(x, y, size, size);
        }
      }
      this.ctx.restore();
    },
    renderGameOver() {
      this.ctx.save();
      this.renderUI(this.gameOver);
      this.ctx.font = this.gameOver.style;
      this.ctx.fillStyle = this.gameOver.textColor;
      this.gameOver.textX = this.gameOver.textX || this.gameOver.x + this.gameOver.width / 2 - this.ctx.measureText(this.gameOver.text).width / 2;
      this.gameOver.textY = this.gameOver.textY || this.gameOver.y + this.gameOver.height / 4 + this.gameOver.textSize / 3;
      this.ctx.fillText(this.gameOver.text, this.gameOver.textX, this.gameOver.textY);
      this.ctx.restore();
    },
    renderRestartBtn() {
      this.ctx.save();
      this.renderUI(this.restartBtn);
      this.ctx.font = this.restartBtn.style;
      this.ctx.fillStyle = this.restartBtn.textColor;
      this.restartBtn.textX = this.restartBtn.textX || this.restartBtn.x + this.restartBtn.width / 2 - this.ctx.measureText(this.restartBtn.text).width / 2;
      this.restartBtn.textY = this.restartBtn.textY || this.restartBtn.y + this.restartBtn.height / 2 + this.restartBtn.textSize / 3;
      this.ctx.fillText(this.restartBtn.text, this.restartBtn.textX, this.restartBtn.textY);
      this.ctx.restore();
    },
    /* Handlers */
    // hook event handlers
    hookHandlers() {
      // pause
      // window.addEventListener('keyup', e => {
      //   if(e.keyCode === 80) {
      //     this.togglePause()
      //   }
      // });

      // mouse down
      this.canvas.addEventListener('mousedown', e => {
        if(e.which !== 1) return;
        if(this.status === 0) return;
        if(this.isDrag === true) return;
        this.mouse = {
          x: e.offsetX,
          y: e.offsetY
        }
        // find the brick index
        let index = this.getBrickIndex(this.mouse);
        if(index === null) return;
        if(this.brickQueue.data.length > index) {
          // copy the brick in queue
          this.cBrick.index = index;
          this.cBrick.data = JSON.parse(JSON.stringify(this.brickQueue.data[index]));
          // kill the copied brick in queue
          this.brickQueue.data.splice(index, 1);
          // turn on drag flag
          this.isDrag = true;
        }
      });
      this.canvas.addEventListener('mousemove', e => {
        if(this.status === 0) return;
        if(this.isDrag) {
          this.mouse = {
            x: e.offsetX,
            y: e.offsetY
          }
        }
      });
      // mouse up to cancel drag
      this.canvas.addEventListener('mouseup', e => {
        if(e.which !== 1) return;
        if(this.status === 0) return;
        // turn off drag mode
        this.isDrag = false;
        // get brick position
        if(this.cBrick.position === null) return;
        let brickPos = this.getMatchedPosition(this.cBrick.position);
        if(this.checkInField(brickPos) && !this.checkBrickCollision(brickPos, this.cBrick.data)) {
          // put brick in field
          this.putBrickInField(brickPos, this.cBrick.data);
          // check if field is full
          this.checkFieldFull(this.field.data);
          // clean fulled field
          this.cleanFullField();
          // upgrade Level
          this.upgradeLevel();
          // refresh queue if empty
          this.refreshQueue();
          // update round Time
          this.updateRoundTime();
          // check if game is over
          if(this.checkGameOver(this.field.data, this.brickQueue.data)){
            this.status = 0;
          }
        } else if(this.cBrick.data.length > 0){
          // recover the brick
          let recoveredBrick = JSON.parse(JSON.stringify(this.cBrick.data));
          this.brickQueue.data.splice(this.cBrick.index, 0, recoveredBrick);
        }
        // clear the current brick
        this.cBrick.position = null;
        this.cBrick.data = [];
        this.cBrick.index = null;
      });
      // mouse click to trigger restart
      this.canvas.addEventListener('click', e => {
        if(this.status !== 0) return;
        let mouse = {
          x: e.offsetX,
          y: e.offsetY
        }
        if(mouse.x < this.restartBtn.x || mouse.x > this.restartBtn.x + this.restartBtn.width || mouse.y < this.restartBtn.y || mouse.y > this.restartBtn.y + this.restartBtn.height) return;

        this.restart();
      })
    },
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#game {
  border: 2px solid black;
}

</style>
