<<<<<<< HEAD
import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("token")
  }
=======
import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("token")
  }
>>>>>>> def9ccd (Poprawki)
});