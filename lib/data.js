import fs from "fs";
import path from "path";

// const dataDirectory = path.join(process.cwd(), "data");

export function getData() {
  // Get file names under /data
  const fileNames = fs.readdirSync(dataDirectory);
  const allData = fileNames.reduce(function (acc, fileName) {
    // Remove ".json" from file name to get filename
    const key = fileName.replace(/\.json$/, "");

    const fullPath = path.join(dataDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const obj = JSON.parse(fileContents);
    acc[key] = obj;
    return acc;
  }, {});
  return allData;
}

export function getAllData() {
  let basePath = process.cwd();
  if (process.env.NODE_ENV === "production") {
    basePath = path.join(process.cwd(), ".next/server/chunks");
  }
  const fullPath = path.join(basePath, "data/data2.json");
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const obj = JSON.parse(fileContents);
  return obj;
}
