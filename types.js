export interface LabelData {
  id: string;
  header: string; // e.g., "ADD-ON" or Dish Letter
  content: string; // e.g., "Lebneh mezze"
  footer: string; // e.g., "User Name"
  subFooter: string; // e.g., "BELLABONA"
}

export interface RawJsonItem {
  [key: string]: any;
}

export interface FieldMapping {
  header: string;
  content: string;
  footer: string;
  subFooter: string;
}

export type MappingKey = keyof FieldMapping;