import ExcelJS from 'exceljs';

class WorkbookService {
    constructor() {
        // No specific client needed for ExcelJS, but we can set default properties
        this.defaultCreator = 'Tale of DDH';
    }

    async createExcelFromJson(data, file, folder) {
        // Create a Workbook
        const workbook = new ExcelJS.Workbook();

        // Set workbook properties
        workbook.creator = this.defaultCreator;
        workbook.modified = new Date();

        // Force workbook calculation on load
        workbook.calcProperties.fullCalcOnLoad = true;

        for(let i = 0; i < data.tabs.length; i++) {
            // Create a new worksheet for each tab
            const worksheet = workbook.addWorksheet(data.tabs[i].name.replace('/', '-'));

            for(let j = 0; j < data.tabs[i].rows.length; j++) {
                if (j === 0) {
                    // Add Header
                    const headers = Object.keys(data.tabs[i].rows[j]).map((item, index) => {
                        const cell = worksheet.getCell(j + 1, index + 1);
                        cell.style = {
                            font: { name: 'Open Sans', bold: true, size: 11, color: {argb: '22262A'} },
                            alignment: { vertical: 'middle', horizontal: 'center' },
                            border: { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} },
                            fill: { type: 'pattern', pattern:'solid', fgColor:{argb:'CFECEC'} }
                        }
                        return {
                            header: data.tabs[i].rows[j][item],
                            key: item,
                            wrapText: true
                        }
                    });
                    worksheet.columns = headers;

                } else {
                    // Add Row
                    worksheet.addRow(data.tabs[i].rows[j]);
                    for(let k = 0; k < Object.keys(data.tabs[i].rows[j]).length; k++) {
                        const cell = worksheet.getCell( j + 1, k + 1);
                        cell.style = {
                            font: { name: 'Open Sans', bold: false, size: 10, color: {argb: '22262A'} },
                            alignment: { vertical: 'middle', horizontal: 'center' },
                            border: { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} },
                            fill: { type: 'pattern', pattern:'solid', fgColor:{argb:'F7F7F7'} }
                        }
                    }
                }
                this.adjustColumnWidth(worksheet);
            }
        }

        // Write to a file
        await workbook.xlsx.writeFile(folder + '/' + file + '.xlsx');

        return {
            folder: folder,
            fileName: file + '.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
    }

    adjustColumnWidth(worksheet) {
        worksheet.columns.forEach((column) => {
            const lengths = column.values.map((v) => v.toString().length + 5);
            column.width = Math.max(...lengths.filter(v => typeof v === 'number'));
        });
    }
}

// Export a singleton instance
const workbookService = new WorkbookService();
export const createExcelFromJson = (data, file, folder) => workbookService.createExcelFromJson(data, file, folder);