import React, { useState, useRef, useEffect } from "react";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { MdDone } from "react-icons/md";
import { Draggable } from "@hello-pangea/dnd";
import { Task, BoardData } from "../types";
import axios from "axios";

interface Props {
  task: Task;
  index: number;
  columnId: string;
  boardData: BoardData;
  setBoardData: React.Dispatch<React.SetStateAction<BoardData>>;
}

const SingleTodo: React.FC<Props> = ({
  task,
  index,
  columnId,
  boardData,
  setBoardData,
}) => {
  const [edit, setEdit] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (edit) inputRef.current?.focus();
  }, [edit]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTask = { ...task, title: editValue };

    setBoardData((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [task.id]: updatedTask,
      },
    }));

    setEdit(false);

    axios.put(`https://kanban-backend-2vbh.onrender.com/api/tasks/${task.id}`, {
      title: editValue,
      isDone: task.isDone,
      columnId: Number(columnId.split("-")[1]),
    }).catch((err) => {
      console.error("Failed to update task title", err);
    });
  };

  const handleDelete = () => {
    axios
      .delete(`https://kanban-backend-2vbh.onrender.com/api/tasks/${task.id}`)
      .then(() => {
        const newTasks = { ...boardData.tasks };
        delete newTasks[task.id];

        const newTaskIds = boardData.columns[columnId].taskIds.filter(
          (id) => id !== task.id
        );

        setBoardData((prev) => ({
          ...prev,
          tasks: newTasks,
          columns: {
            ...prev.columns,
            [columnId]: {
              ...prev.columns[columnId],
              taskIds: newTaskIds,
            },
          },
        }));
      })
      .catch((err) => console.error("Failed to delete task", err));
  };

  const handleDone = (id: string) => {
    //  update frontend first
    setBoardData((prev) => {
      const updatedTasks = { ...prev.tasks };
      updatedTasks[id].isDone = true;

      const newColumns = { ...prev.columns };
      for (const colKey of Object.keys(newColumns)) {
        newColumns[colKey].taskIds = newColumns[colKey].taskIds.filter(
          (taskId) => taskId !== id
        );
      }

      newColumns["column-3"].taskIds.unshift(id);

      return {
        ...prev,
        tasks: updatedTasks,
        columns: newColumns,
      };
    });

    // Sync with backend
    axios
      .put(`https://kanban-backend-2vbh.onrender.com/api/tasks/${id}`, {
        title: boardData.tasks[id].title,
        isDone: true,
        columnId: 3,
      })
      .catch((err) => console.error("Failed to mark task as done", err));
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <form
          className="todos__single"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onSubmit={handleEditSubmit}
        >
          {edit ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="todos__single--text"
            />
          ) : task.isDone ? (
            <s className="todos__single--text">{task.title}</s>
          ) : (
            <span className="todos__single--text">{task.title}</span>
          )}

          <div>
            {!task.isDone && (
              <span className="icon" onClick={() => setEdit(true)}>
                <AiFillEdit />
              </span>
            )}
            <span className="icon" onClick={handleDelete}>
              <AiFillDelete />
            </span>
            {!task.isDone && (
              <span className="icon" onClick={() => handleDone(task.id)}>
                <MdDone />
              </span>
            )}
          </div>
        </form>
      )}
    </Draggable>
  );
};

export default SingleTodo;
