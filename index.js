// Terminal readline ability
const readline = require('readline');
const readlineInterface = readline.createInterface(process.stdin, process.stdout);

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
}
// run the program in the terminal with node index.js
//! DO NOT TOUCH CODE ABOVE THIS LINE

start();

// Create player object
let player = {
  name: "",
  inventory: []
}


// Create classes for Rooms and Items
class Rooms {
  constructor (name, description) {
    this.name = name;
    this.description = description;
    this.items = [];
  }
}

class Item {
  constructor (name, description) {
    this.name = name;
    this.description = description;
}
}

// Create different Rooms
let outside = new Rooms("Outside", "You are outside. It's cold and dark. There is nothing but sticks and dirt out here. Unless you dropped something... You see a door that leads to the foyer ahead of you");

let foyer = new Rooms("Foyer", "You have entered the foyer of the home. There may be something in here. From here you can see the kitchen, the library, and the bedroom.")

let kitchen = new Rooms("Kitchen", "You have entered the kitchen of the house. aside from the refrigerator, this space is fairly empty. You see the bathroom door.")

let bedroom = new Rooms("Bedroom", "You have entered a messy bedroom. The only way out is back to the foyer")

let library = new Rooms("Library", "You have entered the library. It is full of books. The only way out is back to the foyer")

let bathroom = new Rooms("Bathroom", "Oh my goodness gracious! You've reached the toilet! SWEET, SWEET VICTORY!")

// Create different items
let note = new Item("Note", "*note says* The code to the bathroom door is 54321.")
library.items.push(note);
// console.log(library);

let guitar = new Item("guitar", "stashed in the corner of the room.");
bedroom.items.push(guitar);
// console.log(bedroom);
// let x = bedroom.items.pop();
// console.log(x);
let bubblegum = new Item("bubblegum", "A chewed up piece of bubblegum.")
player.inventory.push(bubblegum);

let garlic = new Item("garlic", "Some nice fresh garlic")
kitchen.items.push(garlic);

let shoelace = new Item("shoelace", "A single shoelace. Not sure what I can do with this.")
foyer.items.push(shoelace);

// Create state machine
let lookupTable = {
  outside: outside,
  foyer: foyer,
  kitchen: kitchen,
  bedroom: bedroom,
  library: library,
  bathroom: bathroom
}
// console.log(lookupTable);
let state = {
  outside: ["foyer"],
  foyer: ["kitchen", "outside", "bedroom", "library"],
  kitchen: ["bathroom", "foyer"],
  bedroom: ["foyer"],
  library: ["foyer"],
  bathroom: ["kitchen"]
}
let currentState;
// console.log(currentState);

function changeRoom(newRoom) {
  let validTransition = state[currentState]
  // console.log(validTransition);
  if (validTransition.includes(newRoom)) {
    currentState = newRoom;
    // console.log(`You have moved to the ${currentState}`);
    console.log(`\n${lookupTable[currentState].description}`);
    askToAdjust();
    // return whereToGo();
  } else {
    console.log(`\nYou cannot go from the ${currentState} to the ${newRoom}.`)
    return whereToGo();
  }
}
async function whereToGo() {
  let response = await ask("\nWhere would you like to go next? ");
  if (response.toLowerCase() === "kitchen") {
    return changeRoom("kitchen");
  } else if (response.toLowerCase() === "foyer") {
    return changeRoom("foyer");
  } else if (response.toLowerCase() === "bedroom") {
    return changeRoom("bedroom");
  } else if (response.toLowerCase() === "bathroom") {
    bathroomDoor(); // i need help solidifying the state machine. right now bathroom can be accessed from anywhere, yet the state doesn't update.
    // return changeRoom("bathroom");
  } else if (response.toLowerCase() === "outside") {
    return changeRoom("outside");
  } else if (response.toLowerCase() === "library") {
    return changeRoom("library");
  } else {
    console.log("\nI don't understand what you mean...");
    return whereToGo();
  } 
}

async function moveItem() {
  let changeStash = await ask(`\nWould you like to "add" the item to your inventory, or "drop" the item you already have? `)
  // Move item from room to player inventory
  if (changeStash === "add" && lookupTable[currentState].items.length > 0) {
    let x = lookupTable[currentState].items.pop();
    player.inventory.push(x);
    console.log("\nYour inventory now consists of:\n")
    console.log(player.inventory);
    return whereToGo();
  } else if (changeStash === "add" && lookupTable[currentState].items.length <= 0) {
    console.log("\nThere are no more items in here to take..");
    return whereToGo();
  // Move item from player inventory to room
  } else if (changeStash === "drop" && player.inventory.length > 0) {
    let y = player.inventory.pop();
    lookupTable[currentState].items.push(y);
    console.log("\nYour inventory now consists of:\n")
    console.log(player.inventory);
    return whereToGo();
  } else if (changeStash === "drop" && player.inventory.length <= 0) {
    console.log("\nYou have no items in your inventory..");
    return whereToGo();
  } 
    else {
    console.log("\nI'm not sure what you mean. Let's try that again.")
    return moveItem();
  }
}

// Function to play game agin
async function playAgain() {
  let replay = await ask(`\nWould you like to to celebrate finding the bathroom by having a drink?...Or two?  `)
  if (replay.toLowerCase() === "yes") {
    console.log("\n*Gulp..Gulp....Gulp...*\n...");
    return start();
  } else {
    console.log("\nThats probably the smart thing to do...")
    process.exit()
  }
}
// Function for bathroom door code
async function bathroomDoor() {
  console.log("\nYour drunken self has set up a lock on the door...")
  let code = await ask("\nWhat is the code? ");
  if (code === "54321") {
    console.log(`\n${bathroom.description}`);
    return playAgain();
  } else {
    console.log("\nBZZZZT! WRONG! You better hurry and find the code.");
    return whereToGo("kitchen");
  }
}
// function to ask if the player would like to adjust inventory.
async function askToAdjust() {
  let adjust = await ask("\nWould you like to adjust your inventory? yes or no? ");
  if (adjust === "yes") {
    moveItem();
  } else if (adjust === "no") {
    whereToGo();
  } else {
    console.log("\nI didn't quite catch that...");
    askToAdjust();
  }
}
async function start() {
  let introduce = await ask("\nWhat is your name?  ");
  player.name = introduce;
  // console.log(player); //Testing if this populated the player object. it did.
  const welcomeMessage = `...\n
 ${player.name}... have awoken outside from a drunken stupor...\n
and you really need to use the bathroom...\n
There is a door here. A keypad sits on the handle.
On the door is a handwritten sign. Would you like to read it?`;
console.log( welcomeMessage );
  let answer = await ask("\nYes or No? ");
  if (answer === "yes") {
    console.log("\nYou rub your tired eyes to try and see better");
    console.log("\n*SIGN READS:*\nThis door is locked by a code. The code is '12345'.")
    let doorCode = await ask("Enter the door code? ") 
      if (doorCode === "12345") {
        console.log("\nThe front door swings open, and you head inside.")
        currentState = "foyer";
        console.log("\n" + lookupTable[currentState].description);
        // whereToGo();
        askToAdjust();
      } else {
        console.log("\nBZZZZT! wrong code. Try again.")
        return start();
      }
  } else if (answer === "no") {
    console.log("\nFine then. Enjoy not finding the bathroom.");
    return start();
  } else {
    console.log("\nI'm not sure what you mean. Let's try that again.");
    return start();
  }
  // process.exit();
}
