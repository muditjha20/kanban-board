import React, { useState, useEffect } from "react";
import "./styles.css";
import "./index.css";
import "./App.css";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import TodoList from "./Components/TodoList";
import InputField from "./Components/InputField";
import { BoardData } from "./types";
import axios from "axios";
import { connection } from "./signalr";

const App: React.FC = () => {
  const [taskTitle, setTaskTitle] = useState<string>("");

  const [boardData, setBoardData] = useState<BoardData>({
    tasks: {},
    columns: {
      "column-1": { id: "column-1", title: "Active Tasks", taskIds: [] },
      "column-2": { id: "column-2", title: "In Progress", taskIds: [] },
      "column-3": { id: "column-3", title: "Completed Tasks", taskIds: [] },
    },
    columnOrder: ["column-1", "column-2", "column-3"],
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const task = {
      title: taskTitle,
      isDone: false,
      columnId: 1,
      description: "",
      tags: "",
      dueDate: null,
    };

    axios
      .post("https://kanban-backend-2vbh.onrender.com/api/tasks", task)
      .then(() => setTaskTitle(""))
      .catch((err) => console.error("Error adding task", err));
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === "column-3" || destination.droppableId === "column-3") return;

    const sourceCol = boardData.columns[source.droppableId];
    const destCol = boardData.columns[destination.droppableId];

    if (sourceCol === destCol) {
      const reordered = [...sourceCol.taskIds];
      reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, draggableId);

      setBoardData(prev => ({
        ...prev,
        columns: {
          ...prev.columns,
          [sourceCol.id]: { ...sourceCol, taskIds: reordered },
        },
      }));
    } else {
      const from = [...sourceCol.taskIds];
      from.splice(source.index, 1);

      const to = [...destCol.taskIds];
      to.splice(destination.index, 0, draggableId);

      setBoardData(prev => ({
        ...prev,
        columns: {
          ...prev.columns,
          [sourceCol.id]: { ...sourceCol, taskIds: from },
          [destCol.id]: { ...destCol, taskIds: to },
        },
      }));
    }

    const updatedTask = {
      title: boardData.tasks[draggableId].title,
      isDone: boardData.tasks[draggableId].isDone,
      columnId: Number(destCol.id.split("-")[1]),
    };

    axios
      .put(`https://kanban-backend-2vbh.onrender.com/api/tasks/${draggableId}`, updatedTask)
      .catch(err => console.error("Failed to update task column", err));
  };

  useEffect(() => {
    axios.get("https://kanban-backend-2vbh.onrender.com/api/tasks")
      .then(res => {
        const tasks = res.data;
        const taskMap: BoardData["tasks"] = {};
        const colMap: BoardData["columns"] = {
          "column-1": { id: "column-1", title: "Active Tasks", taskIds: [] },
          "column-2": { id: "column-2", title: "In Progress", taskIds: [] },
          "column-3": { id: "column-3", title: "Completed Tasks", taskIds: [] },
        };

        for (const task of tasks) {
          const id = String(task.id);
          const colKey = `column-${task.columnId}`;
          taskMap[id] = { id, title: task.title, isDone: task.isDone };
          colMap[colKey]?.taskIds.push(id);
        }

        setBoardData({
          tasks: taskMap,
          columns: colMap,
          columnOrder: ["column-1", "column-2", "column-3"],
        });
      })
      .catch(err => console.error("Error fetching tasks", err));
  }, []);

  useEffect(() => {
    connection
      .start()
      .then(() => {
        console.log("SignalR Connected");

        connection.on("TaskCreated", (newTask) => {
          const id = String(newTask.id);
          setBoardData(prev => {
            const colKey = `column-${newTask.columnId}`;
            return {
              ...prev,
              tasks: {
                ...prev.tasks,
                [id]: { id, title: newTask.title, isDone: newTask.isDone },
              },
              columns: {
                ...prev.columns,
                [colKey]: {
                  ...prev.columns[colKey],
                  taskIds: [id, ...prev.columns[colKey].taskIds],
                },
              },
            };
          });
        });

        connection.on("TaskUpdated", (updatedTask) => {
          const id = String(updatedTask.id);
          setBoardData(prev => {
            const newTasks = { ...prev.tasks, [id]: updatedTask };
            const newColumns = { ...prev.columns };
            for (const colId of Object.keys(newColumns)) {
              newColumns[colId].taskIds = newColumns[colId].taskIds.filter(tid => tid !== id);
            }
            const colKey = `column-${updatedTask.columnId}`;
            if (newColumns[colKey]) newColumns[colKey].taskIds.unshift(id);

            return {
              ...prev,
              tasks: newTasks,
              columns: newColumns,
            };
          });
        });
      })
      .catch(err => console.error("SignalR connection error", err));

    return () => {
      connection.off("TaskCreated");
      connection.off("TaskUpdated");
      connection.stop();
    };
  }, []);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="App">
        <span className="heading">TASKIFY</span>
        <InputField todo={taskTitle} setTodo={setTaskTitle} handleAdd={handleAdd} />
        <TodoList boardData={boardData} setBoardData={setBoardData} />
      </div>
    </DragDropContext>
  );
};

export default App;
