package com.teamflow.teamflow_backend.DTO.Task;

import lombok.Data;

import java.util.Date;

@Data
public class TaskResponse {
    private String id;
    private String title;
    private String description;
    private String projectId;
    private String assignedTo;
    private String createdBy;
    private String status;
    private String priority;
    private String deadline;
    private Date createdAt;
    private Date updatedAt;
}
