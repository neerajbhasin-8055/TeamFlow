package com.teamflow.teamflow_backend.Service;


import com.teamflow.teamflow_backend.DTO.User.CreateUserRequest;
import com.teamflow.teamflow_backend.DTO.User.UpdateUserRequest;
import com.teamflow.teamflow_backend.DTO.User.UserResponse;
import com.teamflow.teamflow_backend.ENUM.Role;
import com.teamflow.teamflow_backend.Entity.User;
import com.teamflow.teamflow_backend.Exception.DuplicateResourceException;
import com.teamflow.teamflow_backend.Exception.ResourceNotFoundException;
import com.teamflow.teamflow_backend.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // CREATE
    public UserResponse createUser(CreateUserRequest request) {

        // DTO -> Entity
        User user = new User();

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered");
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Backend-generated fields
        user.setRole(Role.USER);
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


    public UserResponse getCurrentUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return convertToResponse(user);
    }

    public UserResponse updateCurrentUser(
            String currentEmail,
            UpdateUserRequest request) {

        User existingUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        // Check whether another user already owns the requested email.
        if (!existingUser.getEmail().equalsIgnoreCase(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email is already registered");
        }

        existingUser.setName(request.getName().trim());
        existingUser.setEmail(request.getEmail().trim());

        User updatedUser = userRepository.save(existingUser);

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