import * as signalR from "@microsoft/signalr";

export const connection = new signalR.HubConnectionBuilder()
  .withUrl("https://kanban-backend-2vbh.onrender.com/taskhub") 
  .withAutomaticReconnect()
  .build();
