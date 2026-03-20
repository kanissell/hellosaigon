export type RecommendationRecord = {
  placeId: string;
  placeName: string;
  subcategory: string;
  timestamp: string; // ISO
  engaged?: boolean;
};
