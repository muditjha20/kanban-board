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

  const tempId = Date.now().toString(); // temporary local ID

  const newTask = {
    id: tempId,
    title: taskTitle,
    isDone: false,
  };

  // Optimistically update UI
  setBoardData((prev) => ({
    ...prev,
    tasks: {
      ...prev.tasks,
      [tempId]: newTask,
    },
    columns: {
      ...prev.columns,
      "column-1": {
        ...prev.columns["column-1"],
        taskIds: [tempId, ...prev.columns["column-1"].taskIds],
      },
    },
  }));

  setTaskTitle(""); // Clear input immediately

  // Then post to backend
  const payload = {
    title: taskTitle,
    isDone: false,
    columnId: 1,
    description: "",
    tags: "",
    dueDate: null,
  };

  axios
    .post("https://kanban-backend-2vbh.onrender.com/api/tasks", payload)
    .then((res) => {
      const realTask = res.data;
      const realId = String(realTask.id);

      setBoardData((prev) => {
        // Remove temp task, replace with real one
        const { [tempId]: _, ...remainingTasks } = prev.tasks;

        return {
          ...prev,
          tasks: {
            ...remainingTasks,
            [realId]: {
              id: realId,
              title: realTask.title,
              isDone: false,
            },
          },
          columns: {
            ...prev.columns,
            "column-1": {
              ...prev.columns["column-1"],
              taskIds: [realId, ...prev.columns["column-1"].taskIds.filter((id) => id !== tempId)],
            },
          },
        };
      });
    })
    .catch((err) => {
      console.error("Error adding task", err);

      // Rollback UI change on error
      setBoardData((prev) => {
        const { [tempId]: _, ...remainingTasks } = prev.tasks;
        return {
          ...prev,
          tasks: remainingTasks,
          columns: {
            ...prev.columns,
            "column-1": {
              ...prev.columns["column-1"],
              taskIds: prev.columns["column-1"].taskIds.filter((id) => id !== tempId),
            },
          },
        };
      });
    });
};


  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (
      source.droppableId === "column-3" ||
      destination.droppableId === "column-3"
    )
      return;

    const sourceCol = boardData.columns[source.droppableId];
    const destCol = boardData.columns[destination.droppableId];

    if (sourceCol === destCol) {
      const reordered = [...sourceCol.taskIds];
      reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, draggableId);

      setBoardData((prev) => ({
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

      setBoardData((prev) => ({
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
      .put(
        `https://kanban-backend-2vbh.onrender.com/api/tasks/${draggableId}`,
        updatedTask
      )
      .catch((err) => console.error("Failed to update task column", err));
  };

  useEffect(() => {
    axios
      .get("https://kanban-backend-2vbh.onrender.com/api/tasks")
      .then((res) => {
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
      .catch((err) => console.error("Error fetching tasks", err));
  }, []);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="App">
        <span className="heading">Kanban Board</span>
        <InputField
          todo={taskTitle}
          setTodo={setTaskTitle}
          handleAdd={handleAdd}
        />
        <TodoList boardData={boardData} setBoardData={setBoardData} />
      </div>
    </DragDropContext>
  );
};

export default App;
