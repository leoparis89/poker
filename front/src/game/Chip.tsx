import React from "react";

export const Chip = ({ chipSize }) => {
  const size = chipSize || 50;
  const borderSize = size / 15;
  const bgColor = "#f32e65";

  const style = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: size,
    height: size,
    fontSize: size / 3,
    fontWeight: 700,
    color: "white",
    background: bgColor,
    border: `${borderSize}px dashed white`,
    borderRadius: size,
    boxShadow: "0 0 1rem rgba(0, 0, 0, 0.3)",
    margin: 15
  };
  return <div style={style}>♣</div>;
};
