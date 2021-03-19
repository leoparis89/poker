import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import { UserCard, UserDataUI } from "front/src/game/UserCard";
import { mockProfile } from "back/src/_fixtures";

export default {
  title: "Poker/UserCard",
  component: UserCard,
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as Meta;

const Template: Story<UserDataUI> = (args) => <UserCard {...args} />;

export const WithHand = Template.bind({});
WithHand.args = {
  profile: mockProfile,
  online: true,
  gameData: {
    bet: null,
    hand: ["10H", "JS"],
    tokens: 1000,
    userId: "mockId1",
  },
};

export const NoHand = Template.bind({});
NoHand.args = {
  profile: mockProfile,
  online: true,
  gameData: {
    bet: null,
    hand: null,
    tokens: 1000,
    userId: "mockId1",
  },
};

export const CurrentPlayer = Template.bind({});
CurrentPlayer.args = {
  profile: mockProfile,
  online: true,
  currentTurn: true,
  gameData: {
    bet: 30,
    hand: ["10H", "JS"],
    tokens: 1000,
    userId: "mockId1",
  },
};

export const Dealer = Template.bind({});
Dealer.args = {
  profile: mockProfile,
  online: true,
  isDealer: true,
  gameData: {
    bet: 30,
    hand: ["10H", "JS"],
    tokens: 1000,
    userId: "mockId1",
  },
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
