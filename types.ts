export interface LabelData {
  id: string;
  customerName: string; // "Harsh" -> Styled H
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
  customerName: string;
  dishLetter: string;
  dishType: string;
  dishName: string;
  allergens: string;
  brand: string;
}

export type MappingKey = keyof FieldMapping;