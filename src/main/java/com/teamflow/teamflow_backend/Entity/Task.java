package com.teamflow.teamflow_backend.Entity;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "tasks")
@Data
public class Task {
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
