import styled from "@emotion/styled";
import { Paper, TextField, Button } from "@material-ui/core";
import moment from "moment";
import React, { FunctionComponent, useContext, useEffect } from "react";
import { Card, FormControl, InputGroup } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { ChatMessage } from "../../common/models";
import { SessionContext } from "../context/SessionContext";
import { socketService } from "../socketService";

export const ChatWindow: FunctionComponent<{ messages: any }> = ({
  messages,
}) => {
  const { register, handleSubmit, watch, errors, reset, formState } = useForm({
    mode: "onChange",
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

  const onSubmit = (val) => {
    socketService.socket.emit("chat-text", val.chatInput);
    reset();
  };

  return (
    <div>
      <h2>Chatroom</h2>
      <Paper elevation={3}>
        <MessageFrame>
          {[...messages].reverse().map((message) => {
            const isMyMessage = user?.id === message.user.id;
            return (
              <Message
                key={message.date + message.user.id}
                myMessage={isMyMessage}
                message={message}
              />
            );
          })}
        </MessageFrame>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            // as="textarea"
            // label="chat"
            variant="outlined"
            multiline
            rows={3}
            id="chat-text"
            name="chatInput"
            aria-label="With textarea"
            inputRef={register({
              required: "Required",
            })}
          />
          {/* <InputGroup.Prepend> */}
          <Button
            variant="contained"
            disabled={!formState.isValid}
            type="submit"
            color="primary"
          >
            Send
          </Button>
          {/* </InputGroup.Prepend> */}
        </form>
      </Paper>
    </div>
  );
};

const Wrapper = styled.div({
  borderRadius: 10,
  margin: 10,
  boxShadow: "0 2px 10px 0 rgb(185 185 185)",
  width: 400,
  padding: 20,
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
  flexDirection: "column-reverse",
});
