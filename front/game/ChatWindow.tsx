import styled from "@emotion/styled";
import moment from "moment";
import React, {
  FunctionComponent,
  useEffect,
  useState,
  useContext
} from "react";
import { Button, Card, FormControl, InputGroup } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { ChatMessage } from "../../common/interfaces";
import { socketService } from "../socketService";
import { SessionContext } from "../context/SessionContext";

export const ChatWindow: FunctionComponent<{}> = () => {
  const { register, handleSubmit, watch, errors, reset } = useForm();

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { user, connected } = useContext(SessionContext);
  useEffect(() => {
    if (!user) {
      return;
    }

    socketService.socket.on("chat-history", (messages: ChatMessage[]) => {
      setMessages(messages);
      socketService.socket.on("chat-message", (message: ChatMessage) => {
        setMessages(prevMessages => [...prevMessages, message]);
      });
    });
    return () => {};
  }, [user]);

  const onSubmit = val => {
    socketService.socket.emit("chat-text", val.chatInput);
    reset();
  };

  return (
    <div>
      <h2>Chatroom</h2>
      <Frame>
        <MessageFrame>
          {messages.map(message => (
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

const Message: FunctionComponent<{ message: ChatMessage }> = ({ message }) => (
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
  overflow: "scroll"
});
const Frame = styled.div({
  // height: 300,
  // border: "1pw black solid",
  margin: "10px 0",
  boxShadow: "0 2px 10px 0 rgb(185 185 185)"
});
