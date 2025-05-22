import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { BoardData, Task, Column } from "../types";
import SingleTodo from "./SingleTodo";
import AddColumn from "./AddColumn";

interface Props {
  boardData: BoardData;
  setBoardData: React.Dispatch<React.SetStateAction<BoardData>>;
}

const TodoList: React.FC<Props> = ({ boardData, setBoardData }) => {
  return (
    <div className="container">
      {boardData.columnOrder.map((columnId) => {
        const column = boardData.columns[columnId];
        const tasks = column.taskIds.map((taskId) => boardData.tasks[taskId]);

        return (
          <Droppable droppableId={column.id} key={column.id}>
            {(provided, snapshot) => {
              let dragClass = "";
              if (snapshot.isDraggingOver) {
                if (column.title.includes("Active")) dragClass = "dragactive";
                else if (column.title.includes("Progress")) dragClass = "draginprogress";
                else if (column.title.includes("Completed")) dragClass = "dragcomplete";
              } else if (column.title.includes("Completed")) {
                dragClass = "remove";
              }

              return (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`todos ${dragClass}`}
                >
                  <span className="todos__heading">{column.title}</span>
                  {tasks.map((task, index) => (
                    <SingleTodo
                      key={task.id}
                      task={task}
                      index={index}
                      columnId={column.id}
                      boardData={boardData}
                      setBoardData={setBoardData}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              );
            }}
          </Droppable>
        );
      })}
      {/* <AddColumn boardData={boardData} setBoardData={setBoardData} /> */}
    </div>
  );
};

export default TodoList;
