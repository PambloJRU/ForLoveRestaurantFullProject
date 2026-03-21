using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class AnnouncementsController : ControllerBase
{
    private static List<Announcement> _announcements = new List<Announcement>();
    private static int _nextId = 1;

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_announcements.OrderByDescending(a => a.CreatedAt));
    }

    [HttpPost]
    public IActionResult Create(Announcement model)
    {
        model.Id = _nextId++;
        model.CreatedAt = DateTime.Now;

        _announcements.Add(model);
        return Ok(model);
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, Announcement model)
    {
        var existing = _announcements.FirstOrDefault(a => a.Id == id);
        if (existing == null) return NotFound();

        existing.Title = model.Title;
        existing.Content = model.Content;

        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var existing = _announcements.FirstOrDefault(a => a.Id == id);
        if (existing == null) return NotFound();

        _announcements.Remove(existing);
        return Ok();
    }
}