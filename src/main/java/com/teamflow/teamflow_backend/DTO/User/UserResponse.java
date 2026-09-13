package com.teamflow.teamflow_backend.DTO.User;

import com.teamflow.teamflow_backend.ENUM.Role;
import lombok.Data;

import java.util.Date;

@Data
public class UserResponse {

    private String id;
    private String name;
    private String email;
    private Role role;
    private Date createdAt;
}