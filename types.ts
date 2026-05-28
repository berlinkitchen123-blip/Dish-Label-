export interface LabelData {
  id: string;
  customerEmail: string; // "h@example.com" -> Styled H
  dishLetter: string;   // "A"
  dishType: string;     // "Starter"
  dishName: string;     // "Soup"
  allergens: string;    // "Gluten"
  brand: string;        // "BELLABONA"
  quantity: number;
}

export interface RawJsonItem {
  [key: string]: any;
}

export interface FieldMapping {
  customerEmail: string;
  dishLetter: string;
  dishType: string;
  dishName: string;
  allergens: string;
  brand: string;
}

export type MappingKey = keyof FieldMapping;