import express from "express";
import axios from "axios";
import { load } from "cheerio";
import { validateRequest } from "./middleware.js";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import { parse } from 'csv-parse';



const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());
app.use('/data', express.static('data'));

app.get("/api/livedraw-macau", validateRequest, async (req, res) => {
    try {
        const response = await axios.get("https://rgb.team/live-draw-macau");

        const $ = load(response.data);
        const tableData = [];

        $("table.entry-ld-table tbody.entry-ld-body tr").each(
            (index, element) => {
                const rowData = [];
                $(element)
                    .find("td")
                    .each((i, cell) => {
                        rowData.push($(cell).text());
                    });
                tableData.push(rowData);
            }
        );

        let result = {};
        result.title = tableData[0];
        result.header = tableData[1];
        result.data = tableData[2];
        result.timestamp = Date.now();

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/api/data-macau", async (req, res) => {
    try {
        const response = await axios.get("https://rgb.team/data-macau");

        const $ = load(response.data);
        
        // Initialize an empty array to store the data
        let data = [];

        const table = $('.TableKeluaran');
        // Iterate through each table row starting from the second row (skipping the header)
        $('tr', table).slice(1).each((i, row) => {
        const rowData = [];

        // Iterate through each cell in the row
        $('td', row).each((j, cell) => {
            rowData.push($(cell).text().trim());
        });

        // Push the row data to the 'data' array
        data.push(rowData);
        });

        data.splice(0,3)
        // Create the JSON object as you described
        const result = { data };

        // console.log(JSON.stringify(result, null, 2));

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/api", (req, res) => {
    res.json("ok");
});


// Define a route to handle incoming data from the frontend
app.post('/api/lombahito', (req, res) => {
    try {
      const csvFileName = 'data/lombatebak.csv';
      // Load the existing CSV file if it exists
      let existingData = [];
      if (fs.existsSync(csvFileName)) {
        existingData = fs.readFileSync(csvFileName, 'utf8').split('\n');
      }
  
      // Calculate the new 'No' value based on existing data
      const no = existingData.length > 0 ? existingData.length : 1;
  
      // Get data from the request body
      const { Username, Pasangan, NamaRekening, NomorRekening, Vendor } = req.body;
  
      // Get the current date and time in Jakarta Timezone
      const currentDate = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        hourCycle: 'h24',
      }).replace(/,/g, ' ');
      
  
      // Create a new data row
      const newRow = `${no},${Username},${currentDate},${Pasangan},${NamaRekening},${NomorRekening},${Vendor}`;
  
      // Append the new data to the CSV file
      fs.appendFileSync(csvFileName, newRow + '\n');
  
      res.json(newRow);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error saving data' });
    }
  });


  app.get('/readlombahito', (req, res) => {
    const file = 'data/lombatebak.csv';

  
    const data = fs.readFileSync(file)
    parse(data, (err, records) => {
      if (err) {
        console.error(err)
        return res.status(400).json({success: false, message: 'An error occurred'})
      }
  
      return res.json({data: records})
    })
  })

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
