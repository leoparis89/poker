import React from "react";

import { settings } from "../../back/src/settings";
export function Footer(props) {
  return <div style={{ textAlign: "center" }}>version {settings.version}</div>;
}
