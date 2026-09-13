package com.teamflow.teamflow_backend.Controller;

import com.teamflow.teamflow_backend.DTO.LoginRequest;
import com.teamflow.teamflow_backend.Service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    @PostMapping("login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request){
        authService.login(request);
        return ResponseEntity.ok("Login Success");
    }
}
