// Custom Depth First Search Algorithm
// JepsuCoded
// (Link)

// ============================================
// Set the number of cells per rows and columns
let cellX = 91, cellY = 41;

// Size of the cells
let s = 7;

// Maximum steps before looking for another path
let maxStep = cellX+cellY;

// How many cells to check per frame
let cycle = 60;

// Stroke weight of cell walls
let strokeSize = 1;

// ============================================
// Customize colors here
// FORMAT: [Red, Green, Blue, Alpha];
let bg = [60,47,47, 255];
let color_cellWalls = [255,244,230, 255];
let color_movingCell = [133,68,66, 255];
let color_unvisited = [190,155,123, 255];
// ============================================

let _width = s*cellX, _height = s*cellY;
let grid = [];
let cols, rows;
let startPos;
let endPos;


function setup() {
  createCanvas(_width, _height);
  //frameRate(10);
  
  cols = floor(width/floor(width/cellX));
  rows = floor(height/floor(height/cellY));
  
  // Initialized all cells in an array called grid
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      grid.push(new Cell(i, j));
    }
  }
  
  // First maze generator
  startPos = new depthFirst();
  // This is the starting cell
  startPos.start(grid[0], "start");
  
  // Second maze genenerator
  endPos = new depthFirst();
  // This is the ending cell
  endPos.start(grid[grid.length-1], "end");
}

function draw() {
  
  // Draw every cells per frame
  background(bg[0], bg[1], bg[2], bg[3]);
  grid.forEach(item => item.show());
  
  // For every cycle per frame
  for(let i = 0; i < cycle; i++) {
    // Run the depth-first search algorithm
    startPos.run();
    endPos.run();
  }
  
  // If everything is done and all cells are visited
  if (startPos.done === 1 && endPos.done === 1 && startPos.track) {
    // Combine two generated mazes
    startPos.merge(endPos);
    
    // Draw every frame
    background(bg[0], bg[1], bg[2], bg[3]);
    grid.forEach(item => item.show());
  }
}



function depthFirst() {
  
  // Group of cells
  this.group;
  
  // List of visited cells used for backtracking
  this.stack = [];
  
  // List of all visited cell used for merge function
  this.track = [];
  
  // Current position of running cell
  this.pos;
  
  // Starting cell
  this.startPos;
  
  this.done = 0;
  
  // Current steps made
  this.steps = 0;
  
  // Initialized
  this.start = function(pos, name) {
    this.pos = pos;
    this.startPos = pos;
    this.stack.push(pos);
    this.group = name;
  };
  
  // Start the algorithm
  this.run = function() {
    
    // If not done then proceed
    if(this.done === 0) {
      // Draw current position of running cell
      fill(color_movingCell[0], color_movingCell[1], color_movingCell[2], color_movingCell[3]);
      noStroke();
      rect(this.pos.a*s, this.pos.b*s, s, s);
      
      // Return all unvisited neighbor of current cell
      let unvisited = checkNeighbors(this.pos.a, this.pos.b);
      
      // Make this cell visited
      this.pos.visited = true;
      
      // If maximum steps are reached then
      if(this.steps >= maxStep - 1) {
        // Reset steps to zero
        this.steps = 0;
        // Go back to old cell to find another path
        this.pos = this.stack[this.stack.length-(floor(maxStep*0.5))-1];
      }
      // Else randomly choose new cell to visit
      else if(unvisited && this.steps < maxStep) {
       
        // Pick a new cell randomly
        let next = unvisited[floor(random(0, unvisited.length))];
        
        // Set this cell to this group
        next.group = this.group;
        
        // Remove wall between this cell and the chosen cell to visit
        removeWalls(this.pos, next);
        
        /* this.pos.show(); */
        
        //Set the chosen cell as the current cell
        this.pos = next;
        
        // Add this new cell into the tracking list
        this.track.push(this.pos);
        this.stack.push(this.pos);
        
        this.steps++;
      } 
      // Else if there is no neighbor cell to visit
      else if(this.stack.length > 1) { // Also checking for the length of stack array to prevent out of bound error
        this.steps--;
        
        // Set the current cell to previous visited cell
        this.pos = this.stack[this.stack.length-2];
        
        // Remove the last visited cell on the stack
        this.stack.pop();
      } 
      // Else everything is visited and is now done
      else if (this.done === 0) this.done = 1;
    }
    
  };
  
  // Merge two generated maze as one whole maze
  this.merge = function(path) {
    let cells = [];
    
    // Set all cells as unvisited
    for (let i = 0; i < grid.length; i++) {
      grid[i].visited = false;
    }
    
    // Loop through all cells in a generated maze
    for(let i = path.track.length-1; i > 0; i--) {
      let current = path.track[i];
      
      // Return neighbors
      let possible = checkNeighbors(current.a, current.b);
      if (possible) {
        for(let j = 0; j < possible.length; j++) {
          
          // If that cell is not in this group then
          if(possible[j].group == this.group) {
            // Add that cell to possible cells
            cells.push([current, possible[j]]);
          }
        }
      }
    }
    
    for (let i = 0; i < grid.length; i++) {
      grid[i].visited = true;
    }
    
    let r = floor(random(0, cells.length));
    
    // Remove wall between that cell in this group and another cell from the given other group
    removeWalls(cells[r][0], cells[r][1]);
    
    // Done, this function will not run anymore
    this.done++;
  };
}

function Cell(a, b) {
  // Position of this cell on the grid
  this.a = a; // x
  this.b = b; // y
  
  // Walls of this cell from top, right, bottom, left
  this.walls = [true, true, true, true];
  
  this.visited = false;
  
  // Current group of this cell
  this.name;
  
  // Rendering or displaying of this cell
  this.show = () => {
    strokeWeight(strokeSize);
    stroke(color_cellWalls[0], color_cellWalls[1], color_cellWalls[2], color_cellWalls[3]);
    let pad = 1;
    let x = this.a * s;
    let y = this.b * s;
    if (!this.visited) {
      noStroke();
      fill(color_unvisited[0], color_unvisited[1], color_unvisited[2], color_unvisited[3]);
      rect(x+pad, y+pad, s-(pad*2), s-(pad*2));
    }
    if (this.walls[0])
      line(x, y, x+s, y);
    if (this.walls[1])
      line(x+s, y, x+s, y+s);
    if (this.walls[2])
      line(x+s, y+s, x, y+s);
    if (this.walls[3])
      line(x, y+s, x, y);
  };
}

// Convert 2 dimensional array into one dimensional array index
const index = (a, b) => {
  // Check current index if its out of bound
  if (a < 0 || b < 0 || a > cols - 1 || b > rows - 1)
    return -1;
  
  // Else return its index in single array
  return a + b * cols;
};

// Function for removing wall between a and b cell
const removeWalls = (a, b) => {
  let x = a.a - b.a;
  if(x === 1) {
    a.walls[3] = false;
    b.walls[1] = false;
  } else if (x === -1) {
    a.walls[1] = false;
    b.walls[3] = false;
  }
  let y = a.b - b.b;
  if(y === 1) {
    a.walls[0] = false;
    b.walls[2] = false;
  } else if (y === -1) {
    a.walls[2] = false;
    b.walls[0] = false;
  }
};


const checkNeighbors = (a, b) => {
  let neighbors = [];
  
  // Get all surrounding cells in an array
  // Top, right, bottom, left
  let surrounding = [
    grid[index(a, b - 1)],
    grid[index(a + 1, b)],
    grid[index(a, b + 1)],
    grid[index(a - 1, b)]];
  
  for (let i = 0; i < surrounding.length; i++) {
    // If cell exist and not yet visited then
    if (surrounding[i] && !surrounding[i].visited) {
      // Add it to possible cells to visit
      neighbors.push(surrounding[i]);
    }
  }
  
  if (neighbors.length > 0) {
    return neighbors;
  } else
    return undefined;
};
