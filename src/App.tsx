import React, { useState, useEffect, JSX } from "react";
import "./styles.css";
import "./index.css";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import TodoList from "./Components/TodoList";
import InputField from "./Components/InputField";
import { BoardData } from "./types";
import axios from "axios";

// Firebase auth
import { AuthProvider, useAuth } from "./AuthContext";
import { getIdToken } from "./firebase";
import Login from "./Login";
import Signup from "./Signup";

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

const KanbanBoard: React.FC = () => {
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const tempId = Date.now().toString();
    const newTask = {
      id: tempId,
      title: taskTitle,
      isDone: false,
    };

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

    setTaskTitle("");

    const payload = {
      title: taskTitle,
      isDone: false,
      columnId: 1,
      description: "",
      tags: "",
      dueDate: null,
    };

    try {
      const token = await getIdToken();

      const res = await axios.post(
        "https://kanban-backend-2vbh.onrender.com/api/tasks",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const realTask = res.data;
      const realId = String(realTask.id);

      setBoardData((prev) => {
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
    } catch (err) {
      console.error("Error adding task", err);
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
    }
  };

  const onDragEnd = async (result: DropResult) => {
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

    try {
      const token = await getIdToken();
      await axios.put(
        `https://kanban-backend-2vbh.onrender.com/api/tasks/${draggableId}`,
        updatedTask,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Failed to update task column", err);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = await getIdToken();
        const res = await axios.get(
          "https://kanban-backend-2vbh.onrender.com/api/tasks",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
      } catch (err) {
        console.error("Error fetching tasks", err);
      }
    };

    fetchTasks();
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

// Main app with routing
const RootApp: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <KanbanBoard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default RootApp;
