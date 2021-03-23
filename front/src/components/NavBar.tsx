import {
  AppBar,
  Chip,
  colors,
  IconButton,
  makeStyles,
  styled,
  Toolbar,
  Typography,
} from "@material-ui/core";
import FaceIcon from "@material-ui/icons/Face";
import MenuIcon from "@material-ui/icons/Menu";
import { GameContext } from "front/src/game/GameContext";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AvatarMenu } from "../AvatarMenu";
import { SessionContext } from "../context/SessionContext";
import { ThemeToggle } from "../theme/ThemeToggle";

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

const UnstyledLink = styled(Link)({ textDecoration: "none", color: "inherit" });

export function NavBar() {
  const classes = useStyles();
  const { user, connected } = useContext(SessionContext);
  const { gameState } = useContext(GameContext);
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
          <UnstyledLink to="/home" className={classes.title}>
            <Typography variant="h6">Home</Typography>
          </UnstyledLink>
          {user && (
            <>
              {gameState && (
                <Chip label={`Game ID: ${gameState.gameData.id}`} />
              )}
              <AvatarMenu avatarUrl={user?.photos?.[0].value as any} />
              <Online online={connected} />
              <ThemeToggle />
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
