import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import { PlayingCard, PlayingCardProps } from "../front/cards/PlayingCard";

export default {
  title: "Poker/PlayingCard",
  component: PlayingCard,
  argTypes: {
    backgroundColor: { control: "color" }
  }
} as Meta;

const Template: Story<PlayingCardProps> = args => <PlayingCard {...args} />;

export const SpadesAce = Template.bind({});
SpadesAce.args = {
  rank: "A",
  suit: "S"
};

export const Spades10 = Template.bind({});
Spades10.args = {
  rank: "10",
  suit: "S"
};

export const HeartsKing = Template.bind({});
HeartsKing.args = {
  rank: "K",
  suit: "H"
};

export const Clubs7 = Template.bind({});
Clubs7.args = {
  rank: "7",
  suit: "C"
};

export const DiamondsJack = Template.bind({});
DiamondsJack.args = {
  rank: "J",
  suit: "D"
};
