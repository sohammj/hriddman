export type EventType = {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  bannerExpiry?: string;
  flyer?: { asset?: { _ref?: string; url?: string } };
  link?: string;
};
