import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";
import { InfoDisplay, InfoDisplayProps } from "../front/game/Game";

export default {
  title: "Poker/GameInfoDisplay",
  component: InfoDisplay
} as Meta;

const Template: Story<InfoDisplayProps> = args => <InfoDisplay {...args} />;

export const GameNotStarted = Template.bind({});
GameNotStarted.args = {
  gameStarted: false
};

export const Pot = Template.bind({});
Pot.args = {
  gameStarted: true,
  pot: 40
};

export const Winners = Template.bind({});
Winners.args = {
  gameStarted: true,
  pot: 40,
  winners: [
    {
      descr: "Foo Pair or 3s",
      winnerIndex: 0
    },
    {
      descr: "Royal cheese flush",
      winnerIndex: 1
    }
  ],
  players: [
    {
      profile: {
        displayName: "John Doe"
      }
    },
    {
      profile: {
        displayName: "Bob Willis"
      }
    }
  ]
} as InfoDisplayProps;
