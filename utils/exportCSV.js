const { Parser } = require("json2csv");

const exportCSV = (
  data,
  fileName,
  res
) => {
  const parser = new Parser();

  const csv = parser.parse(data);

  res.header(
    "Content-Type",
    "text/csv"
  );

  res.attachment(
    `${fileName}.csv`
  );

  return res.send(csv);
};

module.exports = exportCSV;