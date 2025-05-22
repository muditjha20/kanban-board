using Microsoft.AspNetCore.Mvc;
using KanbanBoardAPI.Data;
using KanbanBoardAPI;
using KanbanBoardAPI.Models.DTOs;


namespace KanbanBoardAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/tasks
        [HttpGet]
        public IActionResult GetTasks()
        {
            var tasks = _context.Tasks.ToList();
            return Ok(tasks);
        }

        // POST: api/tasks
        [HttpPost]
public IActionResult CreateTask([FromBody] TaskCreateDto dto)
{
    if (string.IsNullOrWhiteSpace(dto.Title))
        return BadRequest("Title is required");

    var newTask = new TaskItem
    {
        Title = dto.Title,
        IsDone = dto.IsDone,
        ColumnId = dto.ColumnId
    };

    _context.Tasks.Add(newTask);
    _context.SaveChanges();

    return CreatedAtAction(nameof(GetTasks), new { id = newTask.Id }, newTask);
}


        // PUT: api/tasks/5
        [HttpPut("{id}")]
public IActionResult UpdateTask(int id, [FromBody] TaskCreateDto dto)
{
    Console.WriteLine("➡ PUT hit with:");
    Console.WriteLine($"  Title: {dto.Title}");
    Console.WriteLine($"  IsDone: {dto.IsDone}");
    Console.WriteLine($"  ColumnId: {dto.ColumnId}");

    if (!ModelState.IsValid)
    {
        Console.WriteLine("❌ ModelState is invalid.");
        foreach (var kvp in ModelState)
        {
            foreach (var error in kvp.Value.Errors)
            {
                Console.WriteLine($"  ❌ Error in {kvp.Key}: {error.ErrorMessage}");
            }
        }

        return BadRequest(ModelState);
    }

    var task = _context.Tasks.Find(id);
    if (task == null) return NotFound();

    task.Title = dto.Title;
    task.IsDone = dto.IsDone;
    task.ColumnId = dto.ColumnId;

    _context.SaveChanges();
    Console.WriteLine($"✔ Task {id} updated");
    return NoContent();
}


        // DELETE: api/tasks/5
       [HttpDelete("{id}")]
public IActionResult DeleteTask(int id)
{
    var task = _context.Tasks.Find(id);
    if (task == null)
        return NotFound();

    _context.Tasks.Remove(task);
    _context.SaveChanges();

    return NoContent();
}

    }
}
