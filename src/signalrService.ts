// signalrService.ts
import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
  .withUrl("https://kanban-backend-2vbh.onrender.com/taskhub")
  .withAutomaticReconnect()
  .build();

export default connection;
