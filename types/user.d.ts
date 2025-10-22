export interface User {
  name: string;
  salt?: string;
  hash?: string;
}