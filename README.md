# brick-puzzle

> a brick-puzzle game made with Vue webpack-simple template and canvas.

## How to play

Put the bricks showing at bottom into the grid field. If a brick is successfully put, or if any row or column is filled up, player get points.

If there is no more room to put bricks, game over.

Challenge the highest score as you can.

## Change Log

2018.6.5

- Add Level system, higher level makes larger bricks easier to generate

2018.6.6

- Add count down system
  - if time reach the end, game over
  - if player successfully put brick into field, refresh timeleft to initial state
  - round time will become shorter in higher level