package com.teamflow.teamflow_backend.Controller;

import com.teamflow.teamflow_backend.DTO.User.CreateUserRequest;
import com.teamflow.teamflow_backend.DTO.User.UpdateUserRequest;
import com.teamflow.teamflow_backend.DTO.User.UserResponse;
import com.teamflow.teamflow_backend.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.teamflow.teamflow_backend.Security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // CREATE
    @PostMapping("create")
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request) {

        UserResponse savedUser = userService.createUser(request);

        return new ResponseEntity<>(
                savedUser,
                HttpStatus.CREATED
        );
    }

    // READ ALL
    @GetMapping("allusers")
    public ResponseEntity<List<UserResponse>> getUsers() {

        List<UserResponse> users = userService.findAllUser();

        return new ResponseEntity<>(
                users,
                HttpStatus.OK
        );
    }

    // READ BY ID
    @GetMapping("id/{id}")
    public ResponseEntity<UserResponse> findById(
            @PathVariable String id) {

        UserResponse user = userService.findById(id);

        return new ResponseEntity<>(
                user,
                HttpStatus.OK
        );
    }

    // UPDATE
    @PutMapping("update/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserRequest request) {

        UserResponse updatedUser =
                userService.updateUser(id, request);

        return new ResponseEntity<>(
                updatedUser,
                HttpStatus.OK
        );
    }

    // DELETE
    @DeleteMapping("delete/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable String id) {

        userService.deleteUser(id);

        return new ResponseEntity<>(
                HttpStatus.NO_CONTENT
        );
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            Authentication authentication) {

        CustomUserDetails currentUser =
                (CustomUserDetails) authentication.getPrincipal();

        UserResponse user =
                userService.getCurrentUser(currentUser.getUsername());

        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest request) {
        CustomUserDetails currentUser =
                (CustomUserDetails) authentication.getPrincipal();

        UserResponse updatedUser =
                userService.updateCurrentUser(
                        currentUser.getUsername(), request);

        return ResponseEntity.ok(updatedUser);
    }

}