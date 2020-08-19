import { Profile } from "passport-google-oauth20";
import styled from "@emotion/styled";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Button, Card, FormControl, InputGroup } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { ChatMessage } from "../../common/interfaces";
import { socketService } from "../socketService";

import moment from "moment";
type ChatMessageWithProfile = ChatMessage & { user: Profile };

export const ChatWindow: FunctionComponent<{ users: Profile[] }> = ({
  users,
}) => {
  const { register, handleSubmit, watch, errors, reset } = useForm();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesWithProfile, setMessagesWithProfile] = useState<
    ChatMessageWithProfile[]
  >([]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const profile = users.find((user) => user.id === lastMessage.userId);
    if (!profile) {
      return;
    }
    setMessagesWithProfile((prevMessages) => [
      ...prevMessages,
      { ...lastMessage, user: profile },
    ]);
  }, [messages]);

  useEffect(() => {
    socketService.socket.on("chat-receive", (message: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    // TODO ceanup
  }, []);

  const onSubmit = (val) => {
    socketService.socket.emit("chat-send", val.chatInput);
    reset();
    console.log(val);
  };

  return (
    <div>
      <h2>Chatroom</h2>
      <Frame>
        <MessageFrame>
          {messagesWithProfile.map((message) => (
            <Message message={message}></Message>
          ))}
        </MessageFrame>
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputGroup>
            <FormControl
              as="textarea"
              aria-label="With textarea"
              ref={register}
              name="chatInput"
            />
            <InputGroup.Prepend>
              <Button type="submit">Send</Button>
            </InputGroup.Prepend>
          </InputGroup>
        </form>
      </Frame>
    </div>
  );
};

const Message: FunctionComponent<{ message: ChatMessageWithProfile }> = ({
  message,
}) => (
  <div>
    <Card style={{ borderRadius: 10, margin: 10, display: "inline-block" }}>
      <Card.Body>
        <Card.Subtitle className="mb-2 text-muted">
          {message.user.displayName}
          <span style={{ margin: "0 10px" }}>
            {moment(message.date).calendar()}
          </span>
        </Card.Subtitle>
        <Card.Text>{message.text}</Card.Text>
      </Card.Body>
    </Card>
  </div>
);

const MessageFrame = styled.div({
  height: 600,
  overflow: "scroll",
});
const Frame = styled.div({
  // height: 300,
  // border: "1pw black solid",
  margin: "10px 0",
  boxShadow: "0 2px 10px 0 rgb(185 185 185)",
});
