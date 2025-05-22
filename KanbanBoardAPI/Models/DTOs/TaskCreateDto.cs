namespace KanbanBoardAPI.Models.DTOs
{
    public class TaskCreateDto
{
    public string Title { get; set; } = string.Empty;
    public bool IsDone { get; set; }
    public int ColumnId { get; set; }
}

}
