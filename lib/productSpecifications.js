export const defaultSpecFields = [
  ["brand", "Brand", "Samsung, Apple, HP"],
  ["model", "Model", "Galaxy A17 5G"],
  ["color", "Color", "Black"],
  ["warranty", "Warranty", "12 Months"],
];

export const categorySpecFields = {
  phones: [
    ["brand", "Brand", "Samsung, Apple, Xiaomi"],
    ["model", "Model", "Galaxy S25 Ultra"],
    ["color", "Color", "Black"],
    ["display", "Display", '6.8" AMOLED'],
    ["screenSize", "Screen Size", '6.8"'],
    ["refreshRate", "Refresh Rate", "120Hz"],
    ["ram", "RAM", "12GB"],
    ["storage", "Storage", "256GB"],
    ["processor", "Processor", "Snapdragon 8 Elite"],
    ["camera", "Camera", "200MP"],
    ["frontCamera", "Front Camera", "12MP"],
    ["battery", "Battery", "5000mAh"],
    ["charging", "Charging", "45W Fast Charging"],
    ["sim", "SIM", "Dual Nano SIM"],
    ["network", "Network", "5G"],
    ["fingerprint", "Fingerprint", "In-display"],
    ["os", "Operating System", "Android 15"],
    ["bluetooth", "Bluetooth", "5.4"],
    ["wifi", "WiFi", "WiFi 7"],
    ["nfc", "NFC", "Yes"],
    ["waterResistance", "Water Resistance", "IP68"],
    ["warranty", "Warranty", "12 Months"],
  ],

  tablets: [
    ["brand", "Brand", "Samsung, Apple"],
    ["model", "Model", "Galaxy Tab S10"],
    ["color", "Color", "Gray"],
    ["display", "Display", '11" AMOLED'],
    ["screenSize", "Screen Size", '11"'],
    ["ram", "RAM", "8GB"],
    ["storage", "Storage", "256GB"],
    ["processor", "Processor", "Snapdragon"],
    ["battery", "Battery", "10090mAh"],
    ["os", "Operating System", "Android"],
    ["network", "Network", "WiFi / 5G"],
    ["stylus", "Stylus Support", "Yes"],
    ["warranty", "Warranty", "12 Months"],
  ],

  laptops: [
    ["brand", "Brand", "HP, Dell, Lenovo"],
    ["model", "Model", "EliteBook"],
    ["color", "Color", "Silver"],
    ["cpu", "Processor", "Intel Core Ultra 7"],
    ["gpu", "Graphics", "Intel Arc"],
    ["ram", "RAM", "16GB"],
    ["storage", "Storage", "512GB SSD"],
    ["screenSize", "Screen Size", '14"'],
    ["display", "Display", "FHD IPS"],
    ["refreshRate", "Refresh Rate", "120Hz"],
    ["touchscreen", "Touchscreen", "No"],
    ["keyboard", "Keyboard", "Backlit"],
    ["battery", "Battery", "10 Hours"],
    ["os", "Operating System", "Windows 11 Pro"],
    ["ports", "Ports", "USB-C, HDMI"],
    ["fingerprint", "Fingerprint", "Yes"],
    ["warranty", "Warranty", "12 Months"],
  ],

  televisions: [
    ["brand", "Brand", "Samsung, LG, TCL"],
    ["model", "Model", "Crystal UHD"],
    ["screenSize", "Screen Size", '55"'],
    ["resolution", "Resolution", "4K UHD"],
    ["panel", "Panel", "QLED"],
    ["refreshRate", "Refresh Rate", "120Hz"],
    ["smartTv", "Smart TV", "Yes"],
    ["operatingSystem", "Operating System", "Google TV"],
    ["hdmi", "HDMI Ports", "4"],
    ["usb", "USB Ports", "2"],
    ["wifi", "WiFi", "Yes"],
    ["bluetooth", "Bluetooth", "Yes"],
    ["warranty", "Warranty", "12 Months"],
  ],

  smartwatches: [
    ["brand", "Brand", "Apple, Samsung"],
    ["model", "Model", "Galaxy Watch"],
    ["color", "Color", "Black"],
    ["display", "Display", "AMOLED"],
    ["screenSize", "Screen Size", '1.5"'],
    ["battery", "Battery", "48 Hours"],
    ["gps", "GPS", "Yes"],
    ["bluetooth", "Bluetooth", "5.3"],
    ["waterResistance", "Water Resistance", "5ATM"],
    ["warranty", "Warranty", "12 Months"],
  ],

  headphones: [
    ["brand", "Brand", "Sony, JBL, Oraimo"],
    ["model", "Model", "WH-1000XM5"],
    ["color", "Color", "Black"],
    ["driverSize", "Driver Size", "40mm"],
    ["bluetooth", "Bluetooth", "5.3"],
    ["noiseCancellation", "Noise Cancellation", "ANC"],
    ["batteryLife", "Battery Life", "30 Hours"],
    ["charging", "Charging", "USB-C"],
    ["microphone", "Microphone", "Built-in"],
    ["warranty", "Warranty", "12 Months"],
  ],

  refrigerators: [
    ["brand", "Brand", "Samsung, LG, Nasco"],
    ["model", "Model", "Double Door"],
    ["color", "Color", "Silver"],
    ["capacity", "Capacity", "260L"],
    ["energyRating", "Energy Rating", "A++"],
    ["coolingSystem", "Cooling System", "No Frost"],
    ["doorType", "Door Type", "Double Door"],
    ["compressor", "Compressor", "Digital Inverter"],
    ["warranty", "Warranty", "12 Months"],
  ],
};

export const getSpecFields = (
  categoryName = "",
  subcategoryName = "",
  childCategoryName = ""
) => {
  const text =
    `${categoryName} ${subcategoryName} ${childCategoryName}`.toLowerCase();

  if (
    text.includes("phone") ||
    text.includes("android") ||
    text.includes("iphone")
  ) {
    return categorySpecFields.phones;
  }

  if (text.includes("tablet") || text.includes("ipad")) {
    return categorySpecFields.tablets;
  }

  if (
    text.includes("laptop") ||
    text.includes("computer") ||
    text.includes("notebook")
  ) {
    return categorySpecFields.laptops;
  }

  if (
    text.includes("tv") ||
    text.includes("television")
  ) {
    return categorySpecFields.televisions;
  }

  if (
    text.includes("watch") ||
    text.includes("smartwatch")
  ) {
    return categorySpecFields.smartwatches;
  }

  if (
    text.includes("headphone") ||
    text.includes("earbud") ||
    text.includes("earphone")
  ) {
    return categorySpecFields.headphones;
  }

  if (
    text.includes("fridge") ||
    text.includes("refrigerator")
  ) {
    return categorySpecFields.refrigerators;
  }

  return defaultSpecFields;
};