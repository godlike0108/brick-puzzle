class BrickGenerator {
  constructor() {
    // all patterns in a 5 x 5 field
    this.patterns= [
      [
        [[1, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
      ],
      [
        [[1, 1, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
        [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
      ],
      [
        [[1, 1, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
        [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
      ],
      [
        [[1, 1, 0, 0, 0], [1, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
        [[1, 0, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
        [[0, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
        [[1, 1, 0, 0, 0], [0, 1, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
      ],
      [
        [[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
      ],
      [
        [[1, 1, 1, 1, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
        [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
      ],
      [
        [[1, 1, 1, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
        [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
        [[0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [1, 1, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
        [[1, 1, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
      ],
      [
        [[1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
        [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]]
      ],
      [
        [[1, 1, 1, 0, 0], [1, 1, 1, 0, 0], [1, 1, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
      ]
    ],

    // brick appear chance
    this.curChance = [
      [11, 22, 33, 44, 55, 66, 77, 88],
      [9, 18, 30, 42, 54, 66, 77, 88],
      [7, 14, 26, 38, 50, 62, 75, 87],
      [5, 10, 23, 36, 49, 62, 75, 87],
      [3, 6, 19, 32, 45, 58, 71, 84]
    ];
    // brick limit chance
    this.limit = 4;
    // chance delta
    this.delta = 4;
    // level limit
    this.levelLimit = 4;
  }

  generate(level) {
    if(level > this.levelLimit) {level = this.levelLimit;}
    let type, direction;
    // choose brick type
    let rand = Math.floor(Math.random() * 100);
    type = this.curChance[level].findIndex(upperLimit => rand <= upperLimit);
    if(type === -1) {type = this.curChance[level].length}
    // choose brick direction
    direction = Math.floor(Math.random() * this.patterns[type].length);
    // generate new brick with pattern data
    let chosenPattern = this.patterns[type][direction];
    let brick = chosenPattern.map(row => {
      let newRow = [];
      row.forEach(col => newRow.push(col));
      return newRow;
    });

    return brick;
  }
}

class FieldGenerator {
  constructor(row, col) {
    this.row = row;
    this.col = col;
  }

  generate() {
    let field = [];
    for(let i=0; i<this.row; i++) {
      let row = [];
      for(let j=0; j<this.col; j++) {
        row.push(0);
      }
      field.push(row);
    }
    return field;
  }
}

export {
  BrickGenerator, FieldGenerator
}
