package com.teamflow.teamflow_backend.Controller;

import com.teamflow.teamflow_backend.Entity.User;
import com.teamflow.teamflow_backend.Service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    // 1. CREATE: Returns 201 Created along with the saved User object
    @PostMapping("create")
    public ResponseEntity<User> createUser(@RequestBody User user){
        User savedUser = userService.createUser(user);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    // 2. READ ALL: Returns 200 OK along with the list of users
    @GetMapping("allusers")
    public ResponseEntity<List<User>> getUsers(){
        List<User> users = userService.findAllUser();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // 3. READ BY ID: Returns 200 OK if found, or 404 NOT FOUND
    @GetMapping("id/{id}")
    public ResponseEntity<User> findById(@PathVariable Integer id){
        Optional<User> user = Optional.ofNullable(userService.findById(id));
        if(user.isPresent()){
            return new ResponseEntity<>(user.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // 4. UPDATE: Returns 200 OK with updated data, or 404 NOT FOUND if user doesn't exist
    @PutMapping("update/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User userDetails){
        Optional<User> updatedUser = Optional.ofNullable(userService.updateUser(id, userDetails));
        if(updatedUser.isPresent()){
            return new ResponseEntity<>(updatedUser.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // 5. DELETE: Returns 204 NO CONTENT on a successful request, or 404 if the user is missing
    @DeleteMapping("delete/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id){
        Optional<User> existingUser = Optional.ofNullable(userService.findById(id));
        if(existingUser.isPresent()){
            userService.deleteUser(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content is best practice for deletes
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
