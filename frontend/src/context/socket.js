import socketio from "socket.io-client";
import React from "react";

export const socket = socketio("https://pixelcide.herokuapp.com/", {
  withCredentials: false,
}).disconnect();
export const SocketContext = React.createContext();
