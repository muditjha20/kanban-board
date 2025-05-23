import React, { useState, useEffect } from "react";
import "./styles.css";
import "./index.css";
import "./App.css";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import TodoList from "./Components/TodoList";
import InputField from "./Components/InputField";
import { BoardData } from "./types";
import axios from "axios";

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

    const task = { title: taskTitle, isDone: false, columnId: 1 };

    axios.post("https://kanban-backend-2vbh.onrender.com/api/tasks", task)
      .then(res => {
        const added = res.data;
        const newId = String(added.id);

        setBoardData(prev => ({
          ...prev,
          tasks: {
            ...prev.tasks,
            [newId]: { id: newId, title: added.title, isDone: false },
          },
          columns: {
            ...prev.columns,
            "column-1": {
              ...prev.columns["column-1"],
              taskIds: [newId, ...prev.columns["column-1"].taskIds],
            },
          },
        }));

        setTaskTitle("");
      })
      .catch(err => console.error("Error adding task", err));
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === "column-3" || destination.droppableId === "column-3") {
      return;
    }

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

    axios.put(`https://kanban-backend-2vbh.onrender.com/api/tasks/${draggableId}`, updatedTask)
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

        setBoardData({ tasks: taskMap, columns: colMap, columnOrder: ["column-1", "column-2", "column-3"] });
      })
      .catch(err => console.error("Error fetching tasks", err));
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
