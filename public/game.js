const url = "https://script.googleusercontent.com/macros/echo?user_content_key=2y0i88ho87knjBIVh9cVxkYAn5uRV6XsHWwUkRtuaGp7R6WWcalWB-w4a9fSxQ7W19Wva6axkBFtP4hk6jOFqojLmpT9YT7Mm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnPsNnm2HTJRzH_jLgFCCV0vA-RH7G4F7UGOYP7JDAN7EPj15A3ob1uFIfoiovHisn5KcDWhERO5nW2apdwmUjfrE78tZtLS8jw&lib=Mup9N75c0LQ9y5AwEbzNhcEPsFIFI9xUV"
var cards = [];
var css = [];
var totalCards = 60;

fetch(url).then(d => d.json()).then(d => {
  cards = (d[0].data);
  for (var i = 0; i < totalCards; i++){
    css.push(cards[i]["css"])
  }
  var s = document.createElement("style");
  s.innerHTML = css.join(" ");
  document.getElementsByTagName("head")[0].appendChild(s);
});

const socket = io();
var menutype = ""; 
var discard = []; 
var oppdiscard = [];
var current_deck = [];
var current_card = undefined; 
var current_damage = 0;
var last_id = null;
var points = [0,0]
var renderCount = 0;
var boardstate = {
  front: undefined,
  camp1: undefined,
  camp2: undefined,
  camp3: undefined,
  camp4: undefined,
  hand1: undefined,
  hand2: undefined,
  hand3: undefined,
  hand4: undefined,
  hand5: undefined,
  frontitem: undefined,
  campitem1: undefined,
  campitem2: undefined,
  campitem3: undefined,
  campitem4: undefined,
 
};
var damagestate = {
  front: 0,
  camp1: 0,
  camp2: 0,
  camp3: 0,
  camp4: 0,
}

var interval = setInterval(function() {

  if( cards == "undefined" || cards == ""){
  }else{
    document.getElementById("loading-screen").remove()

    clearInterval(interval);
    console.log('%c🔮Soul Data Downloaded', 'background: teal; color: white; font-size: 1.5rem;')

}}, 100)


socket.on("player-number", num => {
if (num === -1) {
  console.log('%c⛓️Server Full ', 'background: red; color: white; font-size: 1.5rem;');

}else{
  num++
  console.log('%c🔗Connected as Player ' +num, 'background: green; color: white; font-size: 1.5rem;')
  }

})
socket.on("push",data => {
renderCard(data["cardnumb"],"opp"+data["location"])
if (data["location"].includes("attach")) {
  document.getElementById("opp"+data["location"]).style.display = "block";

}

})
socket.on("pull",data => {
  document.getElementById("opp"+data).innerHTML="";
  if (data.includes("attach")) {

    document.getElementById("opp"+data).style.display = "none";
  }
})
socket.on("deck",data => {
  document.getElementById("oppdeck").innerHTML = data;

})
socket.on("discard",data => {
  document.getElementById("oppdiscard").innerHTML="";
  oppdiscard = data;
          if (oppdiscard[oppdiscard.length-1] !== undefined) {
          renderCard(oppdiscard[oppdiscard.length-1],"oppdiscard")
}
})

socket.on("point",data => {
  points[0]++
  document.querySelector('#oppscore :nth-child('+(5-points[0])+')').checked = true;  
    
  
})

socket.on("damage",data => {
  document.querySelector("#opp"+data["location"]+' + input').value  = data["damage"]; 


})

function renderBoard(con) {
  document.getElementById("fullcard_render").innerHTML = "";
  document.getElementById("fullcard_render").innerHTML = "";
  document.getElementById("search-box-all").style.display = "none";
  document.getElementById("search-box-all").innerHTML = "";
  document.getElementById("menu").style.display = "none";
  document.getElementById("buildmenu").style.display = "none";

  "main"===con?
  (document.getElementById("oppboard").style.display="block",
  document.getElementById("fullboard").style.display="block",
  document.getElementById("search-box").innerHTML="",
  document.getElementById("search-box").style.display="none")
  :"search"===con?
  (document.getElementById("oppboard").style.display="none",
  document.getElementById("search-box").style.display="flex")
  :"builder"===con&&
  (document.getElementById("fullboard").style.display="none",
  document.getElementById("menu").style.display="none",
  document.getElementById("search-box").style.display="flex",
  document.getElementById("search-box-all").style.display="flex",
  document.getElementById("buildmenu").style.display="flex");
  


}
function moveCard(clicked_id) { //moves card from a placce on the board / hand
  renderBoard("main");
  
  if (boardstate[clicked_id] == undefined && current_card !== undefined) {
    
    
    renderCard(current_card, clicked_id);
    
    socket.emit("push",{ cardnumb: current_card, location: clicked_id });
    boardstate[clicked_id] = current_card;
    current_card = undefined;
    if (!clicked_id.includes("hand")) {
    damagestate[clicked_id] = current_damage;
    socket.emit("damage",{ damage: current_damage, location: clicked_id });
    damagestate[clicked_id] > 0 &&(document.querySelector("#"+clicked_id+" + input").value=damagestate[clicked_id]);
  }
    current_damage = 0;
    
  } else if (boardstate[clicked_id] !== undefined && current_card !== undefined && cards[current_card]["type"]==="aura") {
    if (!clicked_id.includes("hand")) {
      document.getElementById(clicked_id+"attach").style.display = "block"; 
      renderCard(current_card,clicked_id+"attach")
      boardstate[clicked_id+"attach"] = current_card;
      socket.emit("push", { cardnumb: current_card, location: clicked_id+"attach" });
      current_card = undefined;
    }

  } else if (current_card == undefined && boardstate[clicked_id] !== undefined) {
    socket.emit("pull",clicked_id);
    current_card = boardstate[clicked_id]; // take the card and pick it up
    boardstate[clicked_id] = undefined; // empty the slot
    document.getElementById(clicked_id).innerHTML = "";
    if (current_card !== undefined) {
    
      if (clicked_id.includes('attach')) {
      document.getElementById([clicked_id]).style.display = "none";
    
  }
  if (!clicked_id.includes("hand")) {
    if (!clicked_id.includes("attach")){
    current_damage = damagestate[clicked_id];
    socket.emit("damage",{ damage: 0, location: clicked_id });
    document.querySelector("#"+clicked_id+' + input').value  = ""; 
  } 
  damagestate[clicked_id] = 0;}
}

  }
}
function deckCard(clicked_id) { 
  renderBoard("main");
  Shuffle()
  if (current_card == undefined) {
    current_card = this.current_deck[0];
    current_deck.shift();
    document.getElementById(clicked_id).innerHTML = current_deck.length;
    socket.emit("deck", current_deck.length);

  } else {
    current_deck.push(current_card);
    document.getElementById(clicked_id).innerHTML = current_deck.length;
    socket.emit("deck", current_deck.length);
    current_card = undefined;
  }
}
function discardCard(clicked_id) { //interact with the discard on click
  //if you are holding a card discard it
  if (current_card == undefined) {
    searchDiscard();
  } else {
    discard.push(current_card);
    document.getElementById(clicked_id).innerHTML = "";
    renderCard(current_card, clicked_id);
    socket.emit("discard", discard);
    current_card = undefined;
  }
}
function searchDiscard() {
  

  if (current_card == undefined) {//render the discard
  if (discard.length > 0) {
    menutype = "discard";
 renderBoard("search");
  var el = document.getElementById("search-box");
  while (el.firstChild) el.removeChild(el.firstChild);

  for (var i = 0; i < discard.length; i++) {
    document.getElementById("search-box").appendChild(createCard(discard[i]));
  }
}}
}
function searchOppDiscard() { 
  if (oppdiscard.length > 0) {
    menutype = "oppdiscard";
    renderBoard("search");
  var el = document.getElementById("search-box");
  while (el.firstChild) el.removeChild(el.firstChild);

  for (var i = 0; i < oppdiscard.length; i++) {
    document.getElementById("search-box").appendChild(createCard(oppdiscard[i]));
  }
}
}
function searchDeck() { 

  if (current_deck.length >0) {
    menutype = "deck";
  
  
  if (current_card == undefined) {
  renderBoard("search");
  
  current_deck.sort(function (a, b) {
    if (a === Infinity) return 1;
    else if (isNaN(a)) return -1;
    else return a - b;
  })

  var el = document.getElementById("search-box");
  while (el.firstChild) el.removeChild(el.firstChild);

  for (var i = 0; i < current_deck.length; i++) {
    document.getElementById("search-box").appendChild(createCard(current_deck[i]));
    
  }
}
return false;
}
}
function createCard(rendered_card) {
  renderCount++
  var render = document.createElement("div");
  render.className = "renderedCard";
  render.id= "render"+ renderCount;

  
  document.body.appendChild(render);
  renderCard(rendered_card, render.id);
  render.onclick = function () {
   
          if (current_card === undefined) {
    current_card = rendered_card;
    
    if (menutype === "discard") {
      for (var i = 0; i < discard.length; i++) {
        if (discard[i] === rendered_card) {
          discard.splice(i, 1);
          searchDiscard();
          document.getElementById("discard").innerHTML = "";
          if (discard[discard.length-1] !== undefined) {
          renderCard(discard[discard.length-1],"discard")
          socket.emit("discard", discard);
          }
          break;
        }
      }
    } else if (menutype === "deck") {
      for (var i = 0; i < current_deck.length; i++) {
        if (current_deck[i] === rendered_card) {
          current_deck.splice(i, 1);
          searchDeck();
          document.getElementById("my-deck").innerHTML = current_deck.length;
          socket.emit("deck", current_deck.length);
        }
      }
    } else if (menutype === "oppdiscard") {
      current_card = undefined;
    
    }
    renderBoard("main");
    menutype = "";



  } else { }
    var el = document.getElementById("search-box");
    while (el.firstChild) el.removeChild(el.firstChild);
    Shuffle();
  };
 
  

  return render;
}
function renderCard(cardnumb, board_id) {
var obj = cards[cardnumb]; 

 var cardDiv = document.createElement("div");
 document.getElementById(board_id).appendChild(cardDiv);
 cardDiv.className = "rendered minicard card"+cardnumb+" "+obj["type"]+" "+obj["color"]+" unit"+obj["soulcost"];
 cardDiv.id = board_id;

 cardDiv.oncontextmenu = function () {
   
 document.getElementById("fullcard_render").style.display = "flex"
 fullcardRender(cardnumb,"fullcard_render");
   return false;
   
 }
 cardDiv.ontouchmove = cardDiv.oncontextmenu;

 if (obj["type"] == "unit") {

 var healthDiv = document.createElement("p");
 cardDiv.appendChild(healthDiv);
 healthDiv.className = "rendered health";

 var imagebackgroundDiv = document.createElement("div");
 cardDiv.appendChild(imagebackgroundDiv);
 imagebackgroundDiv.className = "rendered imagebackground";

 var slot1Div = document.createElement("p");
 cardDiv.appendChild(slot1Div);
 slot1Div.className = "rendered slot1 "+obj["slot1"];

 var soulwrapperDiv = document.createElement("div");
 cardDiv.appendChild(soulwrapperDiv);
 soulwrapperDiv.className = "rendered soulwrapper";

 for (var i = 0; i < ((obj["soulcost"]).toString()).length; i++) {
  var soulcostDiv = document.createElement("div");
  soulwrapperDiv.appendChild(soulcostDiv);
  soulcostDiv.className = "rendered soulcost"+" "+((obj["soulcost"]).toString())[i];
 }

 } else {

   var imagebackgroundDiv = document.createElement("div");
   cardDiv.appendChild(imagebackgroundDiv);
   imagebackgroundDiv.className = "rendered imagebackground";

   var tagDiv = document.createElement("div");
   cardDiv.appendChild(tagDiv);
   tagDiv.className = "rendered tag";

 } 
} 
function fullcardRender(render_card_number, eleID) {
  document.getElementById(eleID).innerHTML = "";

  var obj = cards[render_card_number]; // parse into json
  var cardDiv = document.createElement("div");
  document.getElementById(eleID).appendChild(cardDiv);
  cardDiv.className = "rendered card card"+render_card_number+" "+obj["type"]+" "+obj["color"]+" "+obj["subtype"];
  
  cardDiv.ontouchmove = function () {
    document.getElementById(eleID).innerHTML = ""
    document.getElementById(eleID).style.display = "none"
}
  cardDiv.oncontextmenu  = function () {
    document.getElementById(eleID).innerHTML = ""
    document.getElementById(eleID).style.display = "none"

    
    return false;
    
  }

  cardDiv.onclick = function () {
  }

 
  var nameDiv = document.createElement("p");
  cardDiv.appendChild(nameDiv);
  nameDiv.className = "rendered name";

  var healthDiv = document.createElement("p");
  cardDiv.appendChild(healthDiv);
  healthDiv.className = "rendered health";
 
  var soulwrapperDiv = document.createElement("div");
  cardDiv.appendChild(soulwrapperDiv);
  soulwrapperDiv.className = "rendered soulwrapper";

  for (var i = 0; i < ((obj["soulcost"]).toString()).length; i++) {
    var soulcostDiv = document.createElement("div");

    soulwrapperDiv.appendChild(soulcostDiv);
    soulcostDiv.className = "rendered soulcost"+" "+((obj["soulcost"]).toString())[i];
   }
   
 
  var imagebackgroundDiv = document.createElement("div");
  cardDiv.appendChild(imagebackgroundDiv);
  imagebackgroundDiv.className = "rendered imagebackground";
  
  var slot1Div = document.createElement("p");
  cardDiv.appendChild(slot1Div);
  slot1Div.className = "rendered slot1 "+obj["slot1"];

  var slot1textDiv = document.createElement("div");
  cardDiv.appendChild(slot1textDiv);
  slot1textDiv.className = "rendered slot1text text";


  
  var slot2Div = document.createElement("p");
  cardDiv.appendChild(slot2Div);
  slot2Div.className = "rendered slot2 "+obj["slot2"];

  var slot2textDiv = document.createElement("div");
  cardDiv.appendChild(slot2textDiv);
  slot2textDiv.className = "rendered slot2text text";
  
  var cardnumbDiv = document.createElement("div");
  cardDiv.appendChild(cardnumbDiv);
  cardnumbDiv.className = "rendered cardnumb";


}

function givePoints () {

  points[1]++ 
  document.querySelector('#myscore :nth-child('+(5-points[1])+')').checked = true;  
  socket.emit("point",points)
  
}
function damageCounter(event, id) {
  if (boardstate[id] !== undefined) {
    if (event.button ===1 ) {
      damagestate[id]++
  document.querySelector("#"+id+' + input').value  = damagestate[id]; 

    }
  }
}
function play() { 
  renderBoard("main")
  Shuffle()
  startGame()
}
function startGame(){
  for (var i = 1; i < 6; i++) {
    let x = current_deck.pop();
    renderCard(x,"hand"+i)
    boardstate["hand"+i] = x
    socket.emit("push",{ cardnumb: x, location: "hand"+i });

    socket.emit("deck",current_deck.length)

    document.getElementById("my-deck").innerHTML = current_deck.length;
}}
function openBuilder() {
renderBoard("builder")
renderDeck()
renderAll()
}
function renderDeck() {
  current_deck.sort(function (a, b) {
    if (a === Infinity) return 1;
    else if (isNaN(a)) return -1;
    else return a - b;
  })
  document.getElementById("builder-decklist").value = current_deck.toString().replace(/,/g,"\n");
  document.getElementById("deck-count").innerHTML = current_deck.length+"/30";
  document.getElementById("search-box").innerHTML = "";
    for (var i = 0; i < current_deck.length; i++) {
    if (current_deck[i] !== undefined) {

   var obj = (cards[current_deck[i]]); 

  var cardDiv = document.createElement("div");
  document.getElementById("search-box").appendChild(cardDiv);
  cardDiv.className = "rendered minicard card"+current_deck[i]+" "+obj["type"]+" "+obj["color"]+" unit"+obj["soulcost"];
  cardDiv.id = current_deck[i];
  
  cardDiv.oncontextmenu = function () {
    document.getElementById("fullcard_render").style.display = "flex"
    
    fullcardRender(this.id,"fullcard_render");
      return false;
  }
  cardDiv.onclick = function () {
    var index = parseInt(current_deck.indexOf(parseInt(this.id)));
  
    if (index > -1) { // only splice array when item is found
      current_deck.splice(index, 1); // 2nd parameter means remove one item only
    }
   renderDeck()
  }
    
  if (obj["type"] == "unit") {

    var healthDiv = document.createElement("p");
    cardDiv.appendChild(healthDiv);
    healthDiv.className = "rendered health";
   
    var imagebackgroundDiv = document.createElement("div");
    cardDiv.appendChild(imagebackgroundDiv);
    imagebackgroundDiv.className = "rendered imagebackground";
   
    var slot1Div = document.createElement("p");
    cardDiv.appendChild(slot1Div);
    slot1Div.className = "rendered slot1 "+obj["slot1"];
   
    var soulwrapperDiv = document.createElement("div");
    cardDiv.appendChild(soulwrapperDiv);
    soulwrapperDiv.className = "rendered soulwrapper";
   
    for (var i = 0; i < ((obj["soulcost"]).toString()).length; i++) {
      var soulcostDiv = document.createElement("div");
      soulwrapperDiv.appendChild(soulcostDiv);
      soulcostDiv.className = "rendered soulcost"+" "+((obj["soulcost"]).toString())[i];
     }
   
    } else {
   
      var imagebackgroundDiv = document.createElement("div");
      cardDiv.appendChild(imagebackgroundDiv);
      imagebackgroundDiv.className = "rendered imagebackground";
   
      var tagDiv = document.createElement("div");
      cardDiv.appendChild(tagDiv);
      tagDiv.className = "rendered tag";
   
    } }}

}
function renderAll () {
  document.getElementById("search-box-all").innerHTML = "";
  for (var render_card_number = 0; render_card_number < 64; render_card_number++) {
 
 var obj = cards[render_card_number];
 if (obj["type"]==="unit" && document.getElementById("unitCheck").checked == true || 
 obj["type"]==="spell" && document.getElementById("spellCheck").checked || obj["type"]==="aura" && document.getElementById("auraCheck").checked) {
if (obj["color"]==="blue" && document.getElementById("blueCheck").checked || 
  obj["color"]==="green" && document.getElementById("greenCheck").checked || 
  obj["color"]==="purple" && document.getElementById("purpleCheck").checked || 
  obj["color"]==="red" && document.getElementById("redCheck").checked) {

 var cardDiv = document.createElement("div");
 document.getElementById("search-box-all").appendChild(cardDiv);
 cardDiv.className = "rendered minicard card"+render_card_number+" "+obj["type"]+" "+obj["color"]+" unit"+obj["soulcost"];
   cardDiv.id =render_card_number;
   cardDiv.oncontextmenu = function () {
    document.getElementById("fullcard_render").style.display = "flex"
    fullcardRender(this.id,"fullcard_render");
      return false;
  }
   cardDiv.onclick = function () {
   var count = 0;
   for (var i = 0; i < current_deck.length; i++) {
       if (current_deck[i] === parseInt(this.id)) {
           count++;
       }
   }
   if (count < 2 && current_deck.length < 30) {
     current_deck.push(parseInt(this.id));
   } else {
     
   }renderDeck()
  
  }

  if (obj["type"] == "unit") {

    var healthDiv = document.createElement("p");
    cardDiv.appendChild(healthDiv);
    healthDiv.className = "rendered health";
   
    var imagebackgroundDiv = document.createElement("div");
    cardDiv.appendChild(imagebackgroundDiv);
    imagebackgroundDiv.className = "rendered imagebackground";
   
    var slot1Div = document.createElement("p");
    cardDiv.appendChild(slot1Div);
    slot1Div.className = "rendered slot1 "+obj["slot1"];
   
    var soulwrapperDiv = document.createElement("div");
    cardDiv.appendChild(soulwrapperDiv);
    soulwrapperDiv.className = "rendered soulwrapper";
   
    for (var i = 0; i < ((obj["soulcost"]).toString()).length; i++) {
      var soulcostDiv = document.createElement("div");  
      soulwrapperDiv.appendChild(soulcostDiv);
      soulcostDiv.className = "rendered soulcost"+" "+((obj["soulcost"]).toString())[i];
     }
   
    } else {
   
      var imagebackgroundDiv = document.createElement("div");
      cardDiv.appendChild(imagebackgroundDiv);
      imagebackgroundDiv.className = "rendered imagebackground";
   
      var tagDiv = document.createElement("div");
      cardDiv.appendChild(tagDiv);
      tagDiv.className = "rendered tag";
   
    }  }}
  }

}
function getDeck() { // get a custom deck from input string
    var input = document.getElementById("decklist").value;
    current_deck = input.split("\n"); //take input string and turn to list 
    current_deck = current_deck.map(Number);
    Shuffle()
}
function getRandom(){ // gets a random structured deck 
    var zeroSouls = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
    var oneSouls = [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]
    var twoSouls = [36, 37, 38, 39, 40, 41, 42, 43]
    var threeSouls = [44, 45, 46, 47]
    var spells = [48,49,50,51,52,53,54,56,57,58,59]
    var items = [60,61,62,63]

    function checkDupe(cardnumb,deck) {
      let count=0;
      for (var i = 0; i > deck.length; i++)
      if (cardnumb === deck[i]) {
        count++;
      }
      if (count < 2) {
        return false;
      }
    }
    
  
    for (var i = 0; current_deck.length < 30; i++) { 
     if (i < 13) {
      var gen = zeroSouls[Math.floor(Math.random()*zeroSouls.length)];

     } else if (i < 17) {
      var gen = (oneSouls[Math.floor(Math.random()*oneSouls.length)]);

     } else if (i < 20) {
      var gen = (twoSouls[Math.floor(Math.random()*twoSouls.length)]);

     } else if (i < 21) {
      var gen = (threeSouls[Math.floor(Math.random()*threeSouls.length)]);

     } else if (i < 27) {
      var gen = (spells[Math.floor(Math.random()*spells.length)]);
         } else if (i < 30) {
      var gen = items[Math.floor(Math.random()*items.length)];
     }
     if (!checkDupe(gen,current_deck)) {
      current_deck.push(gen)
    } }

 
    
    Shuffle();
}

function Shuffle() { //randomize cards in deck
    for (let i = current_deck.length - 1; i > 0; i--) { //true randomize function
      const newIndex = Math.floor(Math.random() * (i + 1));
      const oldValue = this.current_deck[newIndex];
      this.current_deck[newIndex] = this.current_deck[i];
      this.current_deck[i] = oldValue;
    }
    document.getElementById("my-deck").innerHTML = current_deck.length; //updates display deck count
}

window.onclick = function(event) {
    if (current_card !== undefined) {
    document.getElementById("body").style.cursor = "grabbing";
    } else {
      document.getElementById("body").style.cursor = "grab";
    }
    
    if (event.target !==  document.getElementById("fullcard_render")) {
      document.getElementById("fullcard_render").innerHTML = "";
  
  
    }
    
}
  