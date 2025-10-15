export function getFacilityNameByCode(code: number): string {
  switch (code) {
  case 1: return "Bed";
  case 2: return "Wardrobe";
  case 3: return "Desk ";
  case 4: return "Air conditioner";
  case 5: return "Electric fan";
  case 6: return "Washing machine";
  case 7: return "Fridge";
  case 8: return "Kitchenette";
  case 9: return "Private bathroom";
  case 10: return "Water heater";
  case 11: return "Wifi ";
  case 12: return "Window";
  case 13: return "Mirror";
  default: return "";
  }
}