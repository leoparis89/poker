import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import { Controls } from "front/game/Controls";

export default {
  title: "Poker/Controls",
  component: Controls,
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as Meta;

const Template: Story<any> = (args) => <Controls {...args} />;

export const Enabled = Template.bind({});
Enabled.args = {};
