package com.chatapp.chat_server;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // ✅ allow frontend access
public class AuthController {

    @PostMapping("/login")
    public ChatMessage login(@RequestBody ChatMessage user) {

        // basic validation
        if (user.getSender() == null || user.getSender().trim().isEmpty()) {
            throw new RuntimeException("Username is required");
        }

        // optional: clean input
        user.setSender(user.getSender().trim());

        return user; // ✅ return full object (better for frontend)
    }
}