package com.teamflow.teamflow_backend.DTO.Team;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class TeamResponse {
    private String id;
    private String name;
    private String description;
    private String createdBy;
    private List<String> memberIds;
    private List<String> projectIds;
    private Date createdAt;
    private Date updatedAt;
}
