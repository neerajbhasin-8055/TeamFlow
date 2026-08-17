package com.teamflow.teamflow_backend.DTO.Project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Date;

@Data
public class UpdateProjectRequest {

    @NotBlank(message = "Project name cannot be empty")
    @Size(min = 3, max = 100, message = "Project name must be between 3 and 100 characters")
    private String name;

    @NotBlank(message = "Project description cannot be empty")
    @Size(min = 10, max = 500, message = "Project description must be between 10 and 500 characters")
    private String description;

    @NotBlank(message = "Project status cannot be empty")
    private String status;

    @NotNull(message = "Start date is required")
    private Date startDate;

    @NotNull(message = "Deadline is required")
    private Date deadline;

    @NotNull(message = "Manager ID is required")
    private String managerId;

    @NotNull(message = "Team ID is required")
    private String teamId;
}