const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Настройка multer для сохранения файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Сохраняем файлы с оригинальными именами
    }
});
const upload = multer({ storage: storage });

// Раздача статических файлов из папки 'uploads'
app.use('/uploads', express.static('uploads'));
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Настройка подключения к базе данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'NezhnayaVanill'
});

db.connect((err) => {
    if (err) {
        return console.error('Ошибка подключения: ' + err.message);
    }
    console.log('Подключено к базе данных MySQL');
});

// Маршрут для регистрации пользователя
app.post('/register', (req, res) => {
    const { email, password, firstName, lastName, phone, city, address, postalCode } = req.body;
    if (!email || !password || !firstName || !lastName || !phone || !city || !address || !postalCode) {
        return res.status(400).send({ message: 'Все поля должны быть заполнены!' });
    }

    const query = `INSERT INTO users (email, password, first_name, last_name, phone, city, address, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [email, password, firstName, lastName, phone, city, address, postalCode], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Ошибка при регистрации пользователя', error: err });
        }
        res.redirect('/index.html');
    });
});

// Добавление категории
app.post('/add-category', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).send({ message: 'Необходимо указать название категории!' });
    }

    const query = 'INSERT INTO catalog (name) VALUES (?)';
    db.query(query, [name], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Ошибка при добавлении категории', error: err });
        }
        res.send({ message: 'Категория успешно добавлена', catalogId: result.insertId });
    });
});

// Получение списка категорий
app.get('/get-categories', (req, res) => {
    db.query('SELECT * FROM catalog', (err, results) => {
        if (err) {
            return res.status(500).send({ message: 'Ошибка при получении категорий', error: err });
        }
        res.json({ categories: results });
    });
});

// Маршрут для получения продуктов
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            console.error('Ошибка при получении продуктов:', err);
            return res.status(500).send({ message: 'Ошибка сервера при получении данных о продуктах', error: err });
        }
        res.json(results);
    });
});

// Добавление продукта
app.post('/add-product', upload.single('product-photo'), (req, res) => {
    const { name, price, description, quantity, categories } = req.body;
    const photo = req.file ? req.file.path : null; // Получение пути файла

    if (!name || !price || !description || !quantity) {
        return res.status(400).send({ message: "Все поля должны быть заполнены" });
    }

    const query = `INSERT INTO products (name, price, description, quantity, categories, photo_url) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(query, [name, price, description, quantity, JSON.stringify(categories), photo], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Ошибка при добавлении продукта', error: err });
        }
        res.send({ message: 'Продукт успешно добавлен', productId: result.insertId });
    });
});

// Явное обслуживание index.html
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
