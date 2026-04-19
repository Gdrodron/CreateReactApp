import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [connected, setConnected] = useState(false);

  const clientRef = useRef(null);
  const messagesEndRef = useRef(null);

  const SOCKET_URL = "https://chat-server-kd87.onrender.com/ws";

  // 🔥 CONNECT (run once)
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,

      onConnect: () => {
        console.log("Connected!");
        setConnected(true);

        // 📩 messages
        client.subscribe("/topic/messages", (msg) => {
          const newMessage = JSON.parse(msg.body);
          setMessages((prev) => [...prev, newMessage]);
        });

        // 👥 users
        client.subscribe("/topic/users", (msg) => {
          setUsers(JSON.parse(msg.body));
        });
      },

      onDisconnect: () => {
        console.log("Disconnected");
        setConnected(false);
      },

      onStompError: (frame) => {
        console.error("Broker error:", frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  // 🔥 send username ONLY when connected + username exists
  useEffect(() => {
    if (connected && clientRef.current && username.trim()) {
      clientRef.current.publish({
        destination: "/app/users",
        body: username.trim(),
      });
    }
  }, [username, connected]);

  // auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!connected) {
      alert("Not connected yet...");
      return;
    }

    if (!username.trim()) {
      alert("Enter username first");
      return;
    }

    if (clientRef.current && message.trim()) {
      clientRef.current.publish({
        destination: "/app/chat",
        body: JSON.stringify({
          sender: username.trim(),
          content: message.trim(),
        }),
      });

      setMessage("");
    }
  };

  return (
    <div style={styles.container}>
      <h2>💬 Chat App</h2>

      {/* 🔥 connection status */}
      <p>
        Status:{" "}
        <b style={{ color: connected ? "green" : "red" }}>
          {connected ? "Connected" : "Disconnected"}
        </b>
      </p>

      {/* username */}
      <input
        style={styles.input}
        placeholder="Enter your name..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* users */}
      <div>
        <h4>Online Users:</h4>
        {users.map((u, i) => (
          <div key={i}>{u}</div>
        ))}
      </div>

      {/* chat */}
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={
              msg.sender === username
                ? styles.myMessage
                : styles.otherMessage
            }
          >
            <b>{msg.sender}</b>
            <div>{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* input */}
      <div style={{ display: "flex" }}>
        <input
          style={styles.input}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 500,
    margin: "auto",
    padding: 20,
    fontFamily: "Arial",
  },
  chatBox: {
    border: "1px solid #ccc",
    height: 300,
    overflowY: "auto",
    padding: 10,
    marginBottom: 10,
    display: "flex",
    flexDirection: "column",
  },
  myMessage: {
    alignSelf: "flex-end",
    background: "#4CAF50",
    color: "white",
    padding: 10,
    borderRadius: 10,
    margin: 5,
    maxWidth: "70%",
  },
  otherMessage: {
    alignSelf: "flex-start",
    background: "#eee",
    padding: 10,
    borderRadius: 10,
    margin: 5,
    maxWidth: "70%",
  },
  input: {
    flex: 1,
    padding: 10,
    margin: 5,
  },
  button: {
    padding: "10px 20px",
    margin: 5,
    background: "#2196F3",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};

export default App;