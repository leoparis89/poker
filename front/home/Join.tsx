import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Modal, Button, Form } from "react-bootstrap";

export default function Join({ show, handleClose }) {
  const { register, handleSubmit, errors, setValue } = useForm(); // initialise the hook
  const onSubmit = data => {
    debugger;
    console.log(data);
  };

  useEffect(() => {
    register({ name: "gameId" });
  }, [register]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Join game</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {/* <input name="gameId" ref={register({ required: true })} />
          {errors.gameId && "gameId is required."}
          <input type="submit" /> */}
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Game ID</Form.Label>
            <Form.Control
              name="gameId"
              type="text"
              placeholder="Enter Game ID"
              onChange={e => setValue("gameId", e.target.value)}
              // ref={register({ required: true })}
            />
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          {/* <Button variant="secondary" onClick={handleClose}>
            Close
          </Button> */}
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
