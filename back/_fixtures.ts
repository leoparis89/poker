import { Profile } from "passport-google-oauth20";
import { UserSocket } from "./interfaces";
import { EventEmitter } from "events";

export const mockProfile = {
  id: "117689296290332690711",
  displayName: "Lev Kowalski",
  name: { familyName: "Kowalski", givenName: "Lev" },
  photos: [
    {
      value: "https://foo.com"
    }
  ],
  provider: "google",
  _raw:
    '{\n  "sub": "117684296290332690711",\n  "name": "Lev Kowalski",\n  "given_name": "Lev",\n  "family_name": "Kowalski",\n  "picture": "https://lh3.googleusercontent.com/a-/AOh14GglsHXVtHhODpxGkORuq7crY8iAV4BnDDWLi4oNlA",\n  "locale": "fr"\n}',
  _json: {
    sub: "117684296290332690711",
    name: "Lev Kowalski",
    given_name: "Lev",
    family_name: "Kowalski",
    picture: "https://foo.com",
    locale: "fr"
  }
} as Profile;

export const makeSocket = (userId: string = "mockId") => {
  return {
    request: { user: { id: userId } },
    emit: jest.fn() as any,
    on: jest.fn() as any
  } as UserSocket;
};

export const makeEmitter = (userId: string = "mockId") => {
  const emitter = new EventEmitter() as UserSocket;
  emitter.request = { user: { id: userId } };
  return emitter;
};

export const profileMock1 = {
  id: "mockId1",
  displayName: "John Doe"
} as Profile;

export const profileMock2 = {
  id: "mockId2",
  displayName: "Bob Williams"
} as Profile;
