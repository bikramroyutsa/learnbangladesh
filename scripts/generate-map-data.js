const fs = require("fs");
const path = require("path");

const geojson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/data/bangladesh-districts.json"), "utf8")
);

function toMercator(lon, lat) {
  const x = lon;
  const latRad = (lat * Math.PI) / 180;
  const y = (Math.log(Math.tan(Math.PI / 4 + latRad / 2)) * 180) / Math.PI;
  return [x, y];
}

const minLon = 88.0086;
const maxLon = 92.6803;
const minLat = 20.5906;
const maxLat = 26.6345;

const [minX, minY] = toMercator(minLon, minLat);
const [maxX, maxY] = toMercator(maxLon, maxLat);

// Standard map canvas dimensions matching bdmapdistricts.jpg aspect ratio
const width = 1000;
const height = 1430;
const pad = 36;

const drawW = width - 2 * pad;
const drawH = height - 2 * pad;

const scale = Math.min(drawW / (maxX - minX), drawH / (maxY - minY));
const offsetX = pad + (drawW - (maxX - minX) * scale) / 2;
const offsetY = pad + (drawH - (maxY - minY) * scale) / 2;

function project(lon, lat) {
  const [mx, my] = toMercator(lon, lat);
  const px = offsetX + (mx - minX) * scale;
  const py = offsetY + (maxY - my) * scale;
  return [Math.round(px * 10) / 10, Math.round(py * 10) / 10];
}

function ringToPath(ring) {
  return ring
    .map((pt, i) => {
      const [x, y] = project(pt[0], pt[1]);
      return (i === 0 ? "M" : "L") + x + " " + y;
    })
    .join(" ") + " Z";
}

function geomToPath(geom) {
  if (geom.type === "Polygon") {
    return geom.coordinates.map(ringToPath).join(" ");
  } else if (geom.type === "MultiPolygon") {
    return geom.coordinates.map((poly) => poly.map(ringToPath).join(" ")).join(" ");
  }
  return "";
}

function getBoundsAndCenter(feature) {
  let minPX = Infinity, maxPX = -Infinity, minPY = Infinity, maxPY = -Infinity;
  let sumX = 0, sumY = 0, count = 0;

  function process(coords) {
    if (typeof coords[0] === "number") {
      const [px, py] = project(coords[0], coords[1]);
      if (px < minPX) minPX = px;
      if (px > maxPX) maxPX = px;
      if (py < minPY) minPY = py;
      if (py > maxPY) maxPY = py;
      sumX += px;
      sumY += py;
      count++;
    } else {
      coords.forEach(process);
    }
  }

  process(feature.geometry.coordinates);
  return {
    center: [Math.round((sumX / count) * 10) / 10, Math.round((sumY / count) * 10) / 10],
    bbox: [Math.round(minPX * 10) / 10, Math.round(minPY * 10) / 10, Math.round(maxPX * 10) / 10, Math.round(maxPY * 10) / 10]
  };
}

// Rich data for all 64 districts
const districtMeta = {
  Bagerhat: {
    bnName: "বাগেরহাট",
    division: "Khulna",
    color: "#67e8f9", // Light cyan
    famousFor: "Historic Mosque City of Bagerhat (Sixty Dome Mosque), Sundarbans mangrove forest, shrimp farming",
    area: "3,959 km²",
    population: "1.6 Million"
  },
  Bandarban: {
    bnName: "বান্দরবান",
    division: "Chittagong",
    color: "#c7d2fe", // Soft lavender
    famousFor: "Nilgiri, Keokradong, Nafakhum waterfall, Golden Temple (Buddha Dhatu Jadi), scenic mountain ranges",
    area: "4,479 km²",
    population: "0.5 Million"
  },
  Barguna: {
    bnName: "বরগুনা",
    division: "Barisal",
    color: "#38bdf8", // Sky blue
    famousFor: "Kuakata adjacent coast, Shuvo Sandhya Sea Beach, Horinghata mangrove forest",
    area: "1,831 km²",
    population: "1.0 Million"
  },
  Barisal: {
    bnName: "বরিশাল",
    division: "Barisal",
    color: "#fbcfe8", // Soft pink
    famousFor: "Floating Guava Market of Bhimruli, Venice of Bengal, Hilsa fish, Balam rice",
    area: "2,785 km²",
    population: "2.5 Million"
  },
  Bhola: {
    bnName: "ভোলা",
    division: "Barisal",
    color: "#a5b4fc", // Periwinkle
    famousFor: "Largest island district of Bangladesh, Monpura Island, Char Kukri Mukri, buffalo milk curd",
    area: "3,403 km²",
    population: "1.9 Million"
  },
  Bogra: {
    bnName: "বগুড়া",
    division: "Rajshahi",
    color: "#10b981", // Vivid emerald green
    famousFor: "World-renowned Bogra Doi (curd), Mahasthangarh archaeological site, Kherua Mosque",
    area: "2,899 km²",
    population: "3.7 Million"
  },
  Brahamanbaria: {
    displayName: "B.Baria",
    bnName: "ব্রাহ্মণবাড়িয়া",
    division: "Chittagong",
    color: "#fbcfe8", // Pale pink
    famousFor: "Cultural capital of music (Ustad Alauddin Khan), Chana Mukhi sweet, Titas Gas field",
    area: "1,881 km²",
    population: "3.3 Million"
  },
  Chandpur: {
    bnName: "চাঁদপুর",
    division: "Chittagong",
    color: "#fed7aa", // Pale peach/pink
    famousFor: "City of Hilsa, Meghna & Padma river confluence (Molla Head), naval transport hub",
    area: "1,645 km²",
    population: "2.6 Million"
  },
  Chittagong: {
    displayName: "Chittagong",
    bnName: "চট্টগ্রাম",
    division: "Chittagong",
    color: "#a7f3d0", // Mint green
    famousFor: "Commercial capital & premier seaport, Patenga Beach, Foy's Lake, Chittagong Mezban beef",
    area: "5,283 km²",
    population: "9.1 Million"
  },
  Chuadanga: {
    bnName: "চুয়াডাঙ্গা",
    division: "Khulna",
    color: "#7dd3fc", // Light cyan
    famousFor: "First temporary capital of independent Bangladesh (Mujibnagar border), Carew & Co distillery",
    area: "1,174 km²",
    population: "1.2 Million"
  },
  Comilla: {
    displayName: "Comilla",
    bnName: "কুমিল্লা",
    division: "Chittagong",
    color: "#bfdbfe", // Cornflower blue
    famousFor: "Comilla Rasmalai, Shalban Vihara, Mainamati Buddhist ruins, Khadi cloth",
    area: "3,146 km²",
    population: "6.2 Million"
  },
  "Cox's Bazar": {
    displayName: "Cox's Bazar",
    bnName: "কক্সবাজার",
    division: "Chittagong",
    color: "#d9f99d", // Lime green
    famousFor: "World's longest unbroken natural sea beach (120 km), Himchari, Inani Beach, Saint Martin's Island",
    area: "2,492 km²",
    population: "2.8 Million"
  },
  Dhaka: {
    displayName: "Dhaka",
    bnName: "ঢাকা",
    division: "Dhaka",
    color: "#f472b6", // Vivid magenta/rose
    isCapital: true,
    famousFor: "Capital of Bangladesh, Lalbagh Fort, Ahsan Manzil, National Parliament House (Jatiya Sangsad), Biryani",
    area: "1,464 km²",
    population: "14.7 Million"
  },
  Dinajpur: {
    bnName: "দিনাজপুর",
    division: "Rangpur",
    color: "#38bdf8", // Sky blue
    famousFor: "Kantajew Temple (exquisite terracotta), aromatic Kataribhog rice, Lychee orchards, Ramsagar Lake",
    area: "3,444 km²",
    population: "3.3 Million"
  },
  Faridpur: {
    bnName: "ফরিদপুর",
    division: "Dhaka",
    color: "#e9d5ff", // Light purple
    famousFor: "Birthplace of poet Jasimuddin, Kanaipur Zamindar Bari, Jute production hub",
    area: "2,052 km²",
    population: "2.1 Million"
  },
  Feni: {
    bnName: "ফেনী",
    division: "Chittagong",
    color: "#34d399", // Emerald mint
    famousFor: "Muhuri Project (river regulator & eco-park), Gateway to Chittagong, historical Bijoysing Dighi",
    area: "990 km²",
    population: "1.6 Million"
  },
  Gaibandha: {
    bnName: "গাইবান্ধা",
    division: "Rangpur",
    color: "#fbcfe8", // Soft pastel pink
    famousFor: "Brahmaputra river sandbars (chars), Balashighat, Rasmanjari sweets",
    area: "2,115 km²",
    population: "2.5 Million"
  },
  Gazipur: {
    bnName: "গাজীপুর",
    division: "Dhaka",
    color: "#a5b4fc", // Soft purple-blue
    famousFor: "Bhawal National Park, Bangabandhu Safari Park, industrial powerhouse & university city",
    area: "1,806 km²",
    population: "5.2 Million"
  },
  Gopalganj: {
    bnName: "গোপালগঞ্জ",
    division: "Dhaka",
    color: "#22c55e", // Bright green
    famousFor: "Mausoleum of Bangabandhu Sheikh Mujibur Rahman in Tungipara, scenic wetlands (beels)",
    area: "1,469 km²",
    population: "1.2 Million"
  },
  Habiganj: {
    bnName: "হবিগঞ্জ",
    division: "Sylhet",
    color: "#0284c7", // Deep teal cyan
    famousFor: "Satchari National Park, Rema-Kalenga Wildlife Sanctuary, sprawling lush tea gardens",
    area: "2,637 km²",
    population: "2.3 Million"
  },
  Jamalpur: {
    bnName: "জামালপুর",
    division: "Mymensingh",
    color: "#f472b6", // Rose pink
    famousFor: "Nakshi Kantha handicrafts, Garo Hills foothill scenery, sweet milk monda",
    area: "2,115 km²",
    population: "2.5 Million"
  },
  Jessore: {
    displayName: "Jessore",
    bnName: "যশোর",
    division: "Khulna",
    color: "#bbf7d0", // Light green
    famousFor: "First liberated district (1971), Michael Madhusudan Dutt memorial at Sagardari, Date palm jaggery (Patali Gur), flower capital (Gadkhali)",
    area: "2,607 km²",
    population: "3.0 Million"
  },
  Jhalokati: {
    bnName: "ঝালকাঠি",
    division: "Barisal",
    color: "#fed7aa", // Pale peach
    famousFor: "Floating guava market, handmade cooler reed mats (Sheetal Pati), Sujabad Fort ruins",
    area: "707 km²",
    population: "0.7 Million"
  },
  Jhenaidah: {
    bnName: "ঝিনাইদহ",
    division: "Khulna",
    color: "#bae6fd", // Light blue
    famousFor: "Lalon Shah shrine proximity, Naldanga Zamindar Palace, Banana capital of Bangladesh",
    area: "1,965 km²",
    population: "2.0 Million"
  },
  Joypurhat: {
    bnName: "জয়পুরহাট",
    division: "Rajshahi",
    color: "#fef08a", // Light yellow
    famousFor: "Hili Land Port, Lokma Rajbari, sugar mills, limestone and mineral deposits",
    area: "1,012 km²",
    population: "1.0 Million"
  },
  Khagrachhari: {
    displayName: "Khagrachari",
    bnName: "খাগড়াছড়ি",
    division: "Chittagong",
    color: "#fbcfe8", // Pink
    famousFor: "Sajek Valley (kingdom of clouds), Alutila mysterious cave, Richhang Falls",
    area: "2,700 km²",
    population: "0.7 Million"
  },
  Khulna: {
    bnName: "খুলনা",
    division: "Khulna",
    color: "#67e8f9", // Cyan
    famousFor: "Gateway to the Sundarbans Royal Bengal Tigers, Rupsha River, historic industrial and port city",
    area: "4,394 km²",
    population: "2.6 Million"
  },
  Kishoreganj: {
    bnName: "কিশোরগঞ্জ",
    division: "Dhaka",
    color: "#e9d5ff", // Light violet
    famousFor: "Nikli Haor eco-tourism, historic Sholakia Eidgah (one of largest Eid congregations), Isha Khan Junglebari Fort",
    area: "2,689 km²",
    population: "3.2 Million"
  },
  Kurigram: {
    bnName: "কুড়িগ্রাম",
    division: "Rangpur",
    color: "#5eead4", // Mint turquoise
    famousFor: "Dharla and Brahmaputra rivers confluence, Chilmari river port, historic Chandi Mandir",
    area: "2,245 km²",
    population: "2.3 Million"
  },
  Kushtia: {
    bnName: "কুষ্টিয়া",
    division: "Khulna",
    color: "#f472b6", // Fuchsia pink
    famousFor: "Shrine of mystic bard Lalon Fakir, Rabindranath Tagore's Kuthibari in Shilaidaha, Hardinge Bridge",
    area: "1,608 km²",
    population: "2.1 Million"
  },
  Lakshmipur: {
    displayName: "Laxmipur",
    bnName: "লক্ষ্মীপুর",
    division: "Chittagong",
    color: "#10b981", // Emerald green
    famousFor: "Soybean capital of Bangladesh, Meghna coastal landscapes, historic Tita Khan Mosque",
    area: "1,440 km²",
    population: "1.9 Million"
  },
  Lalmonirhat: {
    bnName: "লালমনিরহাট",
    division: "Rangpur",
    color: "#c7d2fe", // Lavender
    famousFor: "Teesta Barrage (largest irrigation project), Tin Bigha Corridor, Mogholhat railway heritage",
    area: "1,247 km²",
    population: "1.4 Million"
  },
  Madaripur: {
    bnName: "মাদারীপুর",
    division: "Dhaka",
    color: "#34d399", // Emerald
    famousFor: "Shakuni Lake, scenic Padma Bridge southern approaches, molasses & Patali Gur",
    area: "1,145 km²",
    population: "1.3 Million"
  },
  Magura: {
    bnName: "মাগুরা",
    division: "Khulna",
    color: "#f4a7bb", // Rose
    famousFor: "Hometown of cricketer Shakib Al Hasan, Raja Sitaram Ray Palace, Siddheswari Kali temple",
    area: "1,048 km²",
    population: "1.0 Million"
  },
  Manikganj: {
    bnName: "মানিকগঞ্জ",
    division: "Dhaka",
    color: "#a7f3d0", // Mint
    famousFor: "Baliati Palace (magnificent 19th century zamindar palace), Dhaleshwari river charm",
    area: "1,383 km²",
    population: "1.5 Million"
  },
  Maulvibazar: {
    displayName: "Moulvibazar",
    bnName: "মৌলভীবাজার",
    division: "Sylhet",
    color: "#bae6fd", // Sky blue
    famousFor: "Sreemangal - Tea Capital of Bangladesh, Lawachara National Park, Madhabkunda Waterfall, Hum Hum Falls",
    area: "2,799 km²",
    population: "2.1 Million"
  },
  Meherpur: {
    bnName: "মেহেরপুর",
    division: "Khulna",
    color: "#22d3ee", // Cyan
    famousFor: "Historic Mujibnagar Memorial (Provisional Government of Bangladesh sworn in here in 1971)",
    area: "751 km²",
    population: "0.7 Million"
  },
  Munshiganj: {
    bnName: "মুন্সীগঞ্জ",
    division: "Dhaka",
    color: "#fef08a", // Soft yellow
    famousFor: "Idrakpur Fort, birthplace of Atisa Dipankara, Padma riverbank, largest potato hub",
    area: "1,004 km²",
    population: "1.6 Million"
  },
  Mymensingh: {
    bnName: "ময়মনসিংহ",
    division: "Mymensingh",
    color: "#fbcfe8", // Pale pink
    famousFor: "Shashi Lodge, Bangladesh Agricultural University, Brahmaputra riverfront, Mymensingh Gitika folklore",
    area: "4,395 km²",
    population: "5.8 Million"
  },
  Naogaon: {
    bnName: "নওগাঁ",
    division: "Rajshahi",
    color: "#67e8f9", // Bright aqua
    famousFor: "Somapura Mahavihara at Paharpur (UNESCO World Heritage Site), Kusumba Mosque, rice granary",
    area: "3,435 km²",
    population: "2.8 Million"
  },
  Narail: {
    bnName: "নড়াইল",
    division: "Khulna",
    color: "#fed7aa", // Peach
    famousFor: "Birthplace of legendary painter SM Sultan and cricketer Mashrafe Mortaza, Chitra River",
    area: "967 km²",
    population: "0.8 Million"
  },
  Narayanganj: {
    displayName: "N.Ganj",
    bnName: "নারায়ণগঞ্জ",
    division: "Dhaka",
    color: "#6ee7b7", // Mint green
    famousFor: "Historic Panam City (Sonargaon), Folk Art Museum, Sonakanda Fort, Jamdani saree heritage",
    area: "684 km²",
    population: "3.9 Million"
  },
  Narsingdi: {
    displayName: "Narshingdi",
    bnName: "নরসিংদী",
    division: "Dhaka",
    color: "#f9a8d4", // Pink lavender
    famousFor: "Wari-Bateshwar 2,500-year-old archaeological ruins, Sagar banana plantations, textile hub",
    area: "1,141 km²",
    population: "2.4 Million"
  },
  Natore: {
    bnName: "নাটোর",
    division: "Rajshahi",
    color: "#a5b4fc", // Periwinkle blue
    famousFor: "Natore Rajbari (Rani Bhabani Palace), famous Kachagolla sweet, Chalan Beel wetland",
    area: "1,900 km²",
    population: "1.8 Million"
  },
  Nawabganj: {
    displayName: "Nawabganj",
    bnName: "চাঁপাইনবাবগঞ্জ",
    division: "Rajshahi",
    color: "#06d6a0", // Bright mint green
    famousFor: "Mango Capital of Bangladesh (Fazli, Langra, Khirsapat), historic Choto Sona Mosque",
    area: "1,702 km²",
    population: "1.8 Million"
  },
  Netrakona: {
    displayName: "Netrokona",
    bnName: "নেত্রকোণা",
    division: "Mymensingh",
    color: "#0284c7", // Deep teal
    famousFor: "Birishiri Ceramic Hills and Durgapur Shomeshwari River, Haor wetlands, baul folk culture",
    area: "2,794 km²",
    population: "2.3 Million"
  },
  Nilphamari: {
    bnName: "নীলফামারী",
    division: "Rangpur",
    color: "#f4a7bb", // Soft rose lilac
    famousFor: "Historic indigo cultivation legacy, Saidpur Railway Workshop, Chini Mosque",
    area: "1,547 km²",
    population: "2.0 Million"
  },
  Noakhali: {
    bnName: "নোয়াখালী",
    division: "Chittagong",
    color: "#6ee7b7", // Mint
    famousFor: "Nijhum Dwip island (spotted deer sanctuary), Gandhi Ashram Trust, coastal char lands",
    area: "3,686 km²",
    population: "3.7 Million"
  },
  Pabna: {
    bnName: "পাবনা",
    division: "Rajshahi",
    color: "#ccfbf1", // Pale mint
    famousFor: "Rooppur Nuclear Power Plant, Paksey Hardinge Bridge & Lalon Shah Bridge, Mental Hospital",
    area: "2,376 km²",
    population: "2.9 Million"
  },
  Panchagarh: {
    bnName: "পঞ্চগড়",
    division: "Rangpur",
    color: "#a8d8ea", // Sky blue
    famousFor: "Northernmost district, view of Himalayan peaks (Kanchenjunga), plainland tea gardens, Tetulia",
    area: "1,404 km²",
    population: "1.1 Million"
  },
  Patuakhali: {
    bnName: "পটুয়াখালী",
    division: "Barisal",
    color: "#fef08a", // Soft yellow
    famousFor: "Kuakata 'Daughter of the Sea' (panoramic view of both sunrise and sunset from the same beach)",
    area: "3,221 km²",
    population: "1.7 Million"
  },
  Pirojpur: {
    displayName: "Perojpur",
    bnName: "পিরোজপুর",
    division: "Barisal",
    color: "#f4a7bb", // Soft pink
    famousFor: "Floating guava market, Baleshwar River, Rayerkathi Zamindar Bari, coconut groves",
    area: "1,307 km²",
    population: "1.2 Million"
  },
  Rajbari: {
    bnName: "রাজবাড়ী",
    division: "Dhaka",
    color: "#67e8f9", // Bright cyan
    famousFor: "Daulatdia river ferry port, historic railway junction of Goalanda, famous Chamcham sweets",
    area: "1,118 km²",
    population: "1.1 Million"
  },
  Rajshahi: {
    bnName: "রাজশাহী",
    division: "Rajshahi",
    color: "#c7d2fe", // Periwinkle
    famousFor: "Silk City and Education City, Varendra Research Museum, Padma River promenade, sweet mangoes",
    area: "2,425 km²",
    population: "2.9 Million"
  },
  Rangamati: {
    bnName: "রাঙ্গামাটি",
    division: "Chittagong",
    color: "#34d399", // Emerald green
    famousFor: "Largest district of Bangladesh, scenic Kaptai Lake, Hanging Bridge, Shuvolong Waterfall, tribal crafts",
    area: "6,116 km²",
    population: "0.6 Million"
  },
  Rangpur: {
    bnName: "রংপুর",
    division: "Rangpur",
    color: "#f472b6", // Vivid pink
    famousFor: "Tajhat Palace, Begum Rokeya University, Chikli Beel, traditional Shataranji handloom mats",
    area: "2,367 km²",
    population: "3.2 Million"
  },
  Satkhira: {
    bnName: "সাতক্ষীরা",
    division: "Khulna",
    color: "#c7d2fe", // Soft lavender blue
    famousFor: "Sundarbans eco-tourism gateway, pristine Sundarban honey, Sandesh sweets, shrimp farming",
    area: "3,817 km²",
    population: "2.2 Million"
  },
  Shariatpur: {
    bnName: "শরীয়তপুর",
    division: "Dhaka",
    color: "#14b8a6", // Teal
    famousFor: "Padma Bridge northern alignment, named after Haji Shariatullah, Fatehabad zamindar heritage",
    area: "1,174 km²",
    population: "1.2 Million"
  },
  Sherpur: {
    bnName: "শেরপুর",
    division: "Mymensingh",
    color: "#0284c7", // Vivid teal
    famousFor: "Gajni Holiday Complex, Madhutila Eco Park, scenic Indo-Bangla border hills",
    area: "1,364 km²",
    population: "1.5 Million"
  },
  Sirajganj: {
    bnName: "সিরাজগঞ্জ",
    division: "Rajshahi",
    color: "#f4a7bb", // Rose
    famousFor: "Bangabandhu Jamuna Bridge, handloom saree weaving industry, Rabindranath Tagore Kuthibari at Shahjadpur",
    area: "2,497 km²",
    population: "3.3 Million"
  },
  Sunamganj: {
    bnName: "সুনামগঞ্জ",
    division: "Sylhet",
    color: "#bbf7d0", // Light mint green
    famousFor: "Tanguar Haor (Ramsar site wetland), Shimul Bagan red flower garden, mystic poet Hason Raja's land",
    area: "3,672 km²",
    population: "2.6 Million"
  },
  Sylhet: {
    bnName: "সিলেট",
    division: "Sylhet",
    color: "#e0f2fe", // Pale ice blue
    famousFor: "Shrine of Hazrat Shah Jalal & Shah Paran, Jaflong stone collection, Ratargul Swamp Forest, Seven-layer tea",
    area: "3,452 km²",
    population: "3.9 Million"
  },
  Tangail: {
    bnName: "টাঙ্গাইল",
    division: "Dhaka",
    color: "#bae6fd", // Soft sky blue
    famousFor: "World-famous Tangail Saree, Porabari Chamcham sweets, 201 Dome Mosque, Jamuna River charms",
    area: "3,414 km²",
    population: "4.0 Million"
  },
  Thakurgaon: {
    bnName: "ঠাকুরগাঁও",
    division: "Rangpur",
    color: "#d4f199", // Lime
    famousFor: "Baliadangi Suryapuri ancient mango tree (centuries old), Tangon River, sugar mills",
    area: "1,781 km²",
    population: "1.5 Million"
  }
};

// Process all features
const processedDistricts = geojson.features.map((feature) => {
  const shapeName = feature.properties.shapeName;
  const meta = districtMeta[shapeName] || {};
  const { center, bbox } = getBoundsAndCenter(feature);
  const pathD = geomToPath(feature.geometry);

  const id = shapeName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const displayName = meta.displayName || shapeName;

  return {
    id,
    shapeName,
    displayName,
    bnName: meta.bnName || shapeName,
    division: meta.division || "Other",
    color: meta.color || "#e2e8f0",
    famousFor: meta.famousFor || "Cultural and historical district in Bangladesh",
    area: meta.area || "N/A",
    population: meta.population || "N/A",
    isCapital: !!meta.isCapital,
    centroid: center,
    bbox,
    path: pathD
  };
});

// Sort by displayName
processedDistricts.sort((a, b) => a.displayName.localeCompare(b.displayName));

const tsOutput = `// Auto-generated Bangladesh 64 Districts Map Data
// Source: GADM / geoBoundaries ADM2 with custom styling and metadata

export interface DistrictData {
  id: string;
  shapeName: string;
  displayName: string;
  bnName: string;
  division: string;
  color: string;
  famousFor: string;
  area: string;
  population: string;
  isCapital?: boolean;
  centroid: [number, number];
  bbox: [number, number, number, number];
  path: string;
}

export const VIEWBOX_WIDTH = ${width};
export const VIEWBOX_HEIGHT = ${height};

export const DIVISIONS = [
  "All",
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Khulna",
  "Barisal",
  "Sylhet",
  "Rangpur",
  "Mymensingh"
] as const;

export type DivisionName = typeof DIVISIONS[number];

export const DISTRICTS_DATA: DistrictData[] = ${JSON.stringify(processedDistricts, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, "../src/data/districtsData.ts"), tsOutput);
console.log("Successfully generated src/data/districtsData.ts with", processedDistricts.length, "districts!");

