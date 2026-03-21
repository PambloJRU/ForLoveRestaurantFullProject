 using System;
using System.ComponentModel.DataAnnotations;

public class Announcement
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Title { get; set; }

    [Required]
    public string Content { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
}