export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface Task {
  id: string;
  title: string;
  isDone: boolean;
}

export interface BoardData {
  tasks: { [taskId: string]: Task };
  columns: { [columnId: string]: Column }; // ✅ This line is important
  columnOrder: string[];
}
