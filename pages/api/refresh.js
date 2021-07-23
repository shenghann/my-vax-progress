// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getAllData } from "../../lib/data";

// export default async function refresh(req, res) {
//   const allData = await getAllData();
//   res.status(200).json(allData);
// }

module.exports = (req, res) => {
  const allData = getAllData();
  res.status(200).json(allData);
};
