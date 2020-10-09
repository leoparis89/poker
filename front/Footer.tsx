import React from "react";

import { settings } from "../back/settings";
export function Footer(props) {
  return (
    <div style={{ textAlign: "center", color: props.dark ? "black" : "white" }}>
      version {settings.version}
    </div>
  );
}
