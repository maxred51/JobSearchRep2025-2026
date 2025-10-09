const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./config/jwt');
const pool = require('./config/db');

// Routers
const administratorRouter = require('./routes/administrator');
const kategoriakandydataRouter = require('./routes/kategoriakandydata');
const kandydatRouter = require('./routes/kandydat');
const kategoriapracyRouter = require('./routes/kategoriapracy');
const firmaRouter = require('./routes/firma');
const pracownikHRRouter = require('./routes/pracownikHR');
const ofertaRouter = require('./routes/oferta');
const aplikacjaRouter = require('./routes/aplikacja');
const poziomRouter = require('./routes/poziom');
const ofertaPoziomRouter = require('./routes/oferta_poziom');
const trybRouter = require('./routes/tryb');
const ofertaTrybRouter = require('./routes/oferta_tryb');
const umowaRouter = require('./routes/umowa');
const ofertaUmowaRouter = require('./routes/oferta_umowa');
const wymiarRouter = require('./routes/wymiar');
const ofertaWymiarRouter = require('./routes/oferta_wymiar');
const kandydatKategoriaKandydataRouter = require('./routes/kandydat_kategoriakandydata');
const powiadomienieRouter = require('./routes/powiadomienie');
const wiadomoscRouter = require('./routes/wiadomosc');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set("io", io);


// Middleware globalne
app.use(cors());
app.use(express.json());

// Rejestracja routerów
app.use('/api/administrator', administratorRouter);
app.use('/api/kategoriakandydata', kategoriakandydataRouter);
app.use('/api/kandydat', kandydatRouter);
app.use('/api/kategoriapracy', kategoriapracyRouter);
app.use('/api/firma', firmaRouter);
app.use('/api/pracownikHR', pracownikHRRouter);
app.use('/api/oferta', ofertaRouter);
app.use('/api/aplikacja', aplikacjaRouter);
app.use('/api/poziom', poziomRouter);
app.use('/api/oferta_poziom', ofertaPoziomRouter);
app.use('/api/tryb', trybRouter);
app.use('/api/oferta_tryb', ofertaTrybRouter);
app.use('/api/umowa', umowaRouter);
app.use('/api/oferta_umowa', ofertaUmowaRouter);
app.use('/api/wymiar', wymiarRouter);
app.use('/api/oferta_wymiar', ofertaWymiarRouter);
app.use('/api/kandydat_kategoriakandydata', kandydatKategoriaKandydataRouter);
app.use('/api/powiadomienie', powiadomienieRouter);
app.use('/api/wiadomosc', wiadomoscRouter);

// Autoryzacja socketów
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Brak tokenu'));
    }
    const decoded = jwt.verify(token, config.secret);
    socket.user = decoded; // np. { id: 1, role: "kandydat" }
    next();
  } catch (err) {
    return next(new Error('Nieprawidłowy token'));
  }
});

// Obsługa socketów
io.on('connection', (socket) => {
  const { id, role } = socket.user;
  console.log(`Połączony: ${role}-${id}`);

  // użytkownik dołącza do swojego pokoju
  socket.join(`${role}-${id}`);

  // obsługa wysyłania wiadomości
  socket.on('message:send', async ({ odbiorca_id, odbiorca_typ, tresc }) => {
    try {
      const [result] = await pool.query(
        'INSERT INTO wiadomosc (nadawca_id, nadawca_typ, odbiorca_id, odbiorca_typ, tresc) VALUES (?,?,?,?,?)',
        [id, role, odbiorca_id, odbiorca_typ, tresc]
      );

      const newMessage = {
        id: result.insertId,
        nadawca_id: id,
        nadawca_typ: role,
        odbiorca_id,
        odbiorca_typ,
        tresc,
        przeczytane: false,
        data: new Date()
      };

      // wysyłamy wiadomość do odbiorcy
      io.to(`${odbiorca_typ}-${odbiorca_id}`).emit('message:receive', newMessage);
    } catch (err) {
      console.error('Błąd przy zapisie wiadomości:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Rozłączony: ${role}-${id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
