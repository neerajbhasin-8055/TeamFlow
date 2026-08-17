package com.teamflow.teamflow_backend.DTO.Project;

import lombok.Data;

import java.util.Date;

@Data
public class ProjectResponse {

    private String id;
    private String name;
    private String description;
    private String status;
    private Date startDate;
    private Date deadline;
    private Date createdAt;
    private Date updatedAt;
    private String managerId;
    private String teamId;
}