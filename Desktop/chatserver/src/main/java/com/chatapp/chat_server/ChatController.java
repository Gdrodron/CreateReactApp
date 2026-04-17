package com.chatapp.chat_server;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class ChatController {

    private final ChatRepository repo;

    // ✅ thread-safe set
    private static final Set<String> users = ConcurrentHashMap.newKeySet();

    public ChatController(ChatRepository repo) {
        this.repo = repo;
    }

    // ✅ SEND MESSAGE
    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public ChatMessage sendMessage(ChatMessage message) {

        if (message.getSender() != null && !message.getSender().trim().isEmpty()) {
            users.add(message.getSender().trim());
        }

        if (message.getContent() != null) {
            message.setContent(message.getContent().trim());
        }

        return repo.save(message);
    }

    // ✅ GET ONLINE USERS
    @MessageMapping("/users")
    @SendTo("/topic/users")
    public Set<String> getUsers(String username) {

        if (username != null && !username.trim().isEmpty()) {
            users.add(username.trim());
        }

        return users;
    }
}