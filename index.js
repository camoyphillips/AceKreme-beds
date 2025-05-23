// Import required modules
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient, ObjectId } from "mongodb";

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up MongoDB client and retrieve database
const dburl = "mongodb://localhost:27017/";
const client = new MongoClient(dburl);
const dbName = "Test";
let db;

const app = express();
const PORT = process.env.PORT || 3000;

// Fix middleware syntax
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Function to get dynamic nav links
async function getLinks() {
  try {
    const collection = db.collection("bedlinks");
    const result = await collection.find().toArray();
    return result.map(doc => ({
      href: doc.href || "#",
      text: doc.text || "Link"
    }));
  } catch (err) {
    console.error("Error fetching links:", err);
    return [];
  }
}

// MongoDB Function to delete a link by ID
async function deleteLink(id) {
  try {
    const result = await db.collection("bedlinks").deleteOne({ _id: new ObjectId(id) });
    return result;
  } catch (err) {
    console.error("Error deleting link:", err);
    return null;
  }
}

// Route to handle deletion
app.get('/delete/:id', async (req, res) => {
  const id = req.params.id;
  await deleteLink(id);
  res.redirect('/admin/bed-list'); // Assuming this is your admin page
});

// CREATE form route (for adding bed links)
app.get('/admin/menu/add', async (req, res) => {
  const links = await getLinks();
  res.render('bed-add', {
    title: 'Add Bed Link',
    links
  });
});

// POST handler for form submission (create new link)
app.post('/admin/menu/add/submit', async (req, res) => {
  try {
    const { name, href } = req.body;
    await db.collection("bedlinks").insertOne({ text: name, href: href });
    res.redirect('/admin/bed-list');
  } catch (err) {
    console.error("Error inserting link:", err);
    res.status(500).send("Error inserting link");
  }
});

// Home Route
app.get('/', async (req, res) => {
  const links = await getLinks();
  res.render('home', {
    title: 'Home - AceKreme Inc.',
    links
  });
});

// About Route
app.get('/about', async (req, res) => {
  const links = await getLinks();
  res.render('about', {
    title: 'About - AceKreme Inc.',
    links
  });
});

// Products Route
app.get('/products', async (req, res) => {
  const links = await getLinks();
  const products = [
    { title: 'Classic Queen Bed', price: 299, imageSrc: '/images/bed1.jpg', altText: 'Classic Queen Bed' },
    { title: 'Modern King Bed', price: 399, imageSrc: '/images/bed2.jpg', altText: 'Modern King Bed' },
    { title: 'Kids Bed', price: 199, imageSrc: '/images/bed3.jpg', altText: 'Kids Bed' }
  ];
  res.render('products', {
    title: 'Products - AceKreme Inc.',
    products,
    links
  });
});

// Contact Route
app.get('/contact', async (req, res) => {
  const links = await getLinks();
  res.render('contact', {
    title: 'Contact - AceKreme Inc.',
    links
  });
});

// Error Handling Middleware
app.use(async (req, res) => {
  const links = await getLinks();
  res.status(404).render('404', {
    title: 'Page Not Found - AceKreme Inc.',
    links
  });
});

// Connect to MongoDB and start the server
async function startServer() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

startServer();
