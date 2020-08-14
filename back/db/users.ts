import { Profile } from "passport-google-oauth20";
const userMap = new Map<string, Profile>();

export const usersDb = {
  get(id) {
    return userMap.get(id);
  },
  set(profile: Profile) {
    return userMap.set(profile.id, profile);
  }
};
