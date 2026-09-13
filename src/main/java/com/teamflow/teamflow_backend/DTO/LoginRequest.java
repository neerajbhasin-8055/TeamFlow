package com.teamflow.teamflow_backend.DTO;


import lombok.Data;

@Data
public class LoginRequest {
    public String email;
    public String password;
}

