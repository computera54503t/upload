import express from "express";
import axios from "axios";
import { load } from "cheerio";
import { validateRequest } from "./middleware.js";
import cors from "cors";
const app = express();
const port = 8000;

app.use(cors());

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

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
