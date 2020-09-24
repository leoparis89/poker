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
  rankSuit: "AS"
};

export const Spades10 = Template.bind({});
Spades10.args = {
  rankSuit: "10S"
};

export const HeartsKing = Template.bind({});
HeartsKing.args = {
  rankSuit: "KH"
};

export const Clubs7 = Template.bind({});
Clubs7.args = {
  rankSuit: "7C"
};

export const DiamondsJack = Template.bind({});
DiamondsJack.args = {
  rankSuit: "JD"
};

export const BlueBack = Template.bind({});
BlueBack.args = {
  rankSuit: "Blue_Back"
};
