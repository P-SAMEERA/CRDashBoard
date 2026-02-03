import * as XLSX from "xlsx";

const ExcelUploader = ({ onDataParsed }) => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });

      // Single sheet only (OVERALL CRs)
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet);

      onDataParsed(rows);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <label className="text-xs text-gray-400 cursor-pointer hover:text-gray-200 transition">
      upload excel
      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={handleFileUpload}
        className="hidden"
      />
    </label>
  );
};

export default ExcelUploader;
