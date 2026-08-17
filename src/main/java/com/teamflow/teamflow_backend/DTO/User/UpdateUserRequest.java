package com.teamflow.teamflow_backend.DTO.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @NotBlank(message = "Name cannot be Empty")
    private String name;
    @NotBlank @Email(message = "Provide a valid email")
    private String email;
}