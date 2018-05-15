import * as Colyseus from "colyseus.js";

let client = new Colyseus.Client("ws://localhost:3000");

let mainRoom = client.join('Main');