package com.teamflow.teamflow_backend.Service;

import com.teamflow.teamflow_backend.Entity.User;
import com.teamflow.teamflow_backend.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository){
        this.userRepository = userRepository;
    }
    public User createUser(User user){
        user.setCreatedAt(new Date());
        return userRepository.save(user);
    }
    public List<User> findAllUser(){
        return userRepository.findAll();
    }
    public User findById(Integer id){
        return userRepository.findById(id).orElse(null);
    }
    public User updateUser(Integer id, User userDetails){
        User existingUser = userRepository.findById(id).orElse(null);
        if(existingUser == null){
            return null;
        }
        existingUser.setEmail(userDetails.getEmail());
        existingUser.setName(userDetails.getName());
        existingUser.setPassword(userDetails.getPassword());
        existingUser.setRole(userDetails.getRole());

        return userRepository.save(existingUser);
    }
    public void deleteUser(Integer id){
        if (userRepository.existsById(id)) { // Quick index check, doesn't pull the full document
            userRepository.deleteById(id);   // Direct deletion command
        }

    }
}
