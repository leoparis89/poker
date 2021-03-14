import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Paper,
  styled,
  TextField,
  Typography,
} from "@material-ui/core";
import moment from "moment";
import React, { FunctionComponent, useContext, useEffect } from "react";
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
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex" }}>
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
            style={{ flexGrow: 1 }}
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

const Wrapper = styled(Card)(({ theme }) => ({
  borderRadius: 10,
  margin: theme.spacing(1),
  minHeight: 150,
  width: 300,
  // padding: 20,
}));

const Message: FunctionComponent<{
  message: ChatMessage;
  myMessage?: boolean;
}> = ({ message, myMessage }) => {
  const avatarUrl = message.user.photos?.[0].value;

  return (
    <Wrapper style={!myMessage ? { alignSelf: "flex-end" } : {}}>
      <CardHeader
        title={message.user.displayName}
        subheader={moment(message.date).calendar()}
        avatar={<Avatar src={avatarUrl} />}
      />
      <CardContent>
        <Typography color="textSecondary" component="p">
          {message.text}
        </Typography>
      </CardContent>
    </Wrapper>
  );
};

const MessageFrame = styled(Box)({
  height: 600,
  overflow: "scroll",
  display: "flex",
  flexDirection: "column-reverse",
});
