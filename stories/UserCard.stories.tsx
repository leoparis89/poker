import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import { UserCard } from "../front/game/UserCard";
import { UserData } from "../common/interfaces";
import { mockProfile } from "../back/_fixtures";

export default {
  title: "Poker/UserCard",
  component: UserCard,
  argTypes: {
    backgroundColor: { control: "color" }
  }
} as Meta;

const Template: Story<UserData> = args => <UserCard {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  profile: mockProfile,
  gameData: { tokens: 1, userData: { online: true } }
};

// export const Secondary = Template.bind({});
// Secondary.args = {
//   label: "Button"
// };

// export const Large = Template.bind({});
// Large.args = {
//   size: "large",
//   label: "Button"
// };

// export const Small = Template.bind({});
// Small.args = {
//   size: "small",
//   label: "Button"
// };
