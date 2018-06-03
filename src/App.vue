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
      border: 20,               // border
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
        color: '#eedc00'
      },
      score: null,              // game score
      field: {                  // brick field
        x: null,
        y: null,
        width: null,
        height: null,
        row: 10,
        col: 10,
        color: '#4b4b4b',
        data: null
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
        color: 'f5f5f5'
      },
      cBrick: {                 // current brick
        size: null,
        index: null,
        position: null,
        data: null
      },
      isDrag: false,            // check if user is dragging brick
      mouse: null               // current mouse position
    }
  },
  methods: {
    init() {
      // create brick field data
      let fieldGenerator = fieldGenerator || new FieldGenerator(this.field.row, this.field.col);
      this.field.data = fieldGenerator.generate();
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
      // render UIs
      this.renderUI(this.background);
      this.renderUI(this.menuBar);
      this.renderUI(this.field);
      this.renderUI(this.brickQueue);

      // hooking event handlers
      this.hookHandlers();

      // init game loop
      this.start();

    },
    /*.game loop */
    game() {

      this.update();
      this.render();

      this.loop = requestAnimationFrame(this.game)

    },

    update() {
      // update current brick position if dragging
      if(this.isDrag) {
        this.cBrick.position = {
          x: this.mouse.x - this.cBrick.size / 2,
          y: this.mouse.y - this.cBrick.size / 2
        };
      }
      // refresh queue if empty
      this.refreshQueue();
    },

    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.renderUI(this.background);
      this.renderUI(this.menuBar);
      this.renderUI(this.field);
      this.renderUI(this.brickQueue);
      this.renderField(this.field.data);
      this.renderBrickQueue(this.brickQueue.data);
      if(this.isDrag) {
        // render current brick at mouse position
        this.renderCBrick(this.cBrick.data);
      }
    },

    start() {
      this.loop = requestAnimationFrame(this.game);
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
          if(pos.row + i > this.field.row - 1 || pos.col + 1 > this.field.col - 1) continue;
          if(this.field.data[pos.row + i][pos.col + j] === 1 && data[i][j] === 1) {
            return true;
          }
        }
      }
      return false;
    },

    putBrickInField(pos, data) {
      for(let i = 0; i < data.length; i++) {
        for(let j = 0; j < data[i].length; j++) {
          if(data[i][j] === 1) {
            this.field.data[pos.row + i][pos.col + j] = 1;
          }
        }
      }
    },

    refreshQueue() {
      if(this.brickQueue.data && this.brickQueue.data.length === 0) {
        let brickGenerator = brickGenerator || new BrickGenerator();
        for(let i = 0; i < this.brickQueue.length; i++) {
          let newBrick = brickGenerator.generate();
          this.brickQueue.data.push(newBrick);
        }
      }
    },

    /* Rendering */
    renderUI(part) {
      this.ctx.save();
      this.ctx.fillStyle = part.color;
      this.ctx.fillRect(part.x, part.y, part.width, part.height);
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
    renderCBrick(data) {
      this.ctx.save();
      this.ctx.strokeStyle = this.brick.borderColor;
      this.ctx.fillStyle = this.brick.color;
      this.ctx.translate(this.mouse.x-this.cBrick.size/2, this.mouse.y-this.cBrick.size/2);
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
    /* Handlers */
    // hook event handlers
    hookHandlers() {
      // pause
      window.addEventListener('keyup', e => {
        if(e.keyCode === 80) {
          this.togglePause()
        }
      });

      // mouse down
      this.canvas.addEventListener('mousedown', e => {
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
        if(this.isDrag) {
          this.mouse = {
            x: e.offsetX,
            y: e.offsetY
          }
        }
      });
      // mouse up to cancel drag
      this.canvas.addEventListener('mouseup', e => {
        // turn off drag mode
        this.isDrag = false;
        // get brick position
        let brickPos = this.getMatchedPosition(this.cBrick.position);
        if(this.checkInField(brickPos) && !this.checkBrickCollision(brickPos, this.cBrick.data)) {
          // put brick in field
          this.putBrickInField(brickPos, this.cBrick.data);
        } else {
          // recover the brick
          let recoveredBrick = JSON.parse(JSON.stringify(this.cBrick.data));
          this.brickQueue.data.splice(this.cBrick.index, 0, recoveredBrick);
        }
      });
    }
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
