package com.teamflow.teamflow_backend.DTO.Task;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateTaskRequest {
    @NotBlank(message = "Task title cannot be empty")
    private String title;
    @NotBlank(message = "Task description cannot be empty")
    private String description;
    @NotBlank(message = "deadline cannot be empty")
    private String deadline;
    @NotBlank(message = "set the priority")
    private String priority;
    @NotBlank(message = "select the user who has been assigned to this task")
    private String assignedTo;
    @NotBlank(message = "Task must be associated with some project,select project")
    private String projectId;
    @NotBlank(message = "Mark the progress")
    private String status;
}
