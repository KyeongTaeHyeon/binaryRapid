package com.binary.rapid.user.controller;

import com.binary.rapid.user.form.UserSignUpForm;
import com.binary.rapid.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Controller

public class UserController {
    
    @Autowired
    UserService service;
    
    @PostMapping("/user/LocalLogin")
    public String userLocalLogin(@RequestBody UserSignUpForm form){
        
        service.localSignup(form);
        
        return "";
    }
}
