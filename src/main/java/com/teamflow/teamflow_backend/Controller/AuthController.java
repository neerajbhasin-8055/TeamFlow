package com.teamflow.teamflow_backend.Controller;

import com.teamflow.teamflow_backend.DTO.LoginRequest;
import com.teamflow.teamflow_backend.DTO.User.CreateUserRequest;
import com.teamflow.teamflow_backend.DTO.User.UserResponse;

import com.teamflow.teamflow_backend.Service.AuthService;
import com.teamflow.teamflow_backend.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request){
        String token = authService.login(request);
        return new ResponseEntity<>(token, HttpStatus.OK);
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody CreateUserRequest request){
        UserResponse user = userService.createUser(request);
        return new ResponseEntity<>(user,HttpStatus.CREATED);
    }


}
