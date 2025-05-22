public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Tags { get; set; }

    public DateTime? DueDate { get; set; }

    public bool IsDone { get; set; }

    public int ColumnId { get; set; }

    public Column Column { get; set; } = null!;
}
