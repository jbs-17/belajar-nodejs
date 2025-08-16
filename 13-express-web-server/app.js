const express = require('express');
const app = express();
const port = 3000;


express.application
express.response
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log([req.url, Date.now() - start, 'ms'].join(' '));
  });
  next();
})

app.get('/', (req, res) => {
  res.sendFile('./index.html', {
    root: __dirname
  });
});
app.get('/contact', (req, res) => {
  res.sendFile('./contact.html', {
    root: __dirname
  });
});

app.get('/about', (req, res) => {
  res.sendFile('./about.html', {
    root: __dirname
  });
});


app.get('/product/:id', (req, res) => {
  res.json({
    poduct: req.params.id,
    kategori: req.query.category
  })
});

// console.log(express.json());
// app.use('/json', (req, res, next)=>{
//   let data = '';
//   req.on('data', chunck => data += chunck);
//   req.on('end', ()=>{
//     console.log({data});
//     next()
//   })
// })
app.use('/json', express.json()); //akan stuck terus karena EVENT req on data dan on end sudah dipakai

app.post('/json', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  console.log({ json: req.body });
  console.log("body", req.body);
  res.json({})
})
  .get('/json', (req, res) => {
    res.end('apal')
  })
  .options('/json', (req, res) => {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE",
      "Access-Control-Allow-Headers": "Content-Type",
    })
    res.end();
  })


app.listen(port, () => {
  console.log(`App listening at port ${port}`);
});
