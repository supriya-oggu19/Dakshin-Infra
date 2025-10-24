/** --- Response Models --- */
export interface ContactInfo {
  id: string;
  contact_type: "phone" | "email";
  contact_value: string;
  label: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}