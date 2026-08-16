package com.teamflow.teamflow_backend.Entity;


import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "users")
@Data
public class User {
    @Id
    private Integer id ;
    private String name;
    private String email;
    private String password;
    private String role;
    private Date createdAt;
}
