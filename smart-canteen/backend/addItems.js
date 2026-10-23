require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/product");

const targetItems = [
  {
    name: "Veg Fried Rice",
    category: "Veg Specials",
    price: 70,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Aromatic wok-tossed basmati rice with crunchy fresh veggies, spring onions, and delicate Asian seasoning.",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Veg Noodles",
    category: "Veg Specials",
    price: 70,
    isVeg: true,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Hot stir-fried hakka noodles loaded with shredded cabbage, bell peppers, carrots, and savory sauces.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Chicken Noodles",
    category: "Chicken Specials",
    price: 100,
    isVeg: false,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Spicy street-style wok noodles tossed with tender boneless chicken bites, egg shreds, and garlic.",
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Chicken Rice",
    category: "Chicken Specials",
    price: 100,
    isVeg: false,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Classic canteen-style chicken fried rice with seasoned juicy chicken cubes, fluffy rice, and spring onions.",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Chicken Biriyani",
    category: "Chicken Specials",
    price: 120,
    isVeg: false,
    available: true,
    isAvailable: true,
    stock: 50,
    description: "Rich and aromatic dum-cooked long-grain basmati biriyani served with tender spiced chicken and authentic spices.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80"
  }
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully ✅");

    for (const item of targetItems) {
      let filter = { name: { $regex: new RegExp("^" + item.name + "$", "i") } };
      let existing = await Product.findOne(filter);

      if (!existing && item.name === "Chicken Biriyani") {
        existing = await Product.findOne({ name: { $regex: /^biryani$/i } });
      }
      if (!existing && item.name === "Veg Fried Rice") {
        existing = await Product.findOne({ name: { $regex: /^veg fried rice special$/i } });
      }

      if (existing) {
        Object.assign(existing, item);
        await existing.save();
        console.log(`Updated dish: "${existing.name}" | ₹${existing.price} | Veg: ${existing.isVeg}`);
      } else {
        const created = await Product.create(item);
        console.log(`Added new dish: "${created.name}" | ₹${created.price} | Veg: ${created.isVeg}`);
      }
    }

    // Ensure all chicken items are correctly flagged as isVeg: false
    await Product.updateMany(
      { name: { $regex: /chicken/i } },
      { $set: { isVeg: false, category: "Chicken Specials" } }
    );

    console.log("All requested food items added and updated successfully in MongoDB! 🎉");
    process.exit(0);
  } catch (error) {
    console.error("Error adding items:", error);
    process.exit(1);
  }
}

run();
