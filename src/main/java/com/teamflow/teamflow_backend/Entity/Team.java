package com.teamflow.teamflow_backend.Entity;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Document(collection = "teams" )
public class Team {
    private String id;
    @NotBlank(message = "Name should not be blank")
    private String name;
    private String description;
    private String createdBy;
    private List<String> memberIds;
    private List<String> projectIds;
    private Date createdAt;
    private Date updatedAt;
}
