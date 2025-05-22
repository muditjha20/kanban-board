using Microsoft.EntityFrameworkCore;
using KanbanBoardAPI;


namespace KanbanBoardAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<Column> Columns { get; set; }
    }
}
