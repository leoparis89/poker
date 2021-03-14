import FaceIcon from "@material-ui/icons/Face";
import React, { useContext } from "react";
import { SessionContext, logout } from "./context/SessionContext";
import MenuIcon from "@material-ui/icons/Menu";
import { Link } from "react-router-dom";
import {
  AppBar,
  IconButton,
  makeStyles,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Chip,
  styled,
  colors,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    // flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export function NavBar() {
  const classes = useStyles();
  const { user, connected } = useContext(SessionContext);
  return (
    // <Navbar bg="dark" variant="dark">
    //   <Navbar.Brand href="#home">
    //     <img
    //       alt=""
    //       src={require("./assets/logos/poker-logo.png")}
    //       width="30"
    //       height="30"
    //       className="d-inline-block align-top"
    //     />{" "}
    //     Poker
    //   </Navbar.Brand>
    //   <Navbar.Text>
    //     <Link to="/home">Home</Link>
    //   </Navbar.Text>
    //   <Navbar.Toggle />
    //   {user && (
    //     <Navbar.Collapse className="justify-content-end">
    //       <Navbar.Text>
    //         <a href="#login">{user?.displayName}</a>
    //       </Navbar.Text>
    //       <img
    //         width="30"
    //         height="30"
    //         style={{ borderRadius: "50%", margin: "0 20px" }}
    //         src={user.photos?.[0].value as any}
    //       />
    //       <Online online={connected} />
    //       <Navbar.Text onClick={logout} style={{ cursor: "pointer" }}>
    //         Logout
    //       </Navbar.Text>
    //     </Navbar.Collapse>
    //   )}
    // </Navbar>
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Link to="/home" className={classes.title}>
            <Typography variant="h6">Home</Typography>
          </Link>
          {user && (
            <>
              <Avatar src={user?.photos?.[0].value as any} />
              <Online online={connected} />
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}

const Online = ({ online }) => {
  const StyledChip = styled(Chip)(({ theme }) => ({
    margin: theme.spacing(1),
    background: online ? colors.green[600] : colors.red[500],
  }));

  return (
    <StyledChip
      icon={<FaceIcon />}
      label={online ? "Online" : "Offline"}
      color="secondary"
    />
  );
};
