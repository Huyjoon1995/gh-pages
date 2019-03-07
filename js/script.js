var socket = io.connect("http://24.16.255.56:8888");


const size = 800;
const numberOfCellsPerRow = 50;
const framePerSecond = 7;

//generate the 2d array with 0 and 1
const createGrid = () => {
  const grid = new Array(numberOfCellsPerRow);
  for (var i = 0; i < grid.length; i++) {
    grid[i] = new Array(numberOfCellsPerRow);
    for (var j = 0; j < grid.length; j++) {
      //assign the grid with random 0 or 1
      grid[i][j] = Math.round(Math.random());
    }
  }
  return grid;
}
const cellColor = '#bbbbbb';
const cellSize = size / numberOfCellsPerRow;
let saveNextGenArray;
//draw the grid
const drawGrid = (ctx, grid) => {
  ctx.strokeStyle = cellColor;
  for (var i = 0; i < grid.length; i++) {
    for (var j = 0; j < grid.length; j++) {
      const value = grid[i][j];
      if (value) {
        ctx.fillRect (i * cellSize, j * cellSize, cellSize, cellSize);
      }
      ctx.strokeRect (i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
}

//generation the next generation
const nextGeneration = (grid) => {
    const nextGeneration = new Array(grid.length);
    for (var i = 0; i < grid.length; i++) {
      //generate a new array
      nextGeneration[i] = new Array(grid.length);
      for (var j = 0; j < grid.length; j++) {
        //current cell
        const value = grid[i][j];
        //get the neighbor
        const neighbors = countNeighbors(grid, i, j);
        //dead cell and exactly three neighbors
        if (value == 0 && neighbors == 3) {
          //dead cell becomes alive cell
          nextGeneration[i][j] = 1;
          //alive cell with less than 2 or greater than 3 neighbors
        } else if (value == 1 && (neighbors < 2 || neighbors > 3)) {
          //cell dies
          nextGeneration[i][j] = 0;
        } else {
          //next gen will be current cell since the cell move on to live
          nextGeneration[i][j] = value;
        }
      }
    }
    return nextGeneration;
}

// check all the neighbor from top left, right
// to bottom left, right and middle left, right
const countNeighbors = (grid, x, y) => {
  var sum = 0;
  const numRow = grid.length;
  const numCol = grid[0].length;
  //this -1 to 1 help to offset the value comes from i, j
  //its also help to deal with adjacent cell otherwise the adjacent cell never get merge
  // and keep staying in there
  for (var i = -1; i < 2; i++) {
    for (var j = -1; j < 2; j++) {
      //count live neighbors
      const row = (x + i + numRow ) % numRow ;
      const col = (y + j + numCol) % numCol;
      sum += grid[row][col];
    }
  }
  //subtracting the current cell since we dont want to count it as neighbors
  sum -= grid[x][y];
  return sum;

}

var saveButton = document.getElementById('save');
var loadButton = document.getElementById('load');
var boolean = 0;

//generate the next generation
const generation = (ctx, grid) => {
  ctx.clearRect(0, 0, size, size);
  drawGrid(ctx, grid);
  let gridNextGen = nextGeneration(grid);
//socket.emit("save", {studentname: "Huy Tran", statename: "nextGenerationGrid", data: gridNextGen});1
 // socket.emit("load", {studentname: "Huy Tran", statename: "nextGenerationGrid"});  
 saveButton.onclick = function() {
  console.log("save");
  socket.emit("save", {studentname: "Huy Tran", statename: "nextGenerationGrid", data: gridNextGen});
  console.log(gridNextGen);
 };
 loadButton.onclick = function() {
  console.log("load");
  ctx.clearRect(0, 0, size, size);
  socket.emit("load", {studentname: "Huy Tran", statename: "nextGenerationGrid"}); 
  socket.on("load", function(data) {
  console.log(data.data);
  while(gridNextGen.length) {
    gridNextGen.pop();
  }
  gridNextGen = data.data;
  }); 
  
 };
    setTimeout(() => {
    requestAnimationFrame(() => generation(ctx, gridNextGen))
  }, 1000 / framePerSecond); 
};

window.onload = () => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const grid = createGrid();
  generation(ctx, grid);
}

