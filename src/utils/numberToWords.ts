export const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";
  
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const thousands = ["", "Thousand", "Lakh", "Crore"];

  const convert = (n: number, position: number): string => {
    if (n === 0) return "";
    
    let str = "";
    const hun = Math.floor(n / 100);
    const rem = n % 100;
    
    if (hun > 0) {
      str += ones[hun] + " Hundred ";
    }
    
    if (rem > 0) {
      if (rem < 10) {
        str += ones[rem];
      } else if (rem < 20) {
        str += teens[rem - 10];
      } else {
        const ten = Math.floor(rem / 10);
        const unit = rem % 10;
        str += tens[ten];
        if (unit > 0) str += " " + ones[unit];
      }
    }
    
    if (position > 0 && str.trim()) {
      str += " " + thousands[position] + " ";
    }
    
    return str;
  };

  let result = "";
  let position = 0;
  
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0) {
      result = convert(chunk, position) + result;
    }
    num = Math.floor(num / 1000);
    position++;
  }
  
  return result.trim();
};