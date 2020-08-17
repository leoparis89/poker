import React from "react";

import { settings } from "../back/settings";
export function Footer() {
  return <div style={{ textAlign: "center" }}>{settings.version}</div>;
}
