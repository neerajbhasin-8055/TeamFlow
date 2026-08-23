package com.teamflow.teamflow_backend.Service;

import com.teamflow.teamflow_backend.DTO.User.CreateUserRequest;
import com.teamflow.teamflow_backend.DTO.User.UpdateUserRequest;
import com.teamflow.teamflow_backend.DTO.User.UserResponse;
import com.teamflow.teamflow_backend.Entity.User;
import com.teamflow.teamflow_backend.Exception.ResourceNotFoundException;
import com.teamflow.teamflow_backend.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // CREATE
    public UserResponse createUser(CreateUserRequest request) {

        // DTO -> Entity
        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        // Backend-generated fields
        user.setRole("USER");
        user.setCreatedAt(new Date());

        // Save Entity
        User savedUser = userRepository.save(user);

        // Entity -> DTO
        return convertToResponse(savedUser);
    }


    // READ ALL
    public List<UserResponse> findAllUser() {

        return userRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // READ BY ID
    public UserResponse findById(String id) {

        User user = userRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("User Not found"));

        return convertToResponse(user);
    }


    // UPDATE
    public UserResponse updateUser(
            String id,
            UpdateUserRequest request) {

        User existingUser =
                userRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("User Not found"));


        // DTO -> Existing Entity
        existingUser.setName(request.getName());
        existingUser.setEmail(request.getEmail());

        User updatedUser =
                userRepository.save(existingUser);

        // Entity -> DTO
        return convertToResponse(updatedUser);
    }


    // DELETE
    public void deleteUser(String id) {

        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }

        userRepository.deleteById(id);
    }

    // ENTITY -> RESPONSE DTO
    private UserResponse convertToResponse(User user) {

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());

        return response;
    }
}