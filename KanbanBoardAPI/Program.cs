using KanbanBoardAPI.Data;
using KanbanBoardAPI.Models; 
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

//  Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

var app = builder.Build();

// SEED DATABASE BEFORE app.Run()
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    if (!db.Columns.Any())
    {
        db.Columns.AddRange(
    new Column { Title = "Active Tasks" },
    new Column { Title = "In Progress" },
    new Column { Title = "Completed Tasks" }
);

        db.SaveChanges();
    }
}

// Middleware and pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(x => x
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var tasks = db.Tasks.ToList();
    Console.WriteLine("==== TASKS ====");
    foreach (var t in tasks)
    {
        Console.WriteLine($"ID: {t.Id}, Title: {t.Title}, ColumnId: {t.ColumnId}");
    }
}

app.Run(); 