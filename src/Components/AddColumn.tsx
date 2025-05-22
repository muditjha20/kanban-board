import React, { useState } from "react";
import { BoardData, Column } from "../types";
import { v4 as uuidv4 } from "uuid";

interface Props {
  boardData: BoardData;
  setBoardData: React.Dispatch<React.SetStateAction<BoardData>>;
}

const AddColumn: React.FC<Props> = ({ boardData, setBoardData }) => {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newColId = uuidv4();
    const newColumn: Column = {
      id: newColId,
      title,
      taskIds: [],
    };

    const updatedBoard = {
      ...boardData,
      columns: {
        ...boardData.columns,
        [newColId]: newColumn,
      },
      columnOrder: [...boardData.columnOrder, newColId],
    };

    setBoardData(updatedBoard);
    setTitle("");
    setAdding(false);
  };

  return (
    <div className="todos add-column">
      {adding ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Column Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input__box"
          />
          <button type="submit" className="input_submit">Add</button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            background: "white",
            padding: "15px",
            borderRadius: "5px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          ➕ Add Column
        </button>
      )}
    </div>
  );
};

export default AddColumn;
