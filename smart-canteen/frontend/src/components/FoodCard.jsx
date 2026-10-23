import React from "react";
import { Plus, Minus, Flame, Sparkles, AlertCircle, Heart } from "lucide-react";

// Tamil names lookup for authentic touch
const TAMIL_NAMES = {
  // Dosa & Tiffins
  "ghee roast dosa": "நெய் ரோஸ்ட் தோசை",
  "ghee roast": "நெய் ரோஸ்ட் தோசை",
  "masala dosa": "மசாலா தோசை",
  "plain dosa": "சாதா தோசை",
  "onion uthappam": "வெங்காய ஊத்தப்பம்",
  "uthappam": "ஊத்தப்பம்",
  "kal dosa": "கல் தோசை",
  "idli sambar": "இட்லி சாம்பார்",
  "ghee podi idli": "நெய் பொடி இட்லி",
  "podi idli": "பொடி இட்லி",
  "idli": "இட்லி",
  "medu vada": "மெது வடை",
  "sambar vada": "சாம்பார் வடை",
  "vada": "வடை",
  "ghee ven pongal": "நெய் வெண் பொங்கல்",
  "ven pongal": "வெண் பொங்கல்",
  "pongal": "பொங்கல்",
  "poori masala": "பூரி மசாலா",
  "poori": "பூரி மசாலா",

  // Meals & Rice
  "south indian veg meals": "தென்னிந்திய சாப்பாடு / மீல்ஸ்",
  "south indian meals": "தென்னிந்திய சாப்பாடு",
  "veg meals": "வெஜ் மீல்ஸ் / சாப்பாடு",
  "meals": "மதிய சாப்பாடு",
  "ghee sambar rice": "நெய் சாம்பார் சாதம்",
  "sambar rice": "சாம்பார் சாதம்",
  "sambar sadam": "சாம்பார் சாதம்",
  "curd rice": "தயிர் சாதம்",
  "thayir sadam": "தயிர் சாதம்",
  "lemon rice": "எலுமிச்சை சாதம்",
  "tomato rice": "தக்காளி சாதம்",

  // Parotta & Biriyani
  "chicken biryani": "சிக்கன் பிரியாணி",
  "veg biryani": "வெஜ் பிரியாணி",
  "biryani": "பிரியாணி",
  "parotta with salna": "பரோட்டா சால்னா",
  "bun parotta": "பன் பரோட்டா & சால்னா",
  "parotta": "பரோட்டா",
  "egg kothu parotta": "முட்டை கொத்து பரோட்டா",
  "chicken kothu parotta": "சிக்கன் கொத்து பரோட்டா",
  "kothu parotta": "கொத்து பரோட்டா",
  "chicken fried rice": "சிக்கன் ஃப்ரைட் ரைஸ்",
  "veg fried rice": "வெஜ் ஃப்ரைட் ரைஸ்",
  "egg fried rice": "எக் ஃப்ரைட் ரைஸ்",
  "fried rice": "ஃப்ரைட் ரைஸ்",
  "chettinad pepper chicken": "செட்டிநாடு பெப்பர் சிக்கன்",
  "pepper chicken": "பெப்பர் சிக்கன்",

  // Evening Snacks
  "chicken 65": "சிக்கன் 65",
  "egg puffs": "எக் பஃப்ஸ்",
  "veg puffs": "வெஜ் பஃப்ஸ்",
  "puffs": "பஃப்ஸ்",
  "veg samosa": "வெஜ் சமோசா",
  "samosa": "சமோசா",
  "onion pakoda": "வெங்காய பக்கோடா",
  "pakoda": "பக்கோடா",
  "chilli chicken": "சில்லி சிக்கன்",

  // Beverages & Coolers
  "filter coffee": "கும்பகோணம் டிகிரி காபி",
  "coffee": "பில்டர் காபி",
  "masala tea": "மசாலா டீ",
  "ginger tea": "இஞ்சி டீ",
  "sukku chai": "சுக்கு டீ",
  "tea": "சூடான டீ",
  "chai": "டீ",
  "madurai jigarthanda": "மதுரை ஜிகர்தண்டா",
  "jigarthanda": "ஜிகர்தண்டா",
  "rose milk": "குளிர்ந்த ரோஸ் மில்க்",
  "fresh lemon juice": "எலுமிச்சை ஜூஸ்",
  "lemon juice": "எலுமிச்சை ஜூஸ்",
};

function getTamilSubtitle(name = "") {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  for (const [key, tamil] of Object.entries(TAMIL_NAMES)) {
    if (lower.includes(key)) return tamil;
  }
  for (const [key, tamil] of Object.entries(TAMIL_NAMES)) {
    if (key.includes(lower)) return tamil;
  }
  return null;
}

function getHighlightBadge(name = "", category = "") {
  const lower = name.toLowerCase();
  if (lower.includes("biryani") || lower.includes("dosa")) return "⭐ Campus Bestseller";
  if (lower.includes("kothu") || lower.includes("65")) return "🔥 Kitchen Special";
  if (lower.includes("coffee") || lower.includes("jigarthanda")) return "✨ Must Try";
  if (lower.includes("podi") || lower.includes("pongal")) return "🌿 Desi Ghee Special";
  if (lower.includes("meals")) return "🍱 Lunch Special";
  return null;
}

export default function FoodCard({ food, cartQuantity = 0, onAdd, onUpdateQuantity }) {
  const isAvailable = food.available !== false && food.isAvailable !== false;
  const isVeg = food.isVeg !== undefined ? food.isVeg : !food.name?.toLowerCase().includes("chicken");

  const imageUrl =
    food.imageUrl ||
    food.image ||
    "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80";

  const tamilTitle = getTamilSubtitle(food.name);
  const highlight = getHighlightBadge(food.name, food.category);

  return (
    <article className={`food-card ${!isAvailable ? "sold-out-card" : ""}`}>
      {/* Food Image Container */}
      <div className="food-img-wrapper">
        <img
          src={imageUrl}
          alt={food.name}
          className="food-img"
          loading="lazy"
          onError={(e) => {
            const current = e.currentTarget.getAttribute("src") || "";
            if (current.startsWith("/images/") && !current.startsWith("http")) {
              const backendUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
              e.currentTarget.src = `${backendUrl}${current}`;
            } else {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80";
            }
          }}
        />

        {/* FSSAI Dietary Symbol */}
        <div className={`diet-symbol-box ${isVeg ? "veg" : "non-veg"}`} title={isVeg ? "100% Vegetarian" : "Non-Vegetarian"}>
          <div className="diet-symbol-inner"></div>
        </div>

        {/* Category Pill */}
        <span className="category-pill">{food.category || "Tamil Canteen"}</span>

        {/* Highlight Badge */}
        {highlight && (
          <span className="highlight-tag">{highlight}</span>
        )}

        {/* Out of Stock Overlay */}
        {!isAvailable && (
          <div className="out-of-stock-overlay">
            <AlertCircle size={20} />
            <span>Currently Finished</span>
          </div>
        )}
      </div>

      {/* Food Info */}
      <div className="food-details">
        <div className="title-row">
          <div className="name-wrapper">
            <h3 className="food-name" title={food.name}>
              {food.name}
            </h3>
            {tamilTitle && <span className="food-tamil-name">{tamilTitle}</span>}
          </div>
          <span className="food-price">₹{food.price}</span>
        </div>

        {food.description ? (
          <p className="food-desc" title={food.description}>
            {food.description}
          </p>
        ) : (
          <p className="food-desc muted">Freshly made hot Tamil Nadu canteen item.</p>
        )}

        {/* Add to Cart Actions */}
        <div className="card-actions">
          {!isAvailable ? (
            <button type="button" className="action-btn disabled" disabled>
              Sold Out
            </button>
          ) : cartQuantity > 0 ? (
            <div className="qty-control-inline">
              <button
                type="button"
                className="qty-btn minus"
                onClick={() => onUpdateQuantity(food._id, cartQuantity - 1)}
                title="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span className="qty-value">{cartQuantity}</span>
              <button
                type="button"
                className="qty-btn plus"
                onClick={() => onUpdateQuantity(food._id, cartQuantity + 1)}
                title="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="action-btn add-btn"
              onClick={() => onAdd(food)}
            >
              <Plus size={16} />
              <span>Add to Tray</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
