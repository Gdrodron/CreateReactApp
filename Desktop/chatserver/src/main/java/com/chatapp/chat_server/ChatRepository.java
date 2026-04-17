package com.chatapp.chat_server;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // ✅ optional but good practice
public interface ChatRepository extends JpaRepository<ChatMessage, Long> {
}