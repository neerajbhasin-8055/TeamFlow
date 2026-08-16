package com.teamflow.teamflow_backend.Controller;

import com.teamflow.teamflow_backend.Entity.User;
import com.teamflow.teamflow_backend.Service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @PostMapping("create")
    public User createUser(@RequestBody User user){
        return userService.createUser(user);
    }

    @GetMapping("allusers")
    public List<User> getUsers(){
        return userService.findAllUser();
    }

    @GetMapping("id/{id}")
    public User findById(@PathVariable Integer id){
        return userService.findById(id);
    }

    @PutMapping("update/{id}")
    public User updateUser(@PathVariable Integer id, @RequestBody User userDetails){
        return userService.updateUser(id, userDetails);
    }

    @DeleteMapping("delete/{id}")
    public void deleteUser(@PathVariable Integer id){
        userService.deleteUser(id);
    }
}
