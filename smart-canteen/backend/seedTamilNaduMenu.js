require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/product");
const Settings = require("./models/Settings");

const TAMIL_NADU_MENU = [
  // =================== TIFFIN & BREAKFAST ===================
  {
    name: "Crispy Ghee Roast Dosa",
    category: "Tiffin Specials",
    price: 50,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 60,
    description: "Golden crispy paper roast dosa cooked with fragrant pure cow ghee, served hot with Madras sambar, coconut chutney and spicy tomato chutney.",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Ghee Podi Idli (2 pcs)",
    category: "Tiffin Specials",
    price: 35,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Steamed fluffy rice-urad dal idlis tossed generously in spicy roasted gun powder (idli podi) and hot melted desi ghee with coriander.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Medu Vada with Sambar & Chutney (2 pcs)",
    category: "Tiffin Specials",
    price: 30,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Golden brown crispy urad dal doughnut vadas seasoned with whole black pepper, curry leaves, and ginger. Served with hot sambar & fresh coconut chutney.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Sambar Vada (Dipped)",
    category: "Tiffin Specials",
    price: 35,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 45,
    description: "Crispy medu vadas immersed deep in piping hot drumstick-shallot Madras sambar, finished with crunchy raw onions, fresh coriander, and a drizzle of ghee.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Madurai Special Masala Dosa",
    category: "Tiffin Specials",
    price: 60,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Crispy folded dosa smeared with spicy garlic-red chilli paste and packed with savory turmeric potato masala tempered with mustard & curry leaves.",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Hot Ven Pongal with Ghee & Cashews",
    category: "Tiffin Specials",
    price: 45,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 40,
    description: "Traditional temple-style comforting rice & yellow moong dal cooked with crushed black peppercorns, cumin, fresh ginger, crunchy roasted cashews and pure ghee.",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Poori Masala (2 pcs)",
    category: "Tiffin Specials",
    price: 40,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Hot puffed golden whole-wheat pooris served with authentic canteen potato-onion kilangu masala and coconut chutney.",
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80"
  },

  // =================== MEALS & VARIETY RICE ===================
  {
    name: "Tamil Nadu Canteen Meals (Mini Meals)",
    category: "Meals & Rice",
    price: 80,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 60,
    description: "Full traditional lunch plate: Steamed Ponni rice, Madras Sambar, Poondu Rasam, Vegetable Kootu, Crispy Poriyal, crunchy Appalam, Mor Milagai and fresh curd.",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Sambar Sadam with Appalam & Desi Ghee",
    category: "Meals & Rice",
    price: 55,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Slow-cooked aromatic sambar rice with shallots, carrots, drumstick, and tamarind, topped with a generous dollop of ghee and served with crunchy fried appalam.",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Temple Style Thayir Sadam (Curd Rice)",
    category: "Meals & Rice",
    price: 40,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Cooling soothing curd rice tempered with mustard, green chillies, fresh grated ginger, curry leaves, crunchy pomegranate seeds, and spicy homemade mango pickle.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Tangy Lemon Rice with Potato Roast",
    category: "Meals & Rice",
    price: 45,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 45,
    description: "Vibrant yellow rice infused with freshly squeezed lemon juice, crunchy peanuts, chana dal and curry leaves, accompanied by crispy spicy potato fry.",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80"
  },

  // =================== PAROTTA & BIRIYANI ===================
  {
    name: "Dindigul Thalappakatti Chicken Biryani",
    category: "Parotta & Biriyani",
    price: 130,
    isVeg: false,
    available: true,
    isAvailable: true,
    stock: 60,
    description: "Iconic Tamil Nadu dum biryani cooked with fragrant Seeraga Samba short-grain rice, succulent marinated chicken pieces, hand-ground spices, served with rich salna and onion raita.",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Madurai Chicken Kothu Parotta",
    category: "Parotta & Biriyani",
    price: 110,
    isVeg: false,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Famous Madurai street-canteen delicacy: shredded flaky layered parottas beaten on iron griddle with juicy spiced chicken, eggs, shallots, green chillies and rich chicken salna.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Egg Kothu Parotta (Madurai Style)",
    category: "Parotta & Biriyani",
    price: 80,
    isVeg: false,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Finely shredded crispy parottas tossed on hot tawa with scrambled farm eggs, sautéed onions, tomatoes, curry leaves and rich savory spiced salna.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Malabar Bun Parotta (2 pcs) with Salna",
    category: "Parotta & Biriyani",
    price: 50,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 70,
    description: "Multi-layered, golden, flaky and soft hot bun parottas served with flavorful canteen vegetable empty salna and onion raita.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Tamil Canteen Chicken Fried Rice",
    category: "Parotta & Biriyani",
    price: 100,
    isVeg: false,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Wok-tossed basmati rice seasoned with boneless spiced chicken cubes, scrambled egg shreds, crunchy cabbage, spring onions, and a splash of spicy salna gravy.",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Canteen Veg Fried Rice",
    category: "Parotta & Biriyani",
    price: 70,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Aromatic wok-stirred long-grain basmati rice with crunchy carrots, beans, shredded cabbage, spring onions and fragrant garlic.",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80"
  },

  // =================== EVENING SNACKS ===================
  {
    name: "Chennai Style Chicken 65 (Boneless)",
    category: "Evening Snacks",
    price: 90,
    isVeg: false,
    available: true,
    isAvailable: true,
    stock: 45,
    description: "Crispy and juicy boneless chicken bites marinated with fiery red chillies, ginger-garlic paste, yogurt, and deep-fried with crispy curry leaves and lemon wedges.",
    image: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Hot Canteen Egg Puffs (Freshly Baked)",
    category: "Evening Snacks",
    price: 25,
    isVeg: false,
    available: true,
    isAvailable: true,
    stock: 55,
    description: "All-time campus classic: Crisp, golden flaky puff pastry loaded with seasoned hard-boiled egg half and rich caramelized spicy onion masala.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Crispy Veg Samosa (2 pcs)",
    category: "Evening Snacks",
    price: 20,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 60,
    description: "Golden crunchy triangular pastries stuffed with spiced potatoes, green peas, and ajwain seeds. Served with tangy mint chutney and sweet tamarind sauce.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Vazhaipoo & Onion Crispy Pakoda",
    category: "Evening Snacks",
    price: 30,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Irresistibly crunchy fritters made with thinly sliced onions, banana blossom (vazhaipoo), fennel seeds, curry leaves, and besan. Perfect campus tea-time crunch.",
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Spicy Chilly Chicken (Dry/Gravy)",
    category: "Evening Snacks",
    price: 90,
    isVeg: false,
    available: true,
    isAvailable: true,
    stock: 40,
    description: "Indo-Tamil fusion chicken chunks stir-fried with slit green chillies, bell peppers, spring onions, and spicy dark soya sauce.",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80"
  },

  // =================== BEVERAGES & COOLERS ===================
  {
    name: "Kumbakonam Degree Filter Coffee",
    category: "Beverages & Coolers",
    price: 20,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 100,
    description: "Authentic first-decoction chicory blend coffee frothed to perfection with fresh hot milk, served piping hot in traditional South Indian style.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Masala Sukku Chai (Ginger Cardamom Tea)",
    category: "Beverages & Coolers",
    price: 15,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 100,
    description: "Steaming aromatic campus tea infused with freshly pounded dried ginger (sukku), green cardamom, and cloves. Energizing and refreshing.",
    image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Madurai Famous Jigarthanda",
    category: "Beverages & Coolers",
    price: 45,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Famous cooling royal Madurai dessert beverage prepared with natural almond gum (badam pisin), nannari roots syrup, reduced thickened milk (basundi) and vanilla ice cream.",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Chilled Rose Milk with Sabja Seeds",
    category: "Beverages & Coolers",
    price: 30,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 60,
    description: "Refreshing cold sweetened milk infused with fragrant rose essence and soaked cooling basil seeds (sabja). The ultimate summer beat in campus.",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80"
  }
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully! ✅");

    // Remove legacy generic non-Tamil items (Burger, Pizza, Sandwich) or archive them
    await Product.deleteMany({
      name: { $in: ["Burger", "Pizza", "Sandwich", "Veg Mushroom"] }
    });
    console.log("Cleaned up generic western items.");

    // Upsert all Tamil Nadu items
    for (const item of TAMIL_NADU_MENU) {
      let filter = { name: { $regex: new RegExp("^" + item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i") } };
      let existing = await Product.findOne(filter);

      // Also check fuzzy matches
      if (!existing) {
        if (item.name.includes("Chicken Biryani")) {
          existing = await Product.findOne({ name: { $regex: /chicken biriyani|biryani/i } });
        } else if (item.name.includes("Egg Puffs")) {
          existing = await Product.findOne({ name: { $regex: /egg puff/i } });
        } else if (item.name.includes("Veg Samosa")) {
          existing = await Product.findOne({ name: { $regex: /^samosa$/i } });
        } else if (item.name.includes("Chicken 65") || item.name.includes("Chilly Chicken")) {
          existing = await Product.findOne({ name: { $regex: /chilly chicken/i } });
        } else if (item.name.includes("Canteen Veg Fried Rice")) {
          existing = await Product.findOne({ name: { $regex: /^veg (fried )?rice/i } });
        } else if (item.name.includes("Tamil Canteen Chicken Fried Rice")) {
          existing = await Product.findOne({ name: { $regex: /^chicken rice/i } });
        }
      }

      if (existing) {
        Object.assign(existing, item);
        await existing.save();
        console.log(`Updated: ${existing.name} (₹${existing.price}, ${existing.category})`);
      } else {
        const created = await Product.create(item);
        console.log(`Created: ${created.name} (₹${created.price}, ${created.category})`);
      }
    }

    // Ensure egg items and chicken items have correct isVeg flags
    await Product.updateMany(
      { name: { $regex: /chicken|mutton/i } },
      { $set: { isVeg: false } }
    );
    await Product.updateMany(
      { name: { $regex: /egg/i } },
      { $set: { isVeg: false } }
    );

    // Update settings singleton to Tamil Nadu Canteen branding
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    settings.canteenName = "Namma Canteen (நம்ம Canteen)";
    settings.announcement = "வணக்கம்! Welcome to Namma Canteen. Authentic Tamil Nadu flavours freshly prepared daily — Pre-order & collect hot with zero queue!";
    settings.isOpen = true;
    settings.orderAcceptance = true;
    settings.openingTime = "07:30 AM";
    settings.closingTime = "07:00 PM";
    settings.pickupSlots = [
      "Immediate (10-15 mins)",
      "08:30 AM - 09:15 AM (Morning Tiffin Slot)",
      "12:30 PM - 01:15 PM (Lunch Break Slot 1)",
      "01:15 PM - 02:00 PM (Lunch Break Slot 2)",
      "03:45 PM - 04:30 PM (Evening Snacks & Tea)",
      "05:15 PM - 06:00 PM (Dinner & Takeaway)",
    ];
    await settings.save();
    console.log("Updated Canteen Settings to Namma Canteen branding! ✅");

    const count = await Product.countDocuments({ isArchived: { $ne: true } });
    console.log(`Total live items in Namma Canteen: ${count} 🎉`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
