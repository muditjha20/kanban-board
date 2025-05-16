import React, { useState } from "react";
import "./App.css";
import InputField from "./Components/InputField";
import TodoList from "./Components/TodoList";
import {
  DragDropContext,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";

import { Todo } from "./model";

const App: React.FC = () => {
  const [todo, setTodo] = useState<string>("");
  const [todos, setTodos] = useState<Array<Todo>>([]);
  const [CompletedTodos, setCompletedTodos] = useState<Array<Todo>>([]);
  const [inProgressTodos, setInProgressTodos] = useState<Array<Todo>>([]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (todo) {
      setTodos([...todos, { id: Date.now(), todo, isDone: false }]);
      setTodo("");
    }
  };

  const onDragEnd = (result: DropResult) => {
  const { source, destination } = result;
  if (!destination) return;
  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) {
    return;
  }

  let add;
  const active = [...todos];
  const inProgress = [...inProgressTodos];
  const complete = [...CompletedTodos];

  // Remove from source
  if (source.droppableId === "TodosList") {
    add = active[source.index];
    active.splice(source.index, 1);
  } else if (source.droppableId === "InProgressList") {
    add = inProgress[source.index];
    inProgress.splice(source.index, 1);
  } else {
    add = complete[source.index];
    complete.splice(source.index, 1);
  }

  // Add to destination
  if (destination.droppableId === "TodosList") {
    active.splice(destination.index, 0, add);
  } else if (destination.droppableId === "InProgressList") {
    inProgress.splice(destination.index, 0, add);
  } else {
    complete.splice(destination.index, 0, add);
  }

  setTodos(active);
  setInProgressTodos(inProgress);
  setCompletedTodos(complete);
};


  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="App">
        <span className="heading">Taskify</span>
        <InputField todo={todo} setTodo={setTodo} handleAdd={handleAdd} />
        <TodoList
  todos={todos}
  setTodos={setTodos}
  inProgressTodos={inProgressTodos}
  setInProgressTodos={setInProgressTodos}
  CompletedTodos={CompletedTodos}
  setCompletedTodos={setCompletedTodos}
/>

      </div>
    </DragDropContext>
  );
};

export default App;