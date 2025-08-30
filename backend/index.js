const express = require('express');
const cors = require('cors');
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

const app = express();

app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});