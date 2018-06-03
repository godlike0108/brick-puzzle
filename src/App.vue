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
        data: null
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
      queueMaxLength: 3,        // queue max length
      cBrick: null,             // current brick
      brickSize: 60,            // brick size
      ctx: null,                // canvas context
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
      console.log(this.loop)

      this.loop = requestAnimationFrame(this.game)

    },

    update() {

    },

    render() {

    },

    start() {
      this.loop = requestAnimationFrame(this.game);
    },

    pause() {
      if(this.loop) {
        cancelAnimationFrame(this.loop);
        this.loop = null;
      } else {
        this.start();
      }
    },

    refreshQueue() {
      if(this.brickQueue.data && this.brickQueue.data.length === 0) {
        let brickGenerator = brickGenerator || new BrickGenerator();
        for(let i = 0; i < this.queueMaxLength; i++) {
          let newBrick = brickGenerator.generate();
          this.brickQueue.data.push(newBrick);
        }
      }
    },
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
      this.ctx.translate(this.field.x, this.field.y)
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

    // hook event handlers
    hookHandlers() {
      addEventListener('keyup', e => {
        if(e.keyCode === 80) {
          this.pause()
        }
      })
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
