import styled from "@emotion/styled";
import moment from "moment";
import React, { FunctionComponent, useContext, useEffect } from "react";
import { Button, Card, FormControl, InputGroup } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { ChatMessage } from "../../common/models";
import { SessionContext } from "../context/SessionContext";
import { socketService } from "../socketService";

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
          {[...messages].reverse().map(message => {
            const myMessage = user?.id === message.user.id;
            return <Message myMessage={myMessage} message={message}></Message>;
          })}
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

const Wrapper = styled.div({
  borderRadius: 10,
  margin: 10,
  boxShadow: "0 2px 10px 0 rgb(185 185 185)",
  width: 400,
  padding: 20
});

const Message: FunctionComponent<{
  message: ChatMessage;
  myMessage?: boolean;
}> = ({ message, myMessage }) => (
  <Wrapper style={!myMessage ? { alignSelf: "flex-end" } : {}}>
    <Card.Subtitle className="mb-2 text-muted">
      {message.user.displayName}
      <span style={{ margin: "0 10px" }}>
        {moment(message.date).calendar()}
      </span>
    </Card.Subtitle>
    <Card.Text>{message.text}</Card.Text>
  </Wrapper>
);

const MessageFrame = styled.div({
  height: 600,
  overflow: "scroll",
  display: "flex",
  flexDirection: "column-reverse"
});
const Frame = styled.div({
  margin: "10px 0",
  boxShadow: "0 2px 10px 0 rgb(185 185 185)"
});
