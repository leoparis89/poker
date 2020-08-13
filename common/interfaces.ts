interface Name {
  familyName: string;
  givenName: string;
}

interface Photo {
  value: string;
}

interface Json {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

interface IGoogleProfile {
  id: string;
  displayName: string;
  name: Name;
  photos: Photo[];
  provider: string;
  _raw: string;
  _json: Json;
}
