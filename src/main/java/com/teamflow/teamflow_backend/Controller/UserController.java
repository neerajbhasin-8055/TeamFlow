package com.teamflow.teamflow_backend.Controller;

import com.teamflow.teamflow_backend.DTO.User.CreateUserRequest;
import com.teamflow.teamflow_backend.DTO.User.UpdateUserRequest;
import com.teamflow.teamflow_backend.DTO.User.UserResponse;
import com.teamflow.teamflow_backend.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    // 1. CREATE
    @PostMapping("create")
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request) {

        UserResponse savedUser =
                userService.createUser(request);

        return new ResponseEntity<>(
                savedUser,
                HttpStatus.CREATED
        );
    }


    // 2. READ ALL
    @GetMapping("allusers")
    public ResponseEntity<List<UserResponse>> getUsers() {

        List<UserResponse> users =
                userService.findAllUser();

        return new ResponseEntity<>(
                users,
                HttpStatus.OK
        );
    }


    // 3. READ BY ID
    @GetMapping("id/{id}")
    public ResponseEntity<UserResponse> findById(
            @PathVariable String id) {

        UserResponse user =
                userService.findById(id);

        if (user != null) {
            return new ResponseEntity<>(
                    user,
                    HttpStatus.OK
            );
        }

        return new ResponseEntity<>(
                HttpStatus.NOT_FOUND
        );
    }


    // 4. UPDATE
    @PutMapping("update/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserRequest request) {

        UserResponse updatedUser =
                userService.updateUser(id, request);

        if (updatedUser != null) {
            return new ResponseEntity<>(
                    updatedUser,
                    HttpStatus.OK
            );
        }

        return new ResponseEntity<>(
                HttpStatus.NOT_FOUND
        );
    }


    // 5. DELETE
    @DeleteMapping("delete/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable String id) {

        UserResponse existingUser =
                userService.findById(id);

        if (existingUser != null) {

            userService.deleteUser(id);

            return new ResponseEntity<>(
                    HttpStatus.NO_CONTENT
            );
        }

        return new ResponseEntity<>(
                HttpStatus.NOT_FOUND
        );
    }
}