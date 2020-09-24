import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import { UserCard } from "../front/game/UserCard";
import { UserDataUI } from "../common/interfaces";
import { mockProfile } from "../back/_fixtures";

export default {
  title: "Poker/UserCard",
  component: UserCard,
  argTypes: {
    backgroundColor: { control: "color" }
  }
} as Meta;

const Template: Story<UserDataUI> = args => <UserCard {...args} />;

export const WithHand = Template.bind({});
WithHand.args = {
  profile: mockProfile,
  online: true,
  gameData: {
    bet: null,
    hand: ["10H", "JS"],
    tokens: 1000,
    userId: "mockId1"
  }
};

export const NoHand = Template.bind({});
NoHand.args = {
  profile: mockProfile,
  online: true,
  gameData: {
    bet: null,
    hand: null,
    tokens: 1000,
    userId: "mockId1"
  }
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
