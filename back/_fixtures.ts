export const mockProfile: IGoogleProfile = {
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
};
