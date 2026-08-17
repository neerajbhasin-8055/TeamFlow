package com.teamflow.teamflow_backend.Entity;


import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "projects")
@Data
public class Project {
    @Id
    private Integer id;
    private String name;
    private String description;
    private String status;
    private Date startDate;
    private Date deadline;
    private Date createdAt;
    private Date updatedAt;
    private Integer managerId;
    private Integer teamId;

}
