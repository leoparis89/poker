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
import { ChatMessage } from "../../common/models";
import { socketService } from "../socketService";
import { SessionContext } from "../context/SessionContext";

export const ChatWindow: FunctionComponent<{ messages: any }> = ({
  messages
}) => {
  const { register, handleSubmit, watch, errors, reset, formState } = useForm({
    mode: "onChange"
  });

  const { user, connected } = useContext(SessionContext);
  useEffect(() => {
    if (!user) {
      return;
    }

    return () => {};
  }, [user]);

  useEffect(() => {
    function submitOnEnter(event) {
      if (!formState.isValid) {
        return;
      }
      if (event.which === 13) {
        event.target.form.dispatchEvent(
          new Event("submit", { cancelable: true })
        );
        event.preventDefault(); // Prevents the addition of a new line in the text field (not needed in a lot of cases)
      }
    }
    window.document
      .getElementById("chat-text")!
      .addEventListener("keypress", submitOnEnter);
  }, []);

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
              id="chat-text"
              aria-label="With textarea"
              ref={register({
                required: "Required"
              })}
              name="chatInput"
            />
            <InputGroup.Prepend>
              <Button disabled={!formState.isValid} type="submit">
                Send
              </Button>
            </InputGroup.Prepend>
          </InputGroup>
        </form>
      </Frame>
    </div>
  );
};

const Message: FunctionComponent<{ message: ChatMessage }> = ({ message }) => (
  <div key={message.date}>
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
  margin: "10px 0",
  boxShadow: "0 2px 10px 0 rgb(185 185 185)"
});
