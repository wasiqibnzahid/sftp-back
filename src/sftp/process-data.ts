// import { Product } from "../models/product-model";
import xml2js from "xml2js";
import SftpClient from "ssh2-sftp-client";
import { sftpConfigArray } from "./config";
import * as fs from "fs/promises";
import * as unzipper from "unzipper";
import csv from "csv-parser"; // To parse the CSV data
import { createReadStream } from "fs";
import path from "path";
import { Product } from "../models/product-model";

// Process data for companies with plain text format
export async function processAndStoreDataFromText(
  company: string,
  data: string
) {
  const rows = data.split("\n").filter((line) => line.trim() !== "");

  for (const row of rows) {
    const [
      product_id,
      available_quantity,
      available_next_date,
      available_next_quantity,
      availability_date,
      availability_time,
    ] = row.split(/\s+/);
    console.log("INFO IS ", {
      product_id,
      company,
      available_quantity: parseInt(available_quantity, 10),
      available_next_date:
        available_next_date !== "0" ? available_next_date : null,
      available_next_quantity: parseInt(available_next_quantity, 10),
      availability_date,
      availability_time,
    });

    // Uncomment the code below to insert the data into the DB
    // await Product.upsert({
    //   product_id,
    //   company,
    //   available_quantity: parseInt(available_quantity, 10),
    //   available_next_date: available_next_date !== "0" ? available_next_date : null,
    //   available_next_quantity: parseInt(available_next_quantity, 10),
    //   availability_date,
    //   availability_time,
    // });
  }
}

export async function processAndStoreDataFromCSV(company: string, data: any[]) {
  const dataToInsert = {};
  for (const row of data) {
    let productData: any;

    if (company === "Copaco") {
      // Process the Copaco format
      const {
        Fabrikantscode: product_id,
        "Copaco vrije voorraad": available_quantity,
        "Copaco datum eerstvolgende ontvangst": available_next_date,
        "Copaco aantal eerstvolgende ontvangst": available_next_quantity,
        "Datum:": availability_date,
      } = row;

      productData = {
        product_id,
        company,
        available_quantity: parseInt(available_quantity, 10),
        available_next_date:
          available_next_date !== "0" ? available_next_date : null,
        available_next_quantity: parseInt(available_next_quantity, 10),
        availability_date,
        // availability_time,
      };
    } else if (company === "EET") {
      // Process the EET format
      const {
        "Manufacturer Part No": product_id,
        "Home stock": available_quantity_home,
        "Remote stock": available_quantity_remote,
        "Incoming Date": available_next_date,
        "Incoming Qty": available_next_quantity,
        Description: description,
        "Web Picture URL": img_url,
        "Customers Price": priceStr,
      } = row;
      const price = Number(priceStr.replace(",", "."));
      const available_quantity =
        Number(available_quantity_remote?.replace(",", ".")) +
        Number(available_quantity_home?.replace(",", "."));
      productData = {
        product_id,
        company,
        available_quantity: available_quantity,
        available_next_date,
        available_next_quantity:
          parseFloat(available_next_quantity.replace(",", ".")) || 0,
        description,
        img_url,
        price,
      };
    } else {
      console.log(`Unsupported company format for ${company}`);
      continue; // Skip unsupported formats
    }

    // console.log("INFO IS ", productData);

    // Uncomment the code below to insert the data into the DB
    // await Product.upsert(productData);
    dataToInsert[productData.product_id] = productData;
  }
  await Product.destroy({
    where: {
      company: company,
    },
  });
  await Product.bulkCreate(Object.values(dataToInsert).filter((item) => item));
  // for(let i =0; i< dataToInsert.length; i++)
  // {
  //   await Product.create(dataToInsert[i]).catch(e => {
  //     console.error(e);
  //     throw e
  //   });
  // }
}

export async function downloadAndProcessFiles() {
  const tempDir = path.join(process.env.HOME || "", "tmp"); // Set temp path to ~/tmp

  for (const { company, config } of sftpConfigArray) {
    const sftp = new SftpClient();
    try {
      console.log("CONNECTING TO ", company);
      await sftp.connect(config);
      console.log(`Connected to ${company}'s SFTP server`);

      // Download the file
      let fileData: Buffer = null;
      if (company === "EET") {
        // Use fastGet for EET
        const tempFilePath = path.join(tempDir, `${company}_data.csv`);
        await sftp.fastGet(config.filePath, tempFilePath);
        console.log("EET FILE DOWNLOADED USING fastGet");

        // Read the file directly
        fileData = await fs.readFile(tempFilePath);
      } else {
        // Use get for other companies
        fileData = (await sftp.get(config.filePath)) as Buffer;
        console.log("FILE DOWNLOADED");
      }

      if (company === "Copaco") {
        // Handle ZIP format for Copaco
        const zipFilePath = path.join(tempDir, `${company}_data.zip`);

        try {
          await fs.mkdir(tempDir, { recursive: true });
        } catch (e) {}

        await fs.writeFile(zipFilePath, fileData);
        console.log("DONE WRITING");

        const extractedPath = path.join(tempDir, `${company}_extracted`);
        await fs.mkdir(extractedPath, { recursive: true });

        console.log("EXTRACTING ZIP FILE...");
        await createReadStream(zipFilePath)
          .pipe(unzipper.Extract({ path: extractedPath }))
          .promise();
        console.log("ZIP FILE EXTRACTED");

        const extractedFilePath = path.join(extractedPath, "COPACO_ATP.csv");
        if (!(await fs.stat(extractedFilePath)).isFile()) {
          throw new Error(`Extracted file not found: ${extractedFilePath}`);
        }

        // Parse CSV data
        const dataRows: any[] = [];
        await new Promise<void>((resolve, reject) => {
          createReadStream(extractedFilePath)
            .pipe(csv())
            .on("data", (row) => dataRows.push(row))
            .on("end", resolve)
            .on("error", reject);
        });
        console.log("CSV FILE PARSED");

        // Process and store CSV data for Copaco
        await processAndStoreDataFromCSV(company, dataRows);
      } else if (company === "EET") {
        // Handle the EET CSV format directly
        const dataRows: any[] = [];

        await new Promise<void>((resolve, reject) => {
          const stream = createReadStream(
            path.join(tempDir, `${company}_data.csv`)
          )
            .pipe(csv({ separator: ";" })) // Using ';' as the delimiter
            .on("data", async (row) => {
              dataRows.push(row);
            })
            .on("end", async () => {
              // Process any remaining rows
              if (dataRows.length > 0) {
                await processAndStoreDataFromCSV(company, dataRows);
              }
              resolve();
            })
            .on("error", reject);
        });
        console.log("EET CSV FILE PARSED AND PROCESSED");
      } else if (company === "Travion") {
        // Handle the Travion XML format
        const xmlFilePath = path.join(tempDir, `${company}_data.xml`);
        await fs.writeFile(xmlFilePath, fileData);
        console.log("TRAVION XML FILE WRITTEN");

        const xmlData = await fs.readFile(xmlFilePath, "utf-8");
        const parser = new xml2js.Parser();

        parser.parseString(xmlData, async (err, result) => {
          if (err) {
            throw new Error(`Error parsing XML for ${company}: ${err.message}`);
          }
          const products = result.CATALOG.Products[0].Product;
          console.log("LEN INS ", products.length);
          const map: any = {};
          const dataRows = products.forEach((product: any) => {
            const item = product.Item?.find((Item) => {
              return Item?.["$"]?.Type == "O";
            });
            if (!item || !item?.ItemCode[0]) {
              return null;
            }
            map[item?.ItemCode[0]] = {
              item_code: item?.ItemCode[0],
              stock: parseInt(product.Stock[0], 10),
              company: company,
            };
          });

          // Process and store XML data
          await processAndStoreDataFromTravion(
            company,
            Object.values(map).filter((item) => item)
          );
        });
      }
      // else if (company === "Also") {
      //   const data = fileData.toString();
      //   await processAndStoreDataFromText(company, data);
      // }
      else {
        console.log(`Unsupported company format for ${company}`);
      }

      console.log(`Data for ${company} processed and stored in DB.`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(console.dir(error));
      } else {
        console.log("Unexpected non-error type:", error);
      }
    } finally {
      await sftp.end();
    }
  }
}

async function processAndStoreDataFromTravion(company: string, data: any[]) {
  if (data?.length > 0) {
    await Product.destroy({
      where: {
        company: company,
      },
    });
    await Product.bulkCreate(
      data.map((row) => ({
        product_id: row.item_code,
        available_quantity: row.stock,
        company,
      }))
    );
    console.log("ZE DONE");
  }
}
