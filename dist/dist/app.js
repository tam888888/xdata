const express = require('express');
const http = require('http');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const path = require('path')
const compression = require("compression");
//, 'Flash Socket', 'AJAX long-polling'
// const socketIo = require('socket.io', {
//   maxHttpBufferSize: 1e11, rememberTransport: false,
//   // transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] 
// })

const skio = require('socket.io')
const socketIo = ({
  maxHttpBufferSize: 1e11, rememberTransport: false,
  // transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] 
})
const app = express();
const server = http.createServer(app);
const io = skio(server);
const numeral = require('numeral');
const { map, sectorCodeList } = require('./symbols.js')
const fs = require('fs')

app.use(
  compression({
      level: 9, // Mức nén tối đa
      threshold: 1024, // Chỉ nén nếu phản hồi > 1KB
      filter: (req, res) => {
          if (req.headers["x-no-compression"]) return false; // Không nén nếu client yêu cầu
          return compression.filter(req, res);
      },
  })
);

app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true, parameterLimit: 50000 }));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

function getNow() {
  let fd = new Date();
  return fd.getFullYear()
    + "" + (fd.getMonth() + 1 < 10 ? "0" + (fd.getMonth() + 1) : fd.getMonth() + 1)
    + "" + (fd.getDate() < 10 ? "0" + fd.getDate() : fd.getDate())
    + "" + (fd.getHours() < 10 ? "0" + fd.getHours() : fd.getHours())
    + "" + (fd.getMinutes() < 10 ? "0" + fd.getMinutes() : fd.getMinutes())
    + "" + (fd.getSeconds() < 10 ? "0" + fd.getSeconds() : fd.getSeconds());
}

function parseDateString(datestring) {
  if (!/^\d{8}$/.test(datestring)) {
    throw new Error("Invalid date format. Expected YYYYMMDD.");
  }

  let year = parseInt(datestring.substring(0, 4), 10);
  let month = parseInt(datestring.substring(4, 6), 10) - 1; // Tháng trong JS bắt đầu từ 0
  let day = parseInt(datestring.substring(6, 8), 10);

  let date = new Date(year, month, day);

  // Kiểm tra ngày hợp lệ (đề phòng trường hợp nhập sai ngày như 20240230)
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    throw new Error("Invalid date value.");
  }

  return date;
}

function getBeforeDate(d, dateBefore) {
  let today = dateBefore;
  today.setDate(today.getDate() - d); // Lùi lại 1 ngày
  let year = today.getFullYear();
  let month = today.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0
  let date = today.getDate();

  // Kiểm tra xem có phải Thứ Bảy hoặc Chủ Nhật không
  let dayOfWeek = today.getDay(); // 0: Chủ Nhật, 6: Thứ Bảy
  let weekend = (dayOfWeek === 0 || dayOfWeek === 6);

  return {
    format:
      year +
      "" +
      (month < 10 ? "0" + month : month) +
      "" +
      (date < 10 ? "0" + date : date),
    weekend: weekend,
  };
}

function getNowDate() {
  let fd = new Date();
  return fd.getFullYear()
    + "" + (fd.getMonth() + 1 < 10 ? "0" + (fd.getMonth() + 1) : fd.getMonth() + 1)
    + "" + (fd.getDate() < 10 ? "0" + fd.getDate() : fd.getDate());
}

function formatDate(fd) {
  return fd.getFullYear()
    + "" + (fd.getMonth() + 1 < 10 ? "0" + (fd.getMonth() + 1) : fd.getMonth() + 1)
    + "" + (fd.getDate() < 10 ? "0" + fd.getDate() : fd.getDate());
}

function formatDateShort(fd) {
  return (fd.getMonth() + 1 < 10 ? "0" + (fd.getMonth() + 1) : fd.getMonth() + 1)
    + "" + (fd.getDate() < 10 ? "0" + fd.getDate() : fd.getDate());
}

app.post('/api/post', (req, res) => {
  // Lấy dữ liệu từ yêu cầu POST
  var postData = JSON.stringify(req.body);
  // Thực hiện xử lý với dữ liệu, ví dụ: in ra console
  console.log('Received POST request with data:', postData.length);
  if (!fs.existsSync("./ssiData")) {
    fs.mkdirSync("./ssiData")
  }
  var filename = "ssi_" + getNow() + "_" + Date.now() + ".json"
  fs.writeFileSync("./ssiData/" + filename, postData)
  // Phản hồi với dữ liệu đã nhận được
  res.json({ message: 'Data received successfully!', code: "200", filename: filename });
});

var status = 0;
app.post('/api/postdetail', (req, res, next) => {
  let requestData = '';
  var total = req.headers['content-length'];
  console.log('Prepared POST request with data:', total);
  var progress = 0;
  status = 0;
  req.on('data', (chunk) => {
    progress += chunk.length;
    requestData += chunk;
    var perc = parseInt((progress / total) * 100);
    console.log('percent complete: ' + perc + '%\n');
    status = perc;
    // console.log()
  });
  // Lấy dữ liệu từ yêu cầu POST
  var postData = JSON.stringify(req.body);
  // Thực hiện xử lý với dữ liệu, ví dụ: in ra console
  console.log('Received POST request with data:', postData.length);
  if (!fs.existsSync("./ssiData")) {
    fs.mkdirSync("./ssiData")
  }
  var filename = "ssi_" + getNow() + "_" + Date.now() + ".json"
  fs.writeFileSync("./ssiData/" + filename, postData)
  // Phản hồi với dữ liệu đã nhận được
  res.json({ message: 'Data received successfully!', code: "200" });
  next()
});

function generateMD5(input) {
  const md5Hash = crypto.createHash('md5');
  md5Hash.update(input);
  return md5Hash.digest('hex');
}

let vf = (v) => {
  if (v) { return v } else return 0
}

const port = process.env.PORT || 3000;
const INTERVAL_DUMP = +process.env.INTERVAL_DUMP || 120000;
console.log("INTERVAL_DUMP", INTERVAL_DUMP)

// app.use(express.static('public'));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/examples', express.static(path.join(__dirname, 'examples')));

app.use('/images', express.static(path.join(__dirname, 'images')));

// Set up a route to handle the GET request for the images
app.get('/images/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  res.sendFile(path.join(__dirname, 'images', imageName));
});

// Serve the master page (index.html)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Serve each chart HTML page
for (let i = 1; i <= 10; i++) {
  app.get(`/chart${i}`, (req, res) => {
    res.sendFile(__dirname + `/public/chart${i}.html`);
  });
}


var enpoint = ['symbol', 'history', 'detail', 'chart2Row', 'timeline',
  'timelinemulti', 'timelinemultidays', 'sectors', 'sectorschart', 'stackbar', 'skybox',
  'skybox2', 'skyboxok', 'tooltips', 'skyboxX', 'skyboxX1', 'skyboxmi',
  'indicator', 'indicatorstatic', 'sectorschartratio', 'sectorsx', 'symbolbubble', 'symbolmabubble', 'vnindex'
]
enpoint.forEach(ep => {
  app.get(`/${ep}`, (req, res) => {
    res.sendFile(__dirname + `/public/${ep}.html`);
  });
})

// Emit dynamic data to connected clients via WebSocket
setInterval(() => {
  const dynamicData = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    data: Array(6).fill().map(() => Math.floor(Math.random() * 20)),
  };
  io.emit('updateData', dynamicData);
}, 2000);

let client = null;
let mapTopicClient = {}
let mapClient = {}
io.on('connection', (socket) => {
  const clientIP = socket.handshake.address;
  console.log(`Client connected with IP: ${clientIP}`, socket.id);
  // console.log('A user connected', JSON.stringify(socket));


  socket.on('subscriber', (message) => {
    mapClient[socket.id] = socket;
    console.log('Message from client: ', message);
    if (message.topic) {
      if (!mapTopicClient[message.topic]) mapTopicClient[message.topic] = {}
      mapTopicClient[message.topic][socket.id] = socket;
    }

    if (message.topic = 'updateDataSymbol') {
      if (lastSymbolData) {
        console.log('Emit lastSymbolData', Object.keys(lastSymbolData).length)
        socket.emit('updateDataSymbolAll', lastSymbolData)
      }

    }
    // io.emit('message-from-server', 'Server received: ' + message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);
    delete mapClient[socket.id]
    Object.keys(mapTopicClient).forEach(k => {
      if (mapTopicClient[k][socket.id]) delete mapTopicClient[k][socket.id]
    })
  });

  if (lastData)
    socket.emit('updateData', lastData);

  client = socket;
});
var mapIndicator;
app.get('/api/indicator', (req, res) => {
  console.log(`Req url`, req.url)

  const url = new URL('http://local.com/' + req.url);

  // Lấy tất cả các tham số truy vấn dưới dạng một đối tượng URLSearchParams
  const queryParams = url.searchParams;
  var force = queryParams.get('force');

  var f = "./indicator/indicator" + getNowDate() + ".json"
  if (!mapIndicator || force) {
    // && fs.existsSync(f)
    let files = fs.readdirSync("./indicator/")
    files = files.filter(e => e.endsWith(".json")).sort(function (a, b) {
      return b.localeCompare(a);
    });
    console.table(files)
    f = "./indicator/" + files[0]

    var buff = fs.readFileSync(f, "utf-8")
    mapIndicator = JSON.parse(buff);
    res.json(mapIndicator);
  } else {
    if (mapIndicator) {
      res.json(mapIndicator);
    } else {
      res.json({});
    }

  }

});

var mapIndicatorV2;
app.get('/api/indicatorv2', (req, res) => {
  console.log(`Req url`, req.url)

  const url = new URL('http://local.com/' + req.url);

  // Lấy tất cả các tham số truy vấn dưới dạng một đối tượng URLSearchParams
  const queryParams = url.searchParams;
  var force = queryParams.get('force');

  var f = "./indicatorV2/indicator" + getNowDate() + ".json"
  if (!mapIndicatorV2 || force) {
    // && fs.existsSync(f)
    let files = fs.readdirSync("./indicatorV2/")
    files = files.filter(e => e.endsWith(".json")).sort(function (a, b) {
      return b.localeCompare(a);
    });
    console.table(files)
    f = "./indicatorV2/" + files[0]

    var buff = fs.readFileSync(f, "utf-8")
    mapIndicatorV2 = JSON.parse(buff);
    res.json(mapIndicatorV2);
  } else {
    if (mapIndicatorV2) {
      res.json(mapIndicatorV2);
    } else {
      res.json({});
    }
  }

});

function stringToBoolean(str) {
  return typeof str === "string" && str.toLowerCase() === "true";
}

app.get('/api/investorData', (req, res) => {
  console.log(`Req url`, req.url)
  const url = new URL('http://local.com/' + req.url);
  const queryParams = url.searchParams;
  var recently = queryParams.get('recently');
  if (!recently) { recently = true; }
  else { recently = stringToBoolean(recently) }
  if (recently) {
    console.log("Request recently ", investorDataRecently.length)
    res.json(investorDataRecently);
  } else {
    console.log("Request All ", investorData.length)
    res.json(investorData);
  }
});

app.get('/api/data', (req, res) => {
  // Simulated dynamic data
  const dynamicData = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    data: Array(6).fill().map(() => Math.floor(Math.random() * 20)),
  };
  dynamicData.data[0] = priceModel.BIDASK["VNINDEX"]
  res.json(dynamicData);
});

app.get('/api/getsymbolsdata', (req, res) => {
  console.log(`Req url`, req.url)
  res.json(lastSymbolData);
});

app.get('/api/getsymbols', (req, res) => {
  res.json(map);
});

app.get('/api/index', (req, res) => {
  const url = new URL('http://local.com/' + req.url);
  const queryParams = url.searchParams;
  var querydate = queryParams.get('querydate');

  if (querydate && (querydate != getNowDate()) || Object.keys(index) == 0) {
    if (!dataStore[querydate]) {
      var f = './stockdump/stockdump_' + querydate + '.json';
      if (fs.existsSync(f)) {
        var buf = fs.readFileSync(f, "utf-8")
        var dd = JSON.parse(buf)
        dataStore[querydate] = dd;
      }
    }

    if (dataStore[querydate]) {
      var oldData = dataStore[querydate]["index"]
      res.json(oldData);
    } else {
      res.json([]);
    }
    return;
  }
  res.json(index);
});

app.get('/api/getactivesymbols', (req, res) => {
  let out = []
  Object.values(symbolDataSeries).forEach(e => {
    let t = vf(e.dataacum["bu_val"]) + vf(e.dataacum["sd_val"]) + vf(e.dataacum["unknown_val"])
    out.push({ symbol: e.dataacum.symbol, total: t })
  })
  // res.json(Object.keys(symbolDataSeries));
  res.json(out);
});

app.get('/api/getsymbolsaccum', (req, res) => {

  const url = new URL('http://local.com/' + req.url);
  const queryParams = url.searchParams;
  var querydate = queryParams.get('querydate');

  if (querydate && (querydate != getNowDate()) || Object.keys(symbolDataSeries) == 0) {
    if (!dataStore[querydate]) {
      var f = './stockdump/stockdump_' + querydate + '.json';
      if (fs.existsSync(f)) {
        var buf = fs.readFileSync(f, "utf-8")
        var dd = JSON.parse(buf)
        dataStore[querydate] = dd;
      }
    }

    if (dataStore[querydate]) {
      var oldData = dataStore[querydate]["symbolDataSeries"]
      let out = []
      Object.values(oldData).forEach(e => {
        out.push(e.dataacum)
      })
      res.json(out);
    } else {
      res.json([]);
    }
    return;
  }
  let out = []
  Object.values(symbolDataSeries).forEach(e => {
    out.push(e.dataacum)
  })
  res.json(out);
});
let timelines;
let timelinestat;
app.get('/api/timelines', (req, res) => {
  const url = new URL('http://local.com/' + req.url);
  const queryParams = url.searchParams;
  // var querydate = queryParams.get('querydate');
  var numberdate = queryParams.get('numberdate');
  if (!numberdate) {
    console.log('numberdate', numberdate)
    numberdate = 20
  } else {
    numberdate = +numberdate;
  }

  if (!timelines) {
    let files = fs.readdirSync("./stockdump")
    files = files.filter(e => e.endsWith(".json")).sort(function (a, b) {
      return b.localeCompare(a);
    }).slice(0, numberdate).filter(e => !e.includes(getNowDate()));
    console.table(files)
    let jsdata = {}
    let avg = {}
    for (var ff of files) {
      var f = './stockdump/' + ff;
      var buf = fs.readFileSync(f, "utf-8")
      var dd = JSON.parse(buf)
      var date = ff.slice(-13).slice(0, 8);
      console.log('Date ', date)
      dataStore[date] = dd;

      var oldData = dd["symbolDataSeries"]
      // Object.entries(oldData).forEach(([k, v], i) => {
      //   if (!jsdata[k]) {
      //     let v1 = {}
      //     Object.entries(v).forEach(e => {
      //       v1[e[1].T] = e[1];
      //     })
      //     jsdata[k] = v1;
      //   } else {
      //     Object.entries(v).forEach(e => {
      //       jsdata[k][e[1].T] = e[1];
      //     })
      //   }
      // })
      let pp = ["unknown_vol", "unknown_val", "sd_vol", "sd_val", "bu_vol", "bu_val", "bid_vol", "bid_val", "ask_vol", "ask_val"]
      let pp2 = { "unknown_vol": 1, "unknown_val": 2, "sd_vol": 3, "sd_val": 4, "bu_vol": 5, "bu_val": 6, "bid_vol": 7, "bid_val": 8, "ask_vol": 9, "ask_val": 10 }
      Object.entries(oldData).forEach(([k, v], i) => {

        let a = avg[k];
        if (!a) {
          avg[k] = {}
          a = avg[k]
        }
        if (a.Count) a.Count += 1
        else a.Count = 1;
        let sum = {}//{ "unknown_vol": 0, "unknown_val": 0, "sd_vol": 0, "sd_val": 0, "bu_vol": 0, "bu_val": 0, "bid_vol": 0, "bid_val": 0, "ask_vol": 0, "ask_val": 0 };
        pp.forEach(pe => {
          sum[pp2[pe]] = 0;
        })
        a["Sum" + formatDateShort(new Date(Object.values(v)[0].T * 1000))] = sum

        if (!a.timeline) a.timeline = {}
        let tl = a.timeline;

        Object.entries(v).forEach(e => {
          if (!tl[e[1].time]) {
            // tl[e[1].time] = { "unknown_vol": 0, "unknown_val": 0, "sd_vol": 0, "sd_val": 0, "bu_vol": 0, "bu_val": 0, "bid_vol": 0, "bid_val": 0, "ask_vol": 0, "ask_val": 0 }
            let tlv = {}
            pp.forEach(pe => {
              tlv[pp2[pe]] = 0;
            })
            tl[e[1].time] = tlv;
          }

          // pp.forEach(pe => {
          //   if (e[1][pe]) {
          //     tl[e[1].time][pe] += e[1][pe]
          //     sum[pe] += e[1][pe]
          //   }
          // })


          pp.forEach(pe => {
            if (e[1][pe]) {
              tl[e[1].time][pp2[pe]] += e[1][pe]
              sum[pp2[pe]] += e[1][pe]
            }
          })
        })

      })

    }
    timelines = avg;
    res.json(jsdata)
  } else {
    let jsdata = timelines;
    res.json(jsdata)
  }
});

app.get('/api/getsymboldataseries2', (req, res) => {

  const url = new URL('http://local.com/' + req.url);
  const queryParams = url.searchParams;
  var querydate = queryParams.get('querydate');

  if (querydate && (querydate != getNowDate()) || Object.keys(symbolDataSeries) == 0) {
    if (!dataStore[querydate]) {
      var f = './stockdump/stockdump_' + querydate + '.json';
      if (fs.existsSync(f)) {
        var buf = fs.readFileSync(f, "utf-8")
        var dd = JSON.parse(buf)
        dataStore[querydate] = dd;
      }
    }

    if (dataStore[querydate]) {
      var oldData = dataStore[querydate]["symbolDataSeries"]
      res.json(oldData);
    } else {
      res.json([]);
    }
    return;
  }
  res.json(symbolDataSeries);
});

app.get('/api/getsymboldataseries', (req, res) => {
  res.json(symbolDataSeries);
});


app.get('/api/getgroupdataseries', (req, res) => {
  res.json(groupDataSeries);
});

app.get('/api/getcountsymbols', (req, res) => {
  res.json(countSymbol);
});

let multiSectorDate
app.get('/api/sector', (req, res) => {
  const url = new URL('http://local.com/' + req.url);
  const queryParams = url.searchParams;
  var querydate = queryParams.get('querydate');
  var numberdate = queryParams.get('numberdate');
  if (!numberdate) {
    console.log('numberdate', numberdate)
    numberdate = 10
  } else {
    numberdate = +numberdate;
  }
  if (querydate && (querydate != getNowDate())) {
    if (querydate == 'a') {
      if (!multiSectorDate) {
        let files = fs.readdirSync("./stockdump")
        files = files.filter(e => e.endsWith(".json")).sort(function (a, b) {
          return b.localeCompare(a);
        }).slice(0, numberdate).filter(e => !e.includes(getNowDate()));
        console.table(files)
        let jsdata = {}
        for (var ff of files) {
          var f = './stockdump/' + ff;
          var buf = fs.readFileSync(f, "utf-8")
          var dd = JSON.parse(buf)
          var date = ff.slice(-13).slice(0, 8);
          console.log('Date ', date)
          dataStore[date] = dd;

          var oldData = dd["groupDataSeries"]
          Object.entries(oldData).forEach(([k, v], i) => {
            if (!jsdata[k]) {
              let v1 = {}
              Object.entries(v).forEach(e => {
                v1[e[1].T] = e[1];
              })
              jsdata[k] = v1;
            } else {
              Object.entries(v).forEach(e => {
                jsdata[k][e[1].T] = e[1];
              })
            }
          })


        }
        multiSectorDate = jsdata;

        Object.entries(groupDataSeries).forEach(([k, v], i) => {
          if (!jsdata[k]) {
            let v1 = {}
            Object.entries(v).forEach(e => {
              v1[e[1].T] = e[1];
            })
            jsdata[k] = v1;
          } else {
            Object.entries(v).forEach(e => {
              jsdata[k][e[1].T] = e[1];
            })
          }
        })
        res.json(jsdata)
      } else {

        let jsdata = multiSectorDate;
        Object.entries(groupDataSeries).forEach(([k, v], i) => {
          if (!jsdata[k]) {
            let v1 = {}
            Object.entries(v).forEach(e => {
              v1[e[1].T] = e[1];
            })
            jsdata[k] = v1;
          } else {
            Object.entries(v).forEach(e => {
              jsdata[k][e[1].T] = e[1];
            })
          }
        })
        res.json(jsdata)
      }
      return;
    }

    if (!dataStore[querydate]) {
      var f = './stockdump/stockdump_' + querydate + '.json';
      if (fs.existsSync(f)) {
        var buf = fs.readFileSync(f, "utf-8")
        var dd = JSON.parse(buf)
        dataStore[querydate] = dd;
      }
    }

    if (dataStore[querydate]) {
      var oldData = dataStore[querydate]["groupDataSeries"]
      res.json(oldData);
    } else {
      res.json({
      });
    }
    return;
  } else {
    res.json(groupDataSeries);
  }

});

let multidate;
app.get('/api/getsymbolsdata2', (req, res) => {
  console.log(`Req url`, req.url)
  const url = new URL('http://local.com/' + req.url);
  const queryParams = url.searchParams;
  var querydate = queryParams.get('querydate');

  if (querydate && (querydate != getNowDate())) {
    if (querydate == 'a') {
      if (!multidate) {
        let files = fs.readdirSync("./stockdump")
        files = files.filter(e => e.endsWith(".json")).sort(function (a, b) {
          return b.localeCompare(a);
        }).slice(0, 5).filter(e => !e.includes(getNowDate()));
        console.table(files)
        let jsdata = []
        for (var ff of files) {
          var f = './stockdump/' + ff;
          var buf = fs.readFileSync(f, "utf-8")
          var dd = JSON.parse(buf)
          var date = ff.slice(-13).slice(0, 8);
          console.log('Date ', date)
          dataStore[date] = dd;

          var oldData = dd["lastSymbolData"]
          let ad = Object.values(oldData).map(e => {
            return e.data.data;
          })
          jsdata.push(...ad)
        }
        multidate = [...jsdata];
        let ad = Object.values(lastSymbolData).map(e => {
          return e.data.data;
        })
        jsdata.push(...ad)
        res.json({
          md5: generateMD5(JSON.stringify(jsdata)),
          data: jsdata,
          recordsTotal: jsdata.length,
          recordsFiltered: jsdata.length
        });
      } else {

        let jsdata = [...multidate];
        let ad = Object.values(lastSymbolData).map(e => {
          return e.data.data;
        })
        jsdata.push(...ad)
        res.json({
          md5: generateMD5(JSON.stringify(jsdata)),
          data: jsdata,
          recordsTotal: jsdata.length,
          recordsFiltered: jsdata.length
        });
      }
      return;
    }

    if (!dataStore[querydate]) {
      var f = './stockdump/stockdump_' + querydate + '.json';
      if (fs.existsSync(f)) {
        var buf = fs.readFileSync(f, "utf-8")
        var dd = JSON.parse(buf)
        dataStore[querydate] = dd;
      }
    }

    if (dataStore[querydate]) {
      var oldData = dataStore[querydate]["lastSymbolData"]
      let jsdata = Object.values(oldData).map(e => {
        return e.data.data;
      })
      res.json({
        md5: generateMD5(JSON.stringify(jsdata)),
        data: jsdata,
        recordsTotal: jsdata.length,
        recordsFiltered: jsdata.length
      });
    } else {
      res.json({
        md5: generateMD5([]),
        data: [],
        recordsTotal: 0,
        recordsFiltered: 0
      });
    }
    return;
  }

  let jsdata = Object.values(lastSymbolData).map(e => {
    return e.data.data;
  })
  res.json({
    md5: generateMD5(JSON.stringify(jsdata)),
    data: jsdata,
    recordsTotal: jsdata.length,
    recordsFiltered: jsdata.length
  });
});

app.get('/api/getsectordata', (req, res) => {
  console.log(`Req url`, req.url)

  const url = new URL('http://local.com/' + req.url);
  const queryParams = url.searchParams;
  var querydate = queryParams.get('querydate');

  if (querydate && (querydate != getNowDate())) {
    if (!dataStore[querydate]) {
      var f = './stockdump/stockdump_' + querydate + '.json';
      if (fs.existsSync(f)) {
        var buf = fs.readFileSync(f, "utf-8")
        var dd = JSON.parse(buf)
        dataStore[querydate] = dd;
      }
    }

    if (dataStore[querydate]) {
      var oldData = dataStore[querydate]["groupDataSeries"]
      let jsdata = Object.values(oldData).map(e => {
        return e.dataacum;
      })
      res.json({
        md5: generateMD5(JSON.stringify(jsdata)),
        data: jsdata,
        recordsTotal: jsdata.length,
        recordsFiltered: jsdata.length
      });
    } else {
      res.json({
      });
    }
    return;
  } else {
    let jsdata = Object.values(groupDataSeries).map(e => {
      return e.dataacum;
    })
    res.json({
      md5: generateMD5(JSON.stringify(jsdata)),
      data: jsdata,
      recordsTotal: jsdata.length,
      recordsFiltered: jsdata.length
    });
  }
});

app.get('/api/getsectorcodelist', (req, res) => {
  res.json(sectorCodeList);
});


app.get('/api/symboldetaildays', (req, res) => {
  console.log(`Req url`, req.url)

  const url = new URL('http://local.com/' + req.url);

  // Lấy tất cả các tham số truy vấn dưới dạng một đối tượng URLSearchParams
  const queryParams = url.searchParams;
  var symbols = queryParams.get('symbols');
  if (!symbols) {
    return res.json({})
  }
  console.log('Symbol', symbols)

  if (symbols) {
    symbols = symbols.split(',')
  }
  var querydate = queryParams.get('querydate');
  if (!querydate) querydate = getNowDate()
  var days = queryParams.get('days');
  if (!days)
    days = 20
  let retdata = []

  // console.log('Read other days!')
  if (querydate) {
    let start = 1;
    if (querydate != getNowDate()) start = 0
    for (let d = start; d < days; d++) {
      let querydated = getBeforeDate(d, parseDateString(querydate));
      // console.log(querydated)
      if (querydated.weekend) continue;

      if (!dataStore[querydated.format]) {
        var f = './stockdump/stockdump_' + querydated.format + '.json';
        if (fs.existsSync(f)) {
          // console.log("Read ", f)
          var buf = fs.readFileSync(f, "utf-8")
          var dd = JSON.parse(buf)
          dataStore[querydated.format] = dd;
        }
      }
    }


    let out = symbols.forEach(s => {

      if (querydate == getNowDate()) {
        let jsdata = []
        let dataacum = []
        if (symbolDataSeries[s]) {
          jsdata = Object.keys(symbolDataSeries[s]).filter(k => k != 'dataacum').map(e => symbolDataSeries[s][e])
          dataacum = symbolDataSeries[s].dataacum
        }

        retdata.push({
          date: querydate ? querydate : getNowDate(),
          symbol: s,
          data: jsdata,
          dataacum: dataacum,
          recordsTotal: jsdata.length,
          recordsFiltered: jsdata.length
        })
      }

      for (let d = start; d < days; d++) {
        let querydated = getBeforeDate(d, parseDateString(querydate));
        if (querydated.weekend) continue;
        if (dataStore[querydated.format]) {
          var oldData = dataStore[querydated.format]["symbolDataSeries"]
          if (oldData[s]) {
            let jsdata = Object.keys(oldData[s]).filter(k => k != 'dataacum').map(e => oldData[s][e])
            let dataacum = oldData[s].dataacum
            retdata.push({
              date: querydated.format,
              symbol: s,
              data: jsdata,
              dataacum: dataacum,
              recordsTotal: jsdata.length,
              recordsFiltered: jsdata.length
            })
          }
        }
      }

      return {};
    })


    let md5 = generateMD5(JSON.stringify(retdata))
    // console.log("md5", md5)
    // console.table(retdata)
    res.json({ md5: md5, data: retdata });

    return;
  }

  res.json({});
});

app.get('/api/symboldetail', (req, res) => {
  console.log(`Req url`, req.url)

  const url = new URL('http://local.com/' + req.url);

  // Lấy tất cả các tham số truy vấn dưới dạng một đối tượng URLSearchParams
  const queryParams = url.searchParams;
  var symbols = queryParams.get('symbols');
  if (!symbols) {
    return res.json({})
  }
  console.log('Symbol', symbols)

  if (symbols) {
    symbols = symbols.split(',')
  }
  var querydate = queryParams.get('querydate');

  if (querydate && (querydate != getNowDate())) {
    if (!dataStore[querydate]) {
      var f = './stockdump/stockdump_' + querydate + '.json';
      if (fs.existsSync(f)) {
        var buf = fs.readFileSync(f, "utf-8")
        var dd = JSON.parse(buf)
        dataStore[querydate] = dd;
      }
    }

    if (dataStore[querydate]) {
      var oldData = dataStore[querydate]["symbolDataSeries"]
      let out = symbols.map(s => {
        let jsdata = []
        let dataacum = []
        if (oldData[s]) {
          jsdata = Object.keys(oldData[s]).filter(k => k != 'dataacum').map(e => oldData[s][e])
          dataacum = oldData[s].dataacum
        }
        return {
          symbol: s,
          data: jsdata,
          dataacum: dataacum,
          recordsTotal: jsdata.length,
          recordsFiltered: jsdata.length
        }
      })

      let md5 = generateMD5(JSON.stringify(out))
      res.json({ md5: md5, data: out });
    } else {
      res.json({
      });
    }
    return;
  }

  let out = symbols.map(s => {
    let jsdata = []
    let dataacum = []
    if (symbolDataSeries[s]) {
      jsdata = Object.keys(symbolDataSeries[s]).filter(k => k != 'dataacum').map(e => symbolDataSeries[s][e])
      dataacum = symbolDataSeries[s].dataacum
    }
    return {
      symbol: s,
      data: jsdata,
      dataacum: dataacum,
      recordsTotal: jsdata.length,
      recordsFiltered: jsdata.length
    }
  })

  let md5 = generateMD5(JSON.stringify(out))
  res.json({ md5: md5, data: out });
});

app.get('/api/vnindexdata', (req, res) => {
  console.log(`Req url`, req.url)

  const url = new URL('http://local.com/' + req.url);

  // Lấy tất cả các tham số truy vấn dưới dạng một đối tượng URLSearchParams
  const queryParams = url.searchParams;
  var querydate = queryParams.get('querydate');

  if (querydate && (querydate != getNowDate())) {
    if (!dataStore[querydate]) {
      var f = './stockdump/stockdump_' + querydate + '.json';
      if (fs.existsSync(f)) {
        var buf = fs.readFileSync(f, "utf-8")
        var dd = JSON.parse(buf)
        dataStore[querydate] = dd;
      }
    }
    if (dataStore[querydate]) {
      var oldData = dataStore[querydate]["vnindexdata"]
      let md5 = generateMD5(JSON.stringify(oldData))
      res.json({ md5: md5, data: oldData });
    } else {
      res.json({
      });
    }
    return;
  }

  let md5 = generateMD5(JSON.stringify(lastData))
  res.json({ md5: md5, data: lastData });
});

app.get('/api/sectordetail', (req, res) => {
  console.log(`Req url`, req.url)

  const url = new URL('http://local.com/' + req.url);

  // Lấy tất cả các tham số truy vấn dưới dạng một đối tượng URLSearchParams
  const queryParams = url.searchParams;
  var sectors = queryParams.get('sectors');
  if (!sectors) {
    return []
  }
  console.log('Symbol', sectors)

  if (sectors) {
    sectors = sectors.split(',')
  }


  let out = sectors.map(s => {
    let jsdata = []
    let dataacum = []
    if (groupDataSeries[s]) {
      jsdata = Object.keys(groupDataSeries[s]).filter(k => k != 'dataacum').map(e => groupDataSeries[s][e])
      dataacum = groupDataSeries[s].dataacum
    }
    return {
      name: s,
      data: jsdata,
      dataacum: dataacum,
      recordsTotal: jsdata.length,
      recordsFiltered: jsdata.length
    }
  })

  let md5 = generateMD5(JSON.stringify(out))
  res.json({ md5: md5, data: out });
});


async function serverX() {

  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

}

serverX()

const { Worker } = require("worker_threads");
const { fstat } = require('fs');

const worker = new Worker("./worker.js");
let lastData = null;
let countSymbol = 0;
let countUpdate = 0;
let lastSymbolData = {}
let symbolDataSeries = {}
let groupDataSeries = {}
let index = {}
let TMAX = 0;
let dataStore = {}

worker.on("message", (data) => {
  emitData(data)
});

let mapLastData = {}

function dumpData() {
  if (TMAX === 0) return;
  var dd = dataStore[formatDate(new Date(TMAX * 1000))];
  if (!dd) { dd = {}; dataStore[formatDate(new Date(TMAX * 1000))] = dd }
  dd["symbolDataSeries"] = symbolDataSeries;
  dd["groupDataSeries"] = groupDataSeries;
  dd["lastSymbolData"] = lastSymbolData;
  dd["index"] = index;
  dd["vnindexdata"] = lastData;
  dd.date = formatDate(new Date(TMAX * 1000))
  var dir = './stockdump';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  fs.writeFile(dir + "/stockdump_" + formatDate(new Date(TMAX * 1000)) + ".json", JSON.stringify(dd), (err) => { })
}

setInterval(dumpData, INTERVAL_DUMP)

function emitData(data) {
  if (data.type == '0') {
    lastData = data
    io.volatile.emit('updateData', data);
    countUpdate++;
    if (countUpdate % 1000 == 0) { console.log("Count Update", countUpdate, countSymbol) }

  } else if (data.type == '1') {
    countSymbol++;
    lastSymbolData[data.data.data[0]] = data
    if (countSymbol % 1000 == 0) { console.log("Count symbols", countSymbol) }
    io.volatile.emit('updateDataSymbol', data);
  } else if (data.type == '2') {
    // countSymbol++;
    if (!symbolDataSeries[data.data.symbol]) symbolDataSeries[data.data.symbol] = {}
    symbolDataSeries[data.data.symbol][data.data.time] = data.data
    symbolDataSeries[data.data.symbol].dataacum = data.dataacum
    if (TMAX < data.data.T) {
      TMAX = data.data.T;
    }
  } else if (data.type == '3') {
    // countSymbol++;
    if (!groupDataSeries[data.data.code]) groupDataSeries[data.data.code] = {}
    groupDataSeries[data.data.code][data.data.time] = data.data
    groupDataSeries[data.data.code].dataacum = data.dataacum
  } else if (data.type == '4') {
    // countSymbol++;
    if (!groupDataSeries[data.data.code]) groupDataSeries[data.data.code] = {}
    groupDataSeries[data.data.code][data.data.time] = data.data
    groupDataSeries[data.data.code].dataacum = data.dataacum
  }
  else if (data.type == '5') {
    Object.entries(data.data).forEach((e) => {
      index[e[0]] = e[1]
    })
  }
}

let workerQueue = []

let start = 0;
let count = 0
let running = false;
async function emit() {
  if (running) return;
  running = true;
  if (workerQueue.length > 0 && start == 0) start = Date.now() - 1;
  while (workerQueue.length > 0) {
    let data = workerQueue.shift();
    emitData(data)
    count++;
    if (count * 1000 / (Date.now() - start) > 800) {
      break;
    }
    if (count % 1000 == 0) {
      console.log("count", count, "tps", count * 1000 / (Date.now() - start))
    }

  }
  running = false;
}

setInterval(() => {
  emit()
}, 10000)
worker.on("error", (msg) => {
  console.log('Worker thread error', msg)
});


function wait(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(0);
    }, ms);
  });
}


const query = new Worker("./query_worker.js");

query.postMessage({ 'hello': 'hello' })


const investorWorker = new Worker("./investor.js");

var investorData;
var investorDataRecently;
investorWorker.on("message", (data) => {
  if (data.recently) { investorDataRecently = data.data } else { investorData = data.data; }
});