import { socket } from "../connect.js";
import { displayGame, displayRoom, masquerElementsParClasse } from "./setting-page.js";

let playersIn = []

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};

const TIME_LIMIT = 40;
let timePassed = 0;
// let timeLeft = TIME_LIMIT;
let timeLeft = null
let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;
let clientAdress = null
let clientPlayer = null
let count = 0
let compteur = 0

document.addEventListener("DOMContentLoaded", () => {

  socket.onmessage = function (event) {
    let dataServer = JSON.parse(event.data)
    let serverData = JSON.parse(event.data);
    console.log("dataServer:", dataServer)
    if (dataServer.type == "goRoom") {
      displayRoom()
      if (dataServer.data.name != "" && !playersIn.includes(dataServer.data.previousPlayers)) {

        playersIn.push(dataServer.data.previousPlayers)
      }
      playersIn = dataServer.data["previousPlayers"]
      clientAdress = dataServer.data.clientAdress
      clientPlayer = dataServer.data.playerJoined
      socket.send(JSON.stringify({
        type: "clientInfo",
        data: {
          playersUpdate: playersIn,
          client: dataServer.data.clientAdress
        }
      }))
      // playersIn = dataServer.data.playersJoined.name

      document.getElementById("chrono").innerHTML = `
      <div class="base-timer">
      <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
      id="base-timer-path-remaining"
      stroke-dasharray="283"
      class="base-timer__path-remaining ${remainingPathColor}"
      d="
      M 50, 50
      m -45, 0
      a 45,45 0 1,0 90,0
      a 45,45 0 1,0 -90,0
      "
      ></path>
      </g>
                  </svg>
                  <span id="base-timer-label" class="base-timer__label">${formatTime(
        timeLeft
      )}</span>
                    </div>
                    `;

    }

    if (dataServer.type == "newPlayersList") {

      if (!playersIn.includes(dataServer.data.lastPlayer)) {
        playersIn.push(dataServer.data.lastPlayer)
      }
    }

    if (dataServer.type == "players") {

      // let playersIn = Object.keys(dataServer.data).length-1
      // console.log("playerIn",playersIn)


      console.log("playersIn", playersIn)

      // startTimer();
      if (dataServer.data.name != "" && !playersIn.includes(dataServer.data.name)) {
        playersIn.push(dataServer.data.name)
      }
    }

    if (dataServer.type == "Chrono") {

      console.log("nombre de player:", dataServer.data.nbPlayers)
      timePassed = dataServer.data.time
      if (dataServer.data.nbPlayers >= 2 && dataServer.data.nbPlayers <= 4) {

        if (count == 0) {

          timerInterval = startTimer(dataServer.data.duration)
          console.log("duration:", dataServer.data.duration)
          socket.send(JSON.stringify({
            type: "timerID",
            data: {
              playerAdress: clientAdress,
              playerName: clientPlayer,
              ID: timerInterval,
            }
          }))
          count++
        }
        // startTimer(40)
      }
      // console.log("time passed:", dataServer.data.time)
      if (dataServer.data.readyGame) {
        // console.log("NB PLAYERS in timesUP :", nbPlayers)
        console.log("READY GAME")
        // timePassed = dataServer.data.time

        clearInterval(dataServer.data.ID)
        console.log("CLEAR ID:", dataServer.data.ID)
        console.log("IN Ready game duration:", dataServer.data.duration)
        startTimerGame(dataServer.data.duration)

      }
      // if (timeLeft === 0) {
      //   clearInterval(timerInterval)
      // }
    }
    if (dataServer.type === "Game") {
      console.log("GO TO GAME")
      masquerElementsParClasse('room')
      displayGame()
    }
      // Vérifiez si le type de données est "newPlayersList"
      if (serverData.type === "newPlayersList") {
        var lastPlayerFromServer = serverData.data.lastPlayer;

        // Ajoutez le pseudonyme au tableau des pseudonymes des joueurs
        playerNames.push(lastPlayerFromServer);

        // Mettez à jour les éléments HTML correspondants avec les pseudonymes
        for (var i = 0; i < playerNames.length; i++) {
          updatePlayerName(i, playerNames[i]);
        }
      }
  }
})


function onTimesUp(timerInterval) {
  setTimeout(() => {
    clearInterval(timerInterval);

  }, 1)
}

function startTimer(timeLimit) {

  timerInterval = setInterval(() => {
    timeLeft = timeLimit - timePassed;
    document.getElementById("base-timer-label").innerHTML = timeLeft;
    setCircleDasharray(timeLimit);
    setRemainingPathColor(timeLeft);

    if (timeLeft === 0) {
      clearInterval(timerInterval)
      displayGame()
    }
    console.log("time Left:", timeLeft)

  }, 1000);

  return timerInterval
}


function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft) {
  const { alert, warning, info } = COLOR_CODES;
  if (timeLeft <= alert.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(info.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(warning.color);
  }
}

function calculateTimeFraction(timeLimit) {
  const rawTimeFraction = timeLeft / timeLimit;
  return rawTimeFraction - (1 / timeLimit) * (1 - rawTimeFraction);
}

function setCircleDasharray(timeLimit) {
  const circleDasharray = `${(
    calculateTimeFraction(timeLimit) * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}

// Fonction pour mettre à jour l'élément HTML avec un pseudonyme en fonction de l'index
function updatePlayerName(index, name) {
  var playerNameElement = document.getElementById("player" + (index + 1));
  if (playerNameElement) {
    playerNameElement.textContent = name;
  }
}

// Tableau pour stocker les pseudonymes des joueurs
var playerNames = [];
