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

    setBoardData({
      ...boardData,
      tasks: {
        ...boardData.tasks,
        [task.id]: updatedTask,
      },
    });

    setEdit(false);
  };

  const handleDelete = () => {
    axios
      .delete(`http://localhost:5039/api/tasks/${task.id}`)
      .then(() => {
        const newTasks = { ...boardData.tasks };
        delete newTasks[task.id];

        const newTaskIds = boardData.columns[columnId].taskIds.filter(
          (id) => id !== task.id
        );
        const newColumn = {
          ...boardData.columns[columnId],
          taskIds: newTaskIds,
        };

        setBoardData({
          ...boardData,
          tasks: newTasks,
          columns: { ...boardData.columns, [columnId]: newColumn },
        });
      })
      .catch((err) => {
        console.error("Failed to delete task", err);
      });
  };

  const handleDone = (id: string) => {
    const updatedTask = {
      title: boardData.tasks[id].title,
      isDone: true,
      columnId: 3,
    };

    axios
      .put(`http://localhost:5039/api/tasks/${id}`, updatedTask)
      .then(() => {
        setBoardData((prev) => {
          const newTasks = { ...prev.tasks };
          newTasks[id].isDone = true;

          const newColumns = { ...prev.columns };
          for (const colKey of Object.keys(newColumns)) {
            newColumns[colKey].taskIds = newColumns[colKey].taskIds.filter(
              (taskId) => taskId !== id
            );
          }

          newColumns["column-3"].taskIds.unshift(id);

          return {
            ...prev,
            tasks: newTasks,
            columns: newColumns,
          };
        });
      })
      .catch((err) => {
        console.error("Failed to mark task as done", err);
      });
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
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="todos__single--text"
              ref={inputRef}
            />
          ) : task.isDone ? (
            <s className="todos__single--text">{task.title}</s>
          ) : (
            <span className="todos__single--text">{task.title}</span>
          )}

          <div>
            {!task.isDone && (
              <span className="icon" onClick={() => !edit && setEdit(true)}>
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
