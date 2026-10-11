package com.teamflow.teamflow_backend.Repository;

import com.teamflow.teamflow_backend.Entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User,String> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(@NotBlank @Email(message = "Provide a valid email") String email);
}
